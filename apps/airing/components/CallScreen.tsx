
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Persona, Difficulty, ConversationMode, Message } from '../types';
import { GEMINI_API_KEY } from '../services/geminiService';
import StatusBar from './StatusBar';
import { Mic, Volume2, VolumeX, PhoneOff, Phone, Send } from 'lucide-react';

const WS_URL = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';
const MODEL = 'models/gemini-2.5-flash-native-audio-preview-12-2025';

function ab2b64(buf: ArrayBuffer): string {
  const u8 = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < u8.length; i += 8192)
    s += String.fromCharCode.apply(null, Array.from(u8.subarray(i, i + 8192)));
  return btoa(s);
}

function b642ab(b64: string): ArrayBuffer {
  const s = atob(b64);
  const u8 = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) u8[i] = s.charCodeAt(i);
  return u8.buffer;
}

function f32toi16(f: Float32Array): Int16Array {
  const o = new Int16Array(f.length);
  for (let i = 0; i < f.length; i++) {
    const s = Math.max(-1, Math.min(1, f[i]));
    o[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return o;
}

function downsample(buf: Float32Array, from: number, to: number): Float32Array {
  if (from === to) return buf;
  const r = from / to;
  const len = Math.round(buf.length / r);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const idx = i * r;
    const lo = Math.floor(idx);
    out[i] = buf[lo] * (1 - (idx - lo)) + (buf[Math.min(lo + 1, buf.length - 1)] || 0) * (idx - lo);
  }
  return out;
}

interface CallScreenProps {
  persona: Persona;
  mode: ConversationMode;
  difficulty: Difficulty;
  scenario: string;
  onEnd: (history: Message[]) => void;
}

const CallScreen: React.FC<CallScreenProps> = ({ persona, mode, difficulty, scenario, onEnd }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMutedAI, setIsMutedAI] = useState(false);
  const [transcription, setTranscription] = useState({ user: '', ai: '' });
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [micPermissionStatus, setMicPermissionStatus] = useState<string>('prompt');

  const scrollRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const acInRef = useRef<AudioContext | null>(null);
  const acOutRef = useRef<AudioContext | null>(null);
  const srcRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const procRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const historyRef = useRef<Message[]>([]);
  const isEndingRef = useRef(false);

  const isRecordingRef = useRef(false);
  const isMutedAIRef = useRef(false);
  const outBuf = useRef('');
  const inBuf = useRef('');

  const audioQueue = useRef<string[]>([]);
  const playingRef = useRef(false);
  const nextStartTimeRef = useRef(0);

  const pendingAudioQueue = useRef<string[]>([]);
  const pendingAiMessages = useRef<Message[]>([]);

  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);
  useEffect(() => { isMutedAIRef.current = isMutedAI; }, [isMutedAI]);

  useEffect(() => {
    if (!isStarted) {
      (async () => {
        if (navigator.permissions) {
          try {
            const ps = await navigator.permissions.query({ name: 'microphone' as PermissionName });
            setMicPermissionStatus(ps.state);
            ps.onchange = () => setMicPermissionStatus(ps.state);
          } catch { /* ignore */ }
        }
      })();
    }
  }, [isStarted]);

  const playQueue = useCallback(() => {
    if (playingRef.current || audioQueue.current.length === 0) return;
    playingRef.current = true;
    setIsAiSpeaking(true);

    const drain = () => {
      if (!acOutRef.current || acOutRef.current.state === 'closed') {
        acOutRef.current = new AudioContext({ sampleRate: 24000 });
      }
      const ctx = acOutRef.current;

      while (audioQueue.current.length > 0) {
        const chunk = audioQueue.current.shift()!;
        if (isMutedAIRef.current) continue;

        const pcm = b642ab(chunk);
        const i16 = new Int16Array(pcm);
        const f32 = new Float32Array(i16.length);
        for (let i = 0; i < i16.length; i++) f32[i] = i16[i] / 32768;

        const buf = ctx.createBuffer(1, f32.length, 24000);
        buf.copyToChannel(f32, 0);
        const s = ctx.createBufferSource();
        s.buffer = buf;
        s.connect(ctx.destination);

        const now = ctx.currentTime;
        const start = Math.max(now, nextStartTimeRef.current);
        s.start(start);
        nextStartTimeRef.current = start + buf.duration;

        s.onended = () => {
          if (audioQueue.current.length > 0) {
            drain();
          } else {
            playingRef.current = false;
            setIsAiSpeaking(false);
          }
        };
      }
    };

    drain();
  }, []);

  const stopAllAudio = () => {
    audioQueue.current = [];
    playingRef.current = false;
    nextStartTimeRef.current = 0;
    setIsAiSpeaking(false);
  };

  const handleEndCall = () => {
    if (isEndingRef.current) return;
    isEndingRef.current = true;
    stopAllAudio();
    wsRef.current?.close();
    procRef.current?.disconnect();
    srcRef.current?.disconnect();
    acInRef.current?.close();
    acOutRef.current?.close();
    streamRef.current?.getTracks().forEach(t => t.stop());
    onEnd(historyRef.current, true);
  };

  const toggleMic = () => {
    if (!isLive) return;

    if (!isRecording) {
      setIsRecording(true);
      isRecordingRef.current = true;
      stopAllAudio();
      inBuf.current = '';
      outBuf.current = '';
      pendingAudioQueue.current = [];
      pendingAiMessages.current = [];
      setTranscription({ user: '', ai: '' });
    } else {
      const finalUserText = inBuf.current.trim();
      if (finalUserText) {
        const userMsg: Message = { role: 'user', text: finalUserText };
        setMessages(prev => [...prev, userMsg]);
        historyRef.current.push(userMsg);
      }

      setIsRecording(false);
      isRecordingRef.current = false;
      setMicLevel(0);

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          realtimeInput: { audioStreamEnd: true },
        }));
        wsRef.current.send(JSON.stringify({
          clientContent: { turnComplete: true },
        }));
      }

      if (pendingAudioQueue.current.length > 0) {
        pendingAudioQueue.current.forEach(chunk => {
          audioQueue.current.push(chunk);
        });
        pendingAudioQueue.current = [];
        playQueue();
      }

      if (pendingAiMessages.current.length > 0) {
        setMessages(prev => [...prev, ...pendingAiMessages.current]);
        historyRef.current = [...historyRef.current, ...pendingAiMessages.current];
        pendingAiMessages.current = [];
      }

      setTranscription(prev => ({ ...prev, user: '' }));
    }
  };

  const acceptCall = async () => {
    setIsStarted(true);

    try {
      if (navigator.permissions) {
        try {
          const ps = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          if (ps.state === 'denied') {
            alert('마이크 권한이 거부되었습니다.\n\n브라우저 설정에서 마이크 권한을 허용해주세요.');
            setIsStarted(false);
            onEnd([], true);
            return;
          }
        } catch { /* ignore */ }
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
      } catch (err: any) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          alert('마이크 접근 권한이 필요합니다.');
          setIsStarted(false);
          onEnd([], true);
          return;
        }
        throw err;
      }
      streamRef.current = stream;

      const ac = new AudioContext();
      if (ac.state === 'suspended') await ac.resume();
      acInRef.current = ac;
      acOutRef.current = new AudioContext({ sampleRate: 24000 });

      const src = ac.createMediaStreamSource(stream);
      srcRef.current = src;
      const proc = ac.createScriptProcessor(4096, 1, 1);
      procRef.current = proc;
      const silent = ac.createGain();
      silent.gain.value = 0;
      src.connect(proc);
      proc.connect(silent);
      silent.connect(ac.destination);

      const apiKey = GEMINI_API_KEY;
      const socket = new WebSocket(`${WS_URL}?key=${apiKey}`);
      wsRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket opened, sending setup...');
        socket.send(JSON.stringify({
          setup: {
            model: MODEL,
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: persona.voice } } },
            },
            systemInstruction: { parts: [{ text: persona.systemPrompt }] },
            outputAudioTranscription: {},
            inputAudioTranscription: {},
          },
        }));
      };

      socket.onmessage = async (ev) => {
        if (isEndingRef.current) return;

        let raw = ev.data;
        if (raw instanceof Blob) raw = await raw.text();
        else if (raw instanceof ArrayBuffer) raw = new TextDecoder().decode(raw);
        if (typeof raw !== 'string') {
          console.warn('비문자열 메시지 수신:', typeof raw, raw);
          return;
        }

        let data: any;
        try { data = JSON.parse(raw); } catch (e) {
          console.warn('JSON 파싱 실패:', raw.substring(0, 300));
          return;
        }
        console.log('서버 메시지:', Object.keys(data).join(', '), JSON.stringify(data).substring(0, 200));

        if (data.setupComplete) {
          console.log('✅ setupComplete received');
          setIsLive(true);

          const prompt = scenario
            ? `Let's practice English about "${scenario}". My level is ${difficulty}. Start by greeting me in 1-2 short sentences.`
            : `My level is ${difficulty}. Let's have a chat. Start by greeting me in 1-2 short sentences.`;
          socket.send(JSON.stringify({
            clientContent: {
              turns: [{ role: 'user', parts: [{ text: prompt }] }],
              turnComplete: true,
            },
          }));

          proc.onaudioprocess = (e) => {
            if (isEndingRef.current || !isRecordingRef.current || socket.readyState !== 1) return;
            const rawPcm = e.inputBuffer.getChannelData(0);
            const ds = downsample(rawPcm, ac.sampleRate, 16000);
            const i16 = f32toi16(ds);

            let sum = 0;
            for (let i = 0; i < ds.length; i++) sum += ds[i] * ds[i];
            setMicLevel(Math.sqrt(sum / ds.length));

            socket.send(JSON.stringify({
              realtimeInput: { mediaChunks: [{ mimeType: 'audio/pcm;rate=16000', data: ab2b64(i16.buffer) }] },
            }));
          };
        }

        if (data.serverContent) {
          const sc = data.serverContent;

          if (sc.modelTurn?.parts) {
            for (const p of sc.modelTurn.parts) {
              if (p.inlineData?.data) {
                if (isRecordingRef.current) {
                  pendingAudioQueue.current.push(p.inlineData.data);
                } else {
                  audioQueue.current.push(p.inlineData.data);
                  playQueue();
                }
              }
            }
          }

          if (sc.outputTranscription?.text) {
            outBuf.current += sc.outputTranscription.text;
            if (!isRecordingRef.current) {
              setTranscription(prev => ({ ...prev, ai: outBuf.current }));
            }
          }

          if (sc.inputTranscription?.text) {
            inBuf.current += sc.inputTranscription.text;
            if (isRecordingRef.current) {
              setTranscription(prev => ({ ...prev, user: inBuf.current }));
            }
          }

          if (sc.turnComplete) {
            if (outBuf.current.trim()) {
              const aiMsg: Message = { role: 'model', text: outBuf.current.trim() };
              if (isRecordingRef.current) {
                pendingAiMessages.current.push(aiMsg);
              } else {
                setMessages(prev => [...prev, aiMsg]);
                historyRef.current.push(aiMsg);
              }
            }
            outBuf.current = '';
            if (!isRecordingRef.current) {
              if (inBuf.current.trim()) {
                const userMsg: Message = { role: 'user', text: inBuf.current.trim() };
                if (!historyRef.current.some(m => m.text === userMsg.text && m.role === 'user')) {
                  setMessages(prev => [...prev, userMsg]);
                  historyRef.current.push(userMsg);
                }
              }
              inBuf.current = '';
              setTranscription({ user: '', ai: '' });
            }
          }
        }
      };

      socket.onerror = () => {
        console.error('WebSocket error');
        setIsLive(false);
      };

      socket.onclose = (ev) => {
        console.warn('WebSocket closed:', ev.code, ev.reason);
        setIsLive(false);
        setIsRecording(false);
        isRecordingRef.current = false;
        setMicLevel(0);
      };
    } catch (err: any) {
      console.error('acceptCall error:', err);
      setMessages([{ role: 'model', text: `⚠️ 오류: ${err?.message || '알 수 없는 오류'}\n\n종료 버튼을 눌러주세요.` }]);
    }
  };

  useEffect(() => {
    return () => {
      if (!isEndingRef.current) {
        isEndingRef.current = true;
        stopAllAudio();
        wsRef.current?.close();
        procRef.current?.disconnect();
        srcRef.current?.disconnect();
        acInRef.current?.close();
        acOutRef.current?.close();
        streamRef.current?.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, transcription]);

  if (!isStarted) {
    return (
      <div className="h-full flex flex-col bg-slate-900 text-white animate-in fade-in duration-700">
        <StatusBar dark />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-32 h-32 rounded-[3rem] bg-indigo-600 flex items-center justify-center text-6xl mb-8 shadow-[0_0_50px_rgba(79,70,229,0.4)] animate-pulse border-4 border-white/10">
            {persona.emoji}
          </div>
          <h2 className="text-3xl font-black mb-2">{persona.name}</h2>
          <p className="text-indigo-400 font-bold tracking-widest uppercase text-xs animate-bounce">Incoming Call...</p>
          {micPermissionStatus === 'denied' && (
            <p className="text-red-400 text-xs mt-4 px-4 py-2 bg-red-500/10 rounded-lg border border-red-500/30">
              ⚠️ 마이크 권한이 거부되었습니다. 브라우저 설정에서 허용해주세요.
            </p>
          )}
          {micPermissionStatus === 'prompt' && (
            <p className="text-yellow-400 text-xs mt-4 px-4 py-2 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              🎤 통화 수락 시 마이크 권한을 요청합니다.
            </p>
          )}
        </div>
        <div className="p-12 pb-20 flex justify-around items-center">
          <button onClick={() => onEnd([], true)} className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center shadow-lg active:scale-90 transition-transform">
            <PhoneOff size={32} className="text-red-500" />
          </button>
          <button
            onClick={acceptCall}
            disabled={micPermissionStatus === 'denied'}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.5)] active:scale-95 transition-transform border-4 border-white/20 ${
              micPermissionStatus === 'denied'
                ? 'bg-gray-500 cursor-not-allowed opacity-50'
                : 'bg-green-500 animate-bounce'
            }`}
          >
            <Phone size={32} className="text-white" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0F172A] text-white overflow-hidden">
      <StatusBar dark />

      <div className="px-6 py-4 flex justify-between items-center bg-white/5 border-b border-white/5 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-xl shadow-lg border border-white/10">
            {persona.emoji}
          </div>
          <div>
            <h3 className="text-sm font-bold leading-tight">{persona.name}</h3>
            <span className="text-[10px] text-indigo-400 font-black uppercase tracking-tighter">{isLive ? 'Connected' : 'Connecting...'}</span>
          </div>
        </div>
        <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          {difficulty}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md ${
              m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/10 text-gray-200 rounded-tl-none border border-white/5'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {transcription.ai && !isRecording && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm bg-indigo-500/10 text-indigo-200 border border-indigo-500/20 italic rounded-tl-none animate-pulse">
              {transcription.ai}
            </div>
          </div>
        )}
      </div>

      {isRecording && (
        <div className="px-6 pb-2 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white/10 border border-indigo-500/30 backdrop-blur-md rounded-[1.5rem] p-4 min-h-[80px] flex flex-col shadow-[0_-10px_40px_rgba(79,70,229,0.2)]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-tighter text-indigo-400">Speech-to-Text (Realtime)</span>
            </div>
            <p className="text-sm italic text-gray-200 leading-relaxed">
              {transcription.user || "Listening... Start speaking now."}
            </p>
          </div>
        </div>
      )}

      <div className="p-8 pt-4 pb-12 bg-[#1E293B] border-t border-white/5 rounded-t-[3rem] shadow-2xl relative z-10">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            {isRecording && (
              <div className="absolute -inset-4 bg-red-500/20 rounded-full animate-ping"></div>
            )}
            <button
              onClick={toggleMic}
              disabled={!isLive}
              className={`w-24 h-24 rounded-full flex flex-col items-center justify-center gap-1 transition-all duration-300 border-4 ${
                isRecording
                  ? 'bg-red-500 border-white/30 shadow-[0_0_40px_rgba(239,68,68,0.4)] scale-110'
                  : 'bg-indigo-600 border-white/10 shadow-[0_10px_30px_rgba(79,70,229,0.3)] hover:scale-105 active:scale-95'
              } disabled:opacity-50`}
            >
              {isRecording ? <Send size={32} /> : <Mic size={32} />}
              <span className="text-[10px] font-black uppercase tracking-tighter">
                {isRecording ? 'Send' : 'Speak'}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-8 w-full justify-between px-6">
            <button onClick={handleEndCall} className="w-12 h-12 rounded-2xl bg-white/5 text-red-400 flex items-center justify-center border border-white/5 hover:bg-red-500/10 transition-colors">
              <PhoneOff size={20} />
            </button>

            <div className="flex-1 flex flex-col items-center">
              <div className="flex gap-1 h-6 items-end mb-1">
                {isRecording ? (
                  [...Array(9)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-red-400 rounded-full transition-all duration-75"
                      style={{ height: `${20 + (micLevel * 500 * (0.4 + Math.random()))}%` }}
                    ></div>
                  ))
                ) : isAiSpeaking ? (
                  [...Array(9)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-indigo-400 rounded-full animate-pulse"
                      style={{ height: `${30 + Math.random() * 70}%`, animationDelay: `${i * 0.1}s` }}
                    ></div>
                  ))
                ) : (
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center leading-tight">
                    {isLive ? 'Tap to Speak' : 'Connecting...'}
                  </p>
                )}
              </div>
              <p className="text-[9px] font-black text-indigo-400/60 uppercase tracking-widest text-center">
                {isRecording ? 'Recording your voice...' : isAiSpeaking ? 'Tutor is speaking' : 'Ready to listen'}
              </p>
            </div>

            <button
              onClick={() => setIsMutedAI(!isMutedAI)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
                isMutedAI
                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/20'
              }`}
            >
              {isMutedAI ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallScreen;
