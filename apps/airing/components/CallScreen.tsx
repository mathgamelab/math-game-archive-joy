
import React, { useState, useEffect, useRef } from 'react';
import { Persona, Difficulty, ConversationMode, Message } from '../types';
import { connectLiveSession, encodePCM, decodePCM, decodeAudioData, GEMINI_API_KEY } from '../services/geminiService';
import StatusBar from './StatusBar';
import { Mic, MicOff, Volume2, VolumeX, PhoneOff, Phone, Send, Loader2 } from 'lucide-react';

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
  const [micPermissionStatus, setMicPermissionStatus] = useState<string>('prompt'); // 'prompt', 'granted', 'denied'
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<any>(null);
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const historyRef = useRef<Message[]>([]);
  const isEndingRef = useRef(false);
  
  // 상태 동기화를 위한 Ref들
  const isRecordingRef = useRef(false);
  const isMutedAIRef = useRef(false);
  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');
  
  // 핵심: 녹음 중 들어온 오디오와 메시지를 임시 보관하는 큐
  const pendingAudioQueue = useRef<string[]>([]);
  const pendingAiMessages = useRef<Message[]>([]);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    isMutedAIRef.current = isMutedAI;
  }, [isMutedAI]);

  // 마이크 권한 상태 확인
  useEffect(() => {
    const checkMicPermission = async () => {
      if (navigator.permissions) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setMicPermissionStatus(permissionStatus.state);
          console.log('마이크 권한 상태:', permissionStatus.state);
          
          // 권한 상태 변경 감지
          permissionStatus.onchange = () => {
            setMicPermissionStatus(permissionStatus.state);
            console.log('마이크 권한 상태 변경:', permissionStatus.state);
          };
        } catch (error) {
          console.log('권한 상태 확인 실패:', error);
          // 확인 실패 시 기본값 유지
        }
      } else {
        // permissions API가 지원되지 않으면 getUserMedia로 직접 확인
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setMicPermissionStatus('granted');
          // 스트림은 즉시 종료 (권한 확인만)
          stream.getTracks().forEach(track => track.stop());
        } catch (error: any) {
          if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            setMicPermissionStatus('denied');
          } else {
            setMicPermissionStatus('prompt');
          }
        }
      }
    };
    
    if (!isStarted) {
      checkMicPermission();
    }
  }, [isStarted]);

  // 오디오 재생 함수 (추출)
  const playAudioChunk = async (audioBase64: string) => {
    if (!audioContextOutRef.current || isMutedAIRef.current) return;
    
    setIsAiSpeaking(true);
    const buffer = await decodeAudioData(decodePCM(audioBase64), audioContextOutRef.current);
    const source = audioContextOutRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextOutRef.current.destination);
    
    source.onended = () => {
      sourcesRef.current.delete(source);
      if (sourcesRef.current.size === 0) setIsAiSpeaking(false);
    };

    const now = audioContextOutRef.current.currentTime;
    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, now);
    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += buffer.duration;
    sourcesRef.current.add(source);
  };

  const stopAllAudio = () => {
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setIsAiSpeaking(false);
  };

  const handleEndCall = (forceMain: boolean = true) => {
    if (isEndingRef.current) return;
    isEndingRef.current = true;
    console.log('handleEndCall 호출됨, 히스토리 길이:', historyRef.current.length, 'forceMain:', forceMain);
    stopAllAudio();
    if (sessionRef.current) {
      sessionRef.current.then((s: any) => { if(s && s.close) s.close(); }).catch(() => {});
    }
    if (audioContextInRef.current) audioContextInRef.current.close();
    if (audioContextOutRef.current) audioContextOutRef.current.close();
    // forceMain을 전달하여 의도적인 종료인지 구분
    onEnd(historyRef.current, forceMain);
  };

  const toggleMic = async () => {
    if (!isLive) return;
    
    if (audioContextInRef.current?.state === 'suspended') await audioContextInRef.current.resume();
    if (audioContextOutRef.current?.state === 'suspended') await audioContextOutRef.current.resume();

    if (!isRecording) {
      // --- 말하기 시작 ---
      setIsRecording(true);
      stopAllAudio(); 
      currentInputTranscription.current = '';
      currentOutputTranscription.current = '';
      pendingAudioQueue.current = [];
      pendingAiMessages.current = [];
      setTranscription({ user: '', ai: '' });
    } else {
      // --- 보내기 (전송) ---
      const finalUserText = currentInputTranscription.current.trim();
      
      if (finalUserText) {
        const userMsg: Message = { role: 'user', text: finalUserText };
        setMessages(prev => [...prev, userMsg]);
        historyRef.current.push(userMsg);
      }
      
      setIsRecording(false);
      setMicLevel(0);

      // 중요: 그동안 밀렸던 오디오와 메시지 처리
      if (pendingAudioQueue.current.length > 0) {
        pendingAudioQueue.current.forEach(chunk => playAudioChunk(chunk));
        pendingAudioQueue.current = [];
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
    console.log('=== 통화 수락 시작 ===');
    setIsStarted(true);
    
    try {
      // 먼저 권한 상태 확인
      if (navigator.permissions) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          console.log('마이크 권한 상태:', permissionStatus.state);
          
          if (permissionStatus.state === 'denied') {
            console.error('마이크 권한이 거부됨');
            alert('마이크 권한이 거부되었습니다.\n\n브라우저 설정에서 마이크 권한을 허용해주세요.');
            setIsStarted(false);
            onEnd([], true); // 권한 거부는 의도적인 메인 이동
            return;
          }
        } catch (permError) {
          // permissions API가 지원되지 않거나 실패해도 계속 진행
          console.log('권한 상태 확인 실패 (계속 진행):', permError);
        }
      }

      // getUserMedia 호출 (권한 요청)
      console.log('마이크 권한 요청 중...');
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
            echoCancellation: true, 
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        console.log('✅ 마이크 권한 허용됨, 스트림 획득 성공');
      } catch (mediaError: any) {
        console.error('❌ getUserMedia 실패:', mediaError);
        console.error('에러 이름:', mediaError.name);
        console.error('에러 메시지:', mediaError.message);
        
        if (mediaError.name === 'NotAllowedError' || mediaError.name === 'PermissionDeniedError') {
          alert("마이크 접근 권한이 필요합니다.\n\n브라우저 설정에서 마이크 권한을 허용해주세요.");
          setIsStarted(false);
          onEnd([], true); // 권한 오류는 의도적인 메인 이동
          return;
        } else {
          // 기타 오류는 화면에 표시
          throw mediaError; // 아래 catch 블록에서 처리
        }
      }

      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctxIn = new AudioContextClass({ sampleRate: 16000 });
      const ctxOut = new AudioContextClass({ sampleRate: 24000 });
      audioContextInRef.current = ctxIn;
      audioContextOutRef.current = ctxOut;

      const apiKey = GEMINI_API_KEY;
      console.log('API 키 확인:', apiKey ? '설정됨' : '없음');
      console.log('Persona:', persona.name);
      
      let sessionConnectionError = false;
      
      let sessionPromise;
      try {
        console.log('세션 연결 시도 중...');
        sessionPromise = connectLiveSession(apiKey, persona, {
        onopen: () => {
          console.log('✅ 세션 연결 성공 (onopen)');
          setIsLive(true);
          const source = ctxIn.createMediaStreamSource(stream);
          const processor = ctxIn.createScriptProcessor(4096, 1, 1);
          
          processor.onaudioprocess = (e) => {
            if (isEndingRef.current) return;
            const inputData = e.inputBuffer.getChannelData(0);

            if (isRecordingRef.current) {
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
              setMicLevel(Math.sqrt(sum / inputData.length));

              const pcmBase64 = encodePCM(inputData);
              sessionPromise.then(s => {
                if (s) s.sendRealtimeInput({ media: { data: pcmBase64, mimeType: 'audio/pcm;rate=16000' } });
              }).catch(() => {});
            }
          };
          
          source.connect(processor);
          processor.connect(ctxIn.destination);

          const prompt = scenario 
            ? `Let's practice English about "${scenario}". My level is ${difficulty}. Start by greeting me!` 
            : `My level is ${difficulty}. Let's have a chat. Start by greeting me!`;
          
          sessionPromise.then(s => {
            if (s) s.sendRealtimeInput({ text: prompt });
          }).catch(() => {});
        },
        onmessage: async (message: any) => {
          if (isEndingRef.current) return;

          // 1. 오디오 데이터 수신
          const audioBase64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioBase64) {
            if (isRecordingRef.current) {
              // 녹음 중이면 재생하지 않고 큐에 저장
              pendingAudioQueue.current.push(audioBase64);
            } else {
              // 녹음 중이 아니면 즉시 재생
              playAudioChunk(audioBase64);
            }
          }

          // 2. STT (내 말 자막)
          if (message.serverContent?.inputTranscription) {
            currentInputTranscription.current += message.serverContent.inputTranscription.text;
            if (isRecordingRef.current) {
               setTranscription(prev => ({ ...prev, user: currentInputTranscription.current }));
            }
          }

          // 3. TTS (AI 말 자막)
          if (message.serverContent?.outputTranscription) {
            currentOutputTranscription.current += message.serverContent.outputTranscription.text;
            if (!isRecordingRef.current) {
              setTranscription(prev => ({ ...prev, ai: currentOutputTranscription.current }));
            }
          }

          // 4. 대화 마디 완료 시
          if (message.serverContent?.turnComplete) {
            const aiText = currentOutputTranscription.current.trim();
            if (aiText) {
              const aiMsg: Message = { role: 'model', text: aiText };
              if (isRecordingRef.current) {
                // 녹음 중이면 메시지도 대기열에 추가
                pendingAiMessages.current.push(aiMsg);
              } else {
                setMessages(prev => [...prev, aiMsg]);
                historyRef.current.push(aiMsg);
              }
            }
            // 초기화
            currentOutputTranscription.current = '';
            if (!isRecordingRef.current) {
              setTranscription({ user: '', ai: '' });
              currentInputTranscription.current = '';
            }
          }
        },
        onerror: (error: any) => {
          console.error('Live session error:', error);
          sessionConnectionError = true;
          setIsLive(false);
          // 에러가 발생해도 바로 종료하지 않음 - 사용자가 직접 종료할 수 있도록
        },
        onclose: () => {
          setIsLive(false);
          // 연결이 끊겨도 바로 종료하지 않음
        },
        });
      } catch (syncError: any) {
        // 동기적으로 발생하는 에러 처리
        console.error('Live session connection sync error:', syncError);
        sessionConnectionError = true;
        setIsLive(false);
        const errorMsg = syncError?.message || 'API 연결에 실패했습니다. 콘솔을 확인해주세요.';
        console.error('세션 연결 실패 (동기):', errorMsg);
        setMessages([{ 
          role: 'model', 
          text: `⚠️ 연결 오류: ${errorMsg}\n\n통화를 종료하려면 하단의 종료 버튼을 눌러주세요.` 
        }]);
        // 동기 에러는 Promise를 생성하지 못했으므로 sessionRef에 null 설정
        sessionRef.current = Promise.resolve(null);
        return; // 더 이상 진행하지 않음
      }
      
      sessionRef.current = sessionPromise;
      
      // 세션 연결 실패 시 에러 처리
      sessionPromise.catch((error: any) => {
        console.error('❌ 세션 연결 실패 (Promise catch):', error);
        console.error('에러 상세:', {
          name: error?.name,
          message: error?.message,
          status: error?.status,
          code: error?.code,
          stack: error?.stack
        });
        sessionConnectionError = true;
        setIsLive(false);
        // 연결 실패해도 화면은 유지하고, 사용자가 직접 종료할 수 있도록 함
        const errorMsg = error?.message || error?.toString() || 'API 연결에 실패했습니다. 콘솔을 확인해주세요.';
        console.error('세션 연결 실패 - 사용자에게 표시할 메시지:', errorMsg);
        // 에러 상태를 표시하기 위해 메시지에 추가 (화면 유지)
        setMessages([{ 
          role: 'model', 
          text: `⚠️ 연결 오류: ${errorMsg}\n\n통화를 종료하려면 하단의 종료 버튼을 눌러주세요.` 
        }]);
        // 화면은 유지하므로 setIsStarted(false)나 onEnd()를 호출하지 않음
      });
    } catch (err: any) {
      console.error('❌ acceptCall 전체 catch 블록:', err);
      console.error('에러 상세:', {
        name: err?.name,
        message: err?.message,
        stack: err?.stack,
        toString: err?.toString()
      });
      
      // 화면은 유지하되 오류 메시지 표시
      const errorMsg = err?.message || err?.toString() || '알 수 없는 오류가 발생했습니다.';
      console.error('통화 시작 오류 - 사용자에게 표시할 메시지:', errorMsg);
      
      setMessages([{ 
        role: 'model', 
        text: `⚠️ 오류 발생: ${errorMsg}\n\n통화를 종료하려면 하단의 종료 버튼을 눌러주세요.` 
      }]);
      
      // 화면은 유지 (setIsStarted(false) 호출하지 않음)
      // 사용자가 직접 종료 버튼을 눌러야 함
    }
  };

  // 컴포넌트 언마운트 시에만 cleanup 실행
  useEffect(() => {
    return () => {
      // cleanup에서는 리소스만 정리하고, 화면 전환은 하지 않음
      // (화면 전환은 사용자가 직접 버튼을 눌렀을 때만)
      if (!isEndingRef.current) {
        isEndingRef.current = true;
        stopAllAudio();
        if (sessionRef.current) {
          sessionRef.current.then((s: any) => { if(s && s.close) s.close(); }).catch(() => {});
        }
        if (audioContextInRef.current) audioContextInRef.current.close();
        if (audioContextOutRef.current) audioContextOutRef.current.close();
        // cleanup에서는 onEnd를 호출하지 않음 (화면 전환 방지)
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

      {/* Header Info */}
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

      {/* Transcription Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md animate-in fade-in slide-in-from-bottom-2 ${
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

      {/* 실시간 말하기 미리보기 박스 */}
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

      {/* Interaction Area */}
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
