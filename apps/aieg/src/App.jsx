import { useState, useRef, useEffect, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";

// PDF.js worker for Vite (use ?url so Vite emits the worker file)
try {
  const workerSrc = new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).href;
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
} catch (_) {}

/** Extract text from PDF file (ArrayBuffer). */
async function extractTextFromPdf(arrayBuffer) {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const parts = [];
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((it) => it.str).join(" ");
    parts.push(text);
  }
  return parts.join("\n\n").trim();
}

// ─── Constants ───────────────────────────────────────────────────────────────
const API_KEY_STORAGE = "aieg_gemini_api_key";
const WS_URL = "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent";
const MODEL = "models/gemini-2.5-flash-native-audio-preview-12-2025";
const GEMINI_REST = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const DIFFICULTIES = [
  { id: "beginner", label: "Beginner", emoji: "🌱", desc: "천천히, 쉬운 표현", color: "#16a34a" },
  { id: "intermediate", label: "Intermediate", emoji: "🌿", desc: "자연스러운 속도", color: "#2563eb" },
  { id: "advanced", label: "Advanced", emoji: "🌳", desc: "원어민 수준", color: "#7c3aed" },
];

const CHARACTERS = [
  { id: "barista", name: "Sarah", role: "Coffee Shop Barista", emoji: "☕", voice: "Kore", color: "#d97706" },
  { id: "interviewer", name: "James", role: "Job Interviewer", emoji: "💼", voice: "Charon", color: "#2563eb" },
  { id: "traveler", name: "Emma", role: "Travel Buddy", emoji: "✈️", voice: "Aoede", color: "#db2777" },
  { id: "professor", name: "Mike", role: "University Professor", emoji: "📚", voice: "Puck", color: "#7c3aed" },
  { id: "neighbor", name: "Alex", role: "Friendly Neighbor", emoji: "🏠", voice: "Fenrir", color: "#059669" },
  { id: "passage", name: "Guide", role: "From your passage", emoji: "📄", voice: "Charon", color: "#7c3aed" },
];

// ─── Audio Utilities ─────────────────────────────────────────────────────────
function ab2b64(buf) {
  const u8 = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < u8.length; i += 8192)
    s += String.fromCharCode.apply(null, u8.subarray(i, i + 8192));
  return btoa(s);
}

function b642ab(b64) {
  const s = atob(b64);
  const u8 = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) u8[i] = s.charCodeAt(i);
  return u8.buffer;
}

function downsample(buf, from, to) {
  if (from === to) return buf;
  const r = from / to,
    len = Math.round(buf.length / r),
    out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const idx = i * r,
      lo = Math.floor(idx);
    out[i] =
      buf[lo] * (1 - (idx - lo)) +
      (buf[Math.min(lo + 1, buf.length - 1)] || 0) * (idx - lo);
  }
  return out;
}

function f32toi16(f) {
  const o = new Int16Array(f.length);
  for (let i = 0; i < f.length; i++) {
    const s = Math.max(-1, Math.min(1, f[i]));
    o[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return o;
}

function fmt(s) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

// ─── System Prompt Builder ───────────────────────────────────────────────────
function buildSystemPrompt(diff, char, topic, customPassage) {
  const dc = {
    beginner: {
      speed: "Speak slowly and clearly.",
      vocab: "Simple vocabulary, short sentences (A1-A2).",
      help: "Give brief Korean hints in parentheses for key words if the user struggles.",
      corr: "Don't correct grammar. Keep encouraging.",
    },
    intermediate: {
      speed: "Speak at moderate pace.",
      vocab: "Varied vocabulary, mix of sentence complexity (B1-B2).",
      help: "Prompt with follow-up if user pauses too long.",
      corr: "Model correct grammar by naturally rephrasing.",
    },
    advanced: {
      speed: "Speak at natural native speed.",
      vocab: "Advanced vocabulary, idioms, phrasal verbs (C1-C2).",
      help: "Challenge with complex questions.",
      corr: "Use sophisticated language naturally.",
    },
  }[diff];
  const c = CHARACTERS.find((x) => x.id === char);

  if (customPassage && customPassage.trim()) {
    const passage = customPassage.trim().slice(0, 12000);
    return `You are on a phone call with a Korean English learner. Your persona MUST be one of:
1) A character who appears in the passage below, OR
2) Someone who deeply understands and can discuss the passage (e.g. expert, narrator, teacher).

Use the following passage as your sole context. Stay in character. Speak ONLY in English. Keep responses 1-3 sentences (natural phone conversation).
- ${dc.speed}
- ${dc.vocab}
- ${dc.help}
- ${dc.corr}

PASSAGE:
---
${passage}
---

When you see "[HINT]", suggest a phrase the user could say: "You could say: '...'" then continue.
Start with a natural greeting in character (introduce yourself based on the passage).`;
  }

  const tl = topic
    ? `The conversation topic is: "${topic}".`
    : "Choose a natural topic based on your role.";
  return `You are ${c.name}, a ${c.role}, on a phone call with a Korean English learner.

RULES:
- Speak ONLY in English. If user speaks Korean, gently redirect to English.
- Stay in character. Keep responses 1-3 sentences (natural phone conversation).
- ${dc.speed}
- ${dc.vocab}
- ${dc.help}
- ${dc.corr}

${tl}

When you see "[HINT]", suggest a phrase the user could say: "You could say: '...'" then continue.

Start with a natural greeting as ${c.name}.`;
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const Icon = ({ d, size = 20, color = "currentColor", ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {d}
  </svg>
);

const PhoneIcon = (p) => (
  <Icon {...p} d={<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />} />
);

const PhoneOffIcon = (p) => (
  <Icon {...p} d={<><path d="M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.42 19.42 0 01-3.33-2.67" /><path d="M14.118 14.098A19.5 19.5 0 018.09 9.91l1.27-1.27a2 2 0 00.45-2.11 12.73 12.73 0 01-.7-2.81A2 2 0 007.11 2h-3a2 2 0 00-2 2.18 19.79 19.79 0 003.07 8.63" /><line x1="1" y1="1" x2="23" y2="23" /></>} />
);

const MicIcon = (p) => (
  <Icon {...p} d={<><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></>} />
);

const MicOffIcon = (p) => (
  <Icon {...p} d={<><line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" /><path d="M17 16.95A7 7 0 015 12v-2m14 0v2c0 .76-.13 1.49-.35 2.17" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></>} />
);

const LightbulbIcon = (p) => (
  <Icon {...p} d={<><path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z" /></>} />
);

const CheckIcon = (p) => <Icon {...p} d={<polyline points="20 6 9 17 4 12" />} />;

const LoaderIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
    <path d="M21 12a9 9 0 11-6.219-8.56" />
  </svg>
);

// ─── Small UI Helpers ────────────────────────────────────────────────────────
function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#71717a", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function CtrlBtn({ onClick, active, activeColor, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: 52, height: 52, borderRadius: "50%",
      border: active ? "none" : "1.5px solid #e4e4e7",
      background: active ? activeColor : "#fff",
      cursor: disabled ? "default" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      opacity: disabled ? 0.4 : 1,
      boxShadow: active ? `0 2px 12px ${activeColor}40` : "0 1px 4px #00000008",
      transition: "all .15s",
    }}>
      {children}
    </button>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  API KEY SCREEN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ApiKeyScreen({ onContinue }) {
  const [key, setKey] = useState(() => {
    try {
      return typeof localStorage !== "undefined" ? localStorage.getItem(API_KEY_STORAGE) ?? "" : "";
    } catch {
      return "";
    }
  });
  const [remember, setRemember] = useState(!!key);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = key.trim();
    if (!trimmed) {
      setError("API 키를 입력해주세요.");
      return;
    }
    setError("");
    try {
      if (remember) localStorage.setItem(API_KEY_STORAGE, trimmed);
      else localStorage.removeItem(API_KEY_STORAGE);
    } catch (_) {}
    onContinue(trimmed);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", color: "#18181b", display: "flex", flexDirection: "column", padding: "24px 20px" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 400, margin: "0 auto", width: "100%" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #2563eb, #7c3aed)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 16, color: "#fff" }}>
          🔑
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#18181b", marginBottom: 6 }}>Gemini API 키 입력</h1>
        <p style={{ fontSize: 13, color: "#71717a", marginBottom: 24 }}>
          전화 영어 연습을 위해 Google AI Studio에서 발급한 Gemini API 키가 필요합니다.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={key}
            onChange={(e) => { setKey(e.target.value); setError(""); }}
            placeholder="AIzaSy..."
            autoComplete="off"
            style={{
              width: "100%", padding: "14px 16px", background: "#fff", border: error ? "2px solid #dc2626" : "1.5px solid #e4e4e7",
              borderRadius: 12, fontSize: 14, outline: "none", color: "#18181b", marginBottom: 12,
            }}
          />
          {error && <p style={{ fontSize: 12, color: "#dc2626", marginBottom: 12 }}>{error}</p>}
          <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, cursor: "pointer", fontSize: 13, color: "#52525b" }}>
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            이 기기에 API 키 저장 (다음 방문 시 자동 입력)
          </label>
          <button type="submit" style={{
            width: "100%", padding: "16px", background: "linear-gradient(135deg, #2563eb, #7c3aed)", border: "none", borderRadius: 16, color: "#fff",
            fontSize: 16, fontWeight: 800, cursor: "pointer",
            boxShadow: "0 4px 20px rgba(37,99,235,0.35)",
          }}>
            다음
          </button>
        </form>
        <p style={{ fontSize: 11, color: "#a1a1aa", marginTop: 20 }}>
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>Google AI Studio</a>에서 무료로 API 키를 발급받을 수 있습니다.
        </p>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  SETUP SCREEN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SetupScreen({ onStart, onChangeApiKey }) {
  const [diff, setDiff] = useState("intermediate");
  const [char, setChar] = useState("barista");
  const [topic, setTopic] = useState("");
  const [passageText, setPassageText] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const fileInputRef = useRef(null);

  const hasPassage = passageText.trim().length > 0;
  const effectiveChar = hasPassage ? "passage" : char;
  const sc = CHARACTERS.find((c) => c.id === effectiveChar);

  const handlePdfChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfError("");
    setPdfLoading(true);
    try {
      const buf = await file.arrayBuffer();
      const text = await extractTextFromPdf(buf);
      setPassageText((prev) => (prev ? prev + "\n\n" : "") + text);
      setPdfName(file.name);
    } catch (err) {
      setPdfError("PDF를 읽을 수 없습니다. 텍스트 기반 PDF인지 확인해주세요.");
    } finally {
      setPdfLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleStart = () => {
    if (hasPassage) {
      onStart({ diff, char: "passage", topic: topic.trim(), customPassage: passageText.trim() });
    } else {
      onStart({ diff, char, topic: topic.trim(), customPassage: null });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", color: "#18181b", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "32px 20px 12px", textAlign: "center", position: "relative" }}>
        {onChangeApiKey && (
          <button type="button" onClick={onChangeApiKey} style={{
            position: "absolute", left: 20, top: 32, background: "none", border: "none", fontSize: 12, color: "#71717a",
            cursor: "pointer", textDecoration: "underline",
          }}>
            API 키 변경
          </button>
        )}
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #2563eb, #7c3aed)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 10, color: "#fff" }}>
          📞
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#18181b" }}>AI Phone English</h1>
        <p style={{ fontSize: 13, color: "#71717a", marginTop: 2 }}>원어민과 전화 영어 연습</p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 20px 120px", WebkitOverflowScrolling: "touch" }}>
        {/* Difficulty */}
        <Section label="난이도">
          <div style={{ display: "flex", gap: 8 }}>
            {DIFFICULTIES.map((d) => (
              <button key={d.id} onClick={() => setDiff(d.id)} style={{
                flex: 1, padding: "14px 4px",
                background: diff === d.id ? "#fff" : "#f4f4f5",
                border: diff === d.id ? `2px solid ${d.color}` : "2px solid #e4e4e7",
                borderRadius: 14, cursor: "pointer", textAlign: "center", transition: "all .15s",
                boxShadow: diff === d.id ? `0 2px 12px ${d.color}25` : "none",
              }}>
                <div style={{ fontSize: 22 }}>{d.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4, color: diff === d.id ? d.color : "#52525b" }}>{d.label}</div>
                <div style={{ fontSize: 10, color: "#a1a1aa", marginTop: 2 }}>{d.desc}</div>
              </button>
            ))}
          </div>
        </Section>

        {/* Character (hidden when passage is set) */}
        {!hasPassage && (
          <Section label="캐릭터 선택">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {CHARACTERS.filter((c) => c.id !== "passage").map((c) => (
                <button key={c.id} onClick={() => setChar(c.id)} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                  background: char === c.id ? "#fff" : "#f4f4f5",
                  border: char === c.id ? `2px solid ${c.color}` : "2px solid #e4e4e7",
                  borderRadius: 14, cursor: "pointer", textAlign: "left", transition: "all .15s",
                  boxShadow: char === c.id ? `0 2px 12px ${c.color}20` : "none",
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${c.color}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                    {c.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#18181b" }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: "#71717a" }}>{c.role}</div>
                  </div>
                  {char === c.id && <CheckIcon size={20} color={c.color} />}
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* Passage: paste or PDF */}
        <Section label="지문으로 대화하기 (선택)">
          <p style={{ fontSize: 12, color: "#71717a", marginBottom: 10 }}>
            영어 지문을 넣으면, NPC가 지문 속 인물 또는 지문을 이해한 전문가로 대화합니다.
          </p>
          <textarea
            value={passageText}
            onChange={(e) => { setPassageText(e.target.value); setPdfError(""); }}
            placeholder="영어 지문을 붙여넣으세요..."
            rows={4}
            style={{
              width: "100%", padding: "12px 14px", background: "#fff", border: "1.5px solid #e4e4e7",
              borderRadius: 12, fontSize: 14, outline: "none", color: "#18181b", resize: "vertical", minHeight: 88,
            }}
          />
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handlePdfChange}
              style={{ display: "none" }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={pdfLoading}
              style={{
                padding: "10px 16px", background: "#f4f4f5", border: "1.5px solid #e4e4e7", borderRadius: 10,
                fontSize: 13, fontWeight: 600, color: "#52525b", cursor: pdfLoading ? "default" : "pointer",
              }}
            >
              {pdfLoading ? "PDF 읽는 중..." : "📎 PDF 첨부"}
            </button>
            {pdfName && <span style={{ fontSize: 12, color: "#71717a" }}>{pdfName}</span>}
          </div>
          {pdfError && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 6 }}>{pdfError}</p>}
          {hasPassage && (
            <p style={{ fontSize: 12, color: "#16a34a", marginTop: 8 }}>✓ 지문 기반 대화로 진행됩니다 (캐릭터: 지문 속 인물/전문가)</p>
          )}
        </Section>

        {/* Topic (when no passage) */}
        {!hasPassage && (
          <Section label="대화 주제 (선택)">
            <input value={topic} onChange={(e) => setTopic(e.target.value)}
              placeholder="예: ordering coffee, travel plans..."
              style={{ width: "100%", padding: "12px 14px", background: "#fff", border: "1.5px solid #e4e4e7", borderRadius: 12, fontSize: 14, outline: "none", color: "#18181b" }} />
          </Section>
        )}
      </div>

      {/* CTA */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 20px 24px", background: "linear-gradient(transparent, #fafafa 30%)", paddingTop: 40 }}>
        <button onClick={handleStart} style={{
          width: "100%", padding: "16px", background: sc.color, border: "none", borderRadius: 16, color: "#fff",
          fontSize: 16, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          boxShadow: `0 4px 20px ${sc.color}40`, transition: "all .15s",
        }}>
          <PhoneIcon size={20} color="#fff" /> {sc.name}에게 전화 걸기
        </button>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  CALL SCREEN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function CallScreen({ apiKey, settings, onEnd }) {
  const { diff, char, topic, customPassage } = settings;
  const ci = CHARACTERS.find((c) => c.id === char);

  const [status, setStatus] = useState("connecting");
  const [connectionError, setConnectionError] = useState("");
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [subs, setSubs] = useState([]);
  const [transcripts, setTranscripts] = useState([]);
  const [hintLoading, setHintLoading] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);

  const wsR = useRef(null);
  const acR = useRef(null);
  const pbR = useRef(null);
  const srcR = useRef(null);
  const procR = useRef(null);
  const strR = useRef(null);
  const tmR = useRef(null);
  const aq = useRef([]);
  const playingR = useRef(false);
  const outB = useRef("");
  const inB = useRef("");
  const mutedR = useRef(false);
  const elR = useRef(0);
  const subsEnd = useRef(null);
  const transcriptsR = useRef([]);

  useEffect(() => { mutedR.current = muted; }, [muted]);
  useEffect(() => { elR.current = elapsed; }, [elapsed]);
  useEffect(() => { subsEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [subs]);

  // Audio playback queue
  const playQ = useCallback(async () => {
    if (playingR.current || aq.current.length === 0) return;
    playingR.current = true;
    setAiSpeaking(true);
    while (aq.current.length > 0) {
      const chunk = aq.current.shift();
      const pcm = b642ab(chunk);
      const i16 = new Int16Array(pcm);
      const f32 = new Float32Array(i16.length);
      for (let i = 0; i < i16.length; i++) f32[i] = i16[i] / 32768;
      if (!pbR.current || pbR.current.state === "closed")
        pbR.current = new AudioContext({ sampleRate: 24000 });
      const ctx = pbR.current;
      const buf = ctx.createBuffer(1, f32.length, 24000);
      buf.copyToChannel(f32, 0);
      const s = ctx.createBufferSource();
      s.buffer = buf;
      s.connect(ctx.destination);
      await new Promise((r) => { s.onended = r; s.start(); });
    }
    playingR.current = false;
    setAiSpeaking(false);
  }, []);

  // Main connection effect
  useEffect(() => {
    let dead = false;

    (async () => {
      try {
        // Get microphone
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        if (dead) { stream.getTracks().forEach((t) => t.stop()); return; }
        strR.current = stream;

        const ac = new AudioContext();
        if (ac.state === "suspended") await ac.resume();
        acR.current = ac;
        const src = ac.createMediaStreamSource(stream);
        srcR.current = src;
        const proc = ac.createScriptProcessor(4096, 1, 1);
        procR.current = proc;
        const silent = ac.createGain();
        silent.gain.value = 0;
        src.connect(proc);
        // Keep ScriptProcessor alive without routing mic monitoring to speakers.
        proc.connect(silent);
        silent.connect(ac.destination);

        // WebSocket to Gemini
        const socket = new WebSocket(`${WS_URL}?key=${apiKey}`);
        socket.binaryType = "arraybuffer";
        wsR.current = socket;

        socket.onopen = () => {
          socket.send(JSON.stringify({
            setup: {
              model: MODEL,
              generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: ci.voice } } },
              },
              systemInstruction: { parts: [{ text: buildSystemPrompt(diff, char, topic, customPassage ?? null) }] },
              outputAudioTranscription: {},
              inputAudioTranscription: {},
            },
          }));
        };

        socket.onmessage = async (ev) => {
          let raw = ev.data;

          if (raw instanceof Blob) raw = await raw.text();
          else if (raw instanceof ArrayBuffer) raw = new TextDecoder().decode(raw);

          if (typeof raw !== "string") return;

          let data;
          try {
            data = JSON.parse(raw);
          } catch {
            // Ignore non-JSON frames to keep the real-time stream stable.
            return;
          }

          // Setup complete → NPC speaks first
          if (data.setupComplete) {
            if (dead) return;
            setStatus("connected");
            socket.send(JSON.stringify({
              clientContent: {
                turns: [{ role: "user", parts: [{ text: "[Phone connected. Greet me in 1-2 sentences.]" }] }],
                turnComplete: true,
              },
            }));
            tmR.current = setInterval(() => setElapsed((p) => p + 1), 1000);

            // Start streaming mic audio
            proc.onaudioprocess = (e) => {
              if (mutedR.current || socket.readyState !== 1) return;
              const raw = e.inputBuffer.getChannelData(0);
              const ds = downsample(raw, ac.sampleRate, 16000);
              const i16 = f32toi16(ds);
              socket.send(JSON.stringify({
                realtimeInput: { mediaChunks: [{ mimeType: "audio/pcm;rate=16000", data: ab2b64(i16.buffer) }] },
              }));
            };
          }

          // Server content (audio + transcriptions)
          if (data.serverContent) {
            const sc = data.serverContent;

            // Audio chunks → playback queue
            if (sc.modelTurn?.parts) {
              for (const p of sc.modelTurn.parts) {
                if (p.inlineData?.data) {
                  aq.current.push(p.inlineData.data);
                  playQ();
                }
              }
            }

            // AI output transcription (real-time subtitles)
            if (sc.outputTranscription?.text) {
              outB.current += sc.outputTranscription.text;
              const t = outB.current;
              setSubs((prev) => {
                const u = [...prev];
                const li = u.findLastIndex((s) => s.role === "ai" && !s.done);
                if (li >= 0) u[li] = { ...u[li], text: t };
                else u.push({ role: "ai", text: t, done: false });
                return u;
              });
            }

            // User input transcription
            if (sc.inputTranscription?.text) {
              inB.current += sc.inputTranscription.text;
              const t = inB.current;
              setSubs((prev) => {
                const u = [...prev];
                const li = u.findLastIndex((s) => s.role === "user" && !s.done);
                if (li >= 0) u[li] = { ...u[li], text: t };
                else u.push({ role: "user", text: t, done: false });
                return u;
              });
            }

            // Turn complete → finalize subtitles
            if (sc.turnComplete) {
              if (outB.current) {
                const txt = outB.current;
                setSubs((prev) => prev.map((s, i) =>
                  i === prev.findLastIndex((x) => x.role === "ai" && !x.done) ? { ...s, done: true } : s
                ));
                const entry = { role: "ai", text: txt, time: elR.current };
                transcriptsR.current = [...transcriptsR.current, entry];
                setTranscripts((prev) => [...prev, entry]);
                outB.current = "";
              }
              if (inB.current) {
                const txt = inB.current;
                setSubs((prev) => prev.map((s, i) =>
                  i === prev.findLastIndex((x) => x.role === "user" && !x.done) ? { ...s, done: true } : s
                ));
                const entry = { role: "user", text: txt, time: elR.current };
                transcriptsR.current = [...transcriptsR.current, entry];
                setTranscripts((prev) => [...prev, entry]);
                inB.current = "";
              }
              setHintLoading(false);
            }
          }
        };

        socket.onerror = () => {
          if (!dead) {
            setConnectionError("네트워크 또는 서버 오류");
            setStatus("error");
          }
        };
        socket.onclose = (ev) => {
          if (!dead) {
            const msg = ev.code === 1006 ? "연결이 끊어졌습니다 (API 키 또는 권한 확인)" : `연결 종료: ${ev.code} ${ev.reason || ""}`;
            if (ev.code === 4001 || ev.code === 401) {
              setConnectionError("API 키가 올바르지 않거나 만료되었습니다.");
            } else if (ev.code === 403) {
              setConnectionError("Gemini Live API 사용 권한이 없습니다. AI Studio에서 해당 API를 활성화해 주세요.");
            } else {
              setConnectionError(msg.trim());
            }
            setStatus((prev) => (prev === "connecting" ? "error" : prev));
          }
        };
      } catch (err) {
        console.error("Init error:", err);
        if (!dead) setStatus("error");
      }
    })();

    return () => {
      dead = true;
      clearInterval(tmR.current);
      wsR.current?.close();
      procR.current?.disconnect();
      srcR.current?.disconnect();
      if (acR.current?.state !== "closed") acR.current?.close();
      if (pbR.current?.state !== "closed") pbR.current?.close();
      strR.current?.getTracks().forEach((t) => t.stop());
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const hint = () => {
    if (!wsR.current || wsR.current.readyState !== 1) return;
    setHintLoading(true);
    wsR.current.send(JSON.stringify({
      clientContent: {
        turns: [{ role: "user", parts: [{ text: "[HINT] User is stuck. Suggest what to say next." }] }],
        turnComplete: true,
      },
    }));
  };

  const endCall = () => {
    clearInterval(tmR.current);
    wsR.current?.close();
    procR.current?.disconnect();
    srcR.current?.disconnect();
    acR.current?.close();
    pbR.current?.close();
    strR.current?.getTracks().forEach((t) => t.stop());
    onEnd(transcriptsR.current, elR.current);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fff", color: "#18181b", display: "flex", flexDirection: "column" }}>
      {/* Top status */}
      <div style={{ padding: "20px 20px 0", textAlign: "center" }}>
        <div style={{ fontSize: 11, color: status === "error" ? "#dc2626" : "#a1a1aa", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase" }}>
          {status === "connecting" ? "연결 중..." : status === "error" ? "연결 실패" : "통화 중"}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#52525b", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
          {fmt(elapsed)}
        </div>
      </div>

      {/* Avatar */}
      <div style={{ textAlign: "center", padding: "20px 0 12px" }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          {aiSpeaking && (
            <div style={{ position: "absolute", inset: -14, borderRadius: "50%", border: `2.5px solid ${ci.color}`, animation: "pulse2 2s infinite" }} />
          )}
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: `${ci.color}12`, border: `3px solid ${ci.color}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>
            {ci.emoji}
          </div>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginTop: 10, color: "#18181b" }}>{ci.name}</h2>
        <p style={{ fontSize: 12, color: "#a1a1aa" }}>
          {ci.role} · {DIFFICULTIES.find((d) => d.id === diff)?.label}
        </p>
      </div>

      {/* Subtitles */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 16px 170px", minHeight: 0 }}>
        {status === "connecting" && (
          <div style={{ textAlign: "center", padding: "36px 0", color: "#a1a1aa" }}>
            <LoaderIcon size={24} color="#a1a1aa" />
            <p style={{ fontSize: 13, marginTop: 10 }}>연결 중입니다...</p>
          </div>
        )}
        {status === "error" && (
          <div style={{ textAlign: "center", padding: "36px 20px" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>⚠️</div>
            <p style={{ fontSize: 13, color: "#dc2626" }}>연결에 실패했습니다.</p>
            {connectionError && (
              <p style={{ fontSize: 13, color: "#b91c1c", marginTop: 8, lineHeight: 1.5 }}>{connectionError}</p>
            )}
            <p style={{ fontSize: 12, color: "#71717a", marginTop: 12 }}>
              API 키는 <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>Google AI Studio</a>에서 발급받고, <strong>Generative Language API</strong>가 사용 설정되어 있는지 확인해 주세요.
            </p>
          </div>
        )}

        {subs.map((s, i) => (
          <div key={i} style={{ display: "flex", justifyContent: s.role === "user" ? "flex-end" : "flex-start", marginBottom: 8, animation: "fadeUp .2s ease" }}>
            <div style={{
              maxWidth: "82%", padding: "10px 14px",
              borderRadius: s.role === "user" ? "18px 18px 6px 18px" : "18px 18px 18px 6px",
              background: s.role === "user" ? ci.color : "#f4f4f5",
              color: s.role === "user" ? "#fff" : "#18181b",
              fontSize: 14, lineHeight: 1.55,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 2, opacity: 0.7 }}>
                {s.role === "user" ? "You" : ci.name}
              </div>
              {s.text}
              {!s.done && (
                <span style={{ display: "inline-flex", gap: 3, marginLeft: 6, verticalAlign: "middle" }}>
                  {[0, 1, 2].map((j) => (
                    <span key={j} style={{
                      width: 4, height: 4, borderRadius: "50%",
                      background: s.role === "user" ? "#ffffff90" : "#a1a1aa",
                      display: "inline-block", animation: `dotB 1.4s ${j * 0.2}s infinite`,
                    }} />
                  ))}
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={subsEnd} />
      </div>

      {/* Bottom controls */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, #fff 24%)", padding: "44px 20px 28px" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20 }}>
          <CtrlBtn onClick={() => setMuted(!muted)} active={muted} activeColor="#dc2626">
            {muted ? <MicOffIcon size={22} color="#fff" /> : <MicIcon size={22} color="#52525b" />}
          </CtrlBtn>
          <button onClick={endCall} style={{
            width: 64, height: 64, borderRadius: "50%", background: "#dc2626", border: "none", color: "#fff",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 20px #dc262640", flexShrink: 0,
          }}>
            <PhoneOffIcon size={26} color="#fff" />
          </button>
          <CtrlBtn onClick={hint} disabled={hintLoading || status !== "connected"} active={hintLoading} activeColor="#d97706">
            {hintLoading ? <LoaderIcon size={22} color="#fff" /> : <LightbulbIcon size={22} color="#52525b" />}
          </CtrlBtn>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 46, marginTop: 6 }}>
          <span style={{ fontSize: 10, color: "#a1a1aa", width: 52, textAlign: "center" }}>{muted ? "음소거 해제" : "음소거"}</span>
          <span style={{ fontSize: 10, color: "#dc2626", width: 52, textAlign: "center" }}>종료</span>
          <span style={{ fontSize: 10, color: "#a1a1aa", width: 52, textAlign: "center" }}>힌트</span>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  FEEDBACK SCREEN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function FeedbackScreen({ apiKey, transcripts, elapsed, settings, onRestart }) {
  const { diff, char } = settings;
  const ci = CHARACTERS.find((c) => c.id === char);
  const [tab, setTab] = useState("script");
  const [fb, setFb] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (transcripts.length === 0) { setLoading(false); return; }
    const script = transcripts
      .map((t) => `[${fmt(t.time)}] ${t.role === "ai" ? ci.name : "User"}: ${t.text}`)
      .join("\n");

    (async () => {
      try {
        const r = await fetch(`${GEMINI_REST}?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Analyze this English phone conversation by a Korean student (difficulty: ${diff}).

Transcript:
${script}

Respond ONLY in this JSON:
{"corrections":[{"original":"...","corrected":"...","explanation":"Korean explanation"}],"keyExpressions":[{"expression":"...","meaning":"Korean meaning","example":"example sentence"}],"overallFeedback":"Korean feedback 2-3 sentences","score":75}` }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        });
        const d = await r.json();
        const t = d.candidates?.[0]?.content?.parts?.[0]?.text;
        if (t) setFb(JSON.parse(t));
      } catch {
        setFb({ corrections: [], keyExpressions: [], overallFeedback: "피드백 생성에 실패했습니다.", score: 0 });
      }
      setLoading(false);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const tabs = [
    { id: "script", label: "스크립트", emoji: "💬" },
    { id: "corrections", label: "표현 교정", emoji: "✏️" },
    { id: "expressions", label: "핵심 표현", emoji: "⭐" },
  ];

  const scoreColor = fb
    ? fb.score >= 70 ? "#16a34a" : fb.score >= 40 ? "#d97706" : "#dc2626"
    : "#a1a1aa";

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", color: "#18181b" }}>
      {/* Header with score */}
      <div style={{ padding: "24px 20px 16px", textAlign: "center", background: "#fff", borderBottom: "1px solid #f4f4f5" }}>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>📊 통화 리포트</h2>
        <p style={{ fontSize: 12, color: "#a1a1aa", marginTop: 2 }}>
          {ci.emoji} {ci.name} · {fmt(elapsed)} 대화
        </p>

        {fb && (
          <div style={{
            margin: "16px auto 4px", width: 72, height: 72, borderRadius: "50%",
            background: `conic-gradient(${scoreColor} ${fb.score * 3.6}deg, #f4f4f5 0deg)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{
              width: 58, height: 58, borderRadius: "50%", background: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, fontWeight: 800, color: scoreColor,
            }}>
              {fb.score}
            </div>
          </div>
        )}
        {fb?.overallFeedback && (
          <p style={{ fontSize: 13, color: "#52525b", margin: "8px 12px 0", lineHeight: 1.6 }}>
            {fb.overallFeedback}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", padding: "0 16px", background: "#fff", gap: 0, borderBottom: "1px solid #f4f4f5" }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "12px 4px", background: "none", border: "none",
            borderBottom: tab === t.id ? `2.5px solid ${ci.color}` : "2.5px solid transparent",
            color: tab === t.id ? "#18181b" : "#a1a1aa",
            cursor: "pointer", fontSize: 12, fontWeight: 700,
          }}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: 16, paddingBottom: 110 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#a1a1aa" }}>
            <LoaderIcon size={24} color="#a1a1aa" />
            <p style={{ fontSize: 13, marginTop: 10 }}>분석 중...</p>
          </div>
        ) : (
          <>
            {/* Script tab */}
            {tab === "script" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {transcripts.length === 0 && (
                  <p style={{ color: "#a1a1aa", textAlign: "center", fontSize: 13 }}>대화 기록이 없습니다.</p>
                )}
                {transcripts.map((t, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: t.role === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{
                      maxWidth: "82%", padding: "10px 14px",
                      borderRadius: t.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: t.role === "user" ? ci.color : "#f4f4f5",
                      color: t.role === "user" ? "#fff" : "#18181b",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.7 }}>
                          {t.role === "user" ? "You" : ci.name}
                        </span>
                        <span style={{ fontSize: 10, opacity: 0.5 }}>{fmt(t.time)}</span>
                      </div>
                      <div style={{ fontSize: 14, lineHeight: 1.5 }}>{t.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Corrections tab */}
            {tab === "corrections" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {!fb?.corrections?.length && (
                  <p style={{ color: "#a1a1aa", textAlign: "center", fontSize: 13 }}>교정 사항이 없어요! 잘 하셨습니다 🎉</p>
                )}
                {fb?.corrections?.map((c, i) => (
                  <div key={i} style={{ padding: 16, background: "#fff", borderRadius: 14, border: "1px solid #f4f4f5", boxShadow: "0 1px 3px #00000006" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#dc2626", background: "#fef2f2", padding: "2px 8px", borderRadius: 6 }}>BEFORE</span>
                      <span style={{ fontSize: 13, color: "#dc2626", textDecoration: "line-through" }}>{c.original}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", background: "#f0fdf4", padding: "2px 8px", borderRadius: 6 }}>AFTER</span>
                      <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>{c.corrected}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#71717a", paddingLeft: 2 }}>{c.explanation}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Expressions tab */}
            {tab === "expressions" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {!fb?.keyExpressions?.length && (
                  <p style={{ color: "#a1a1aa", textAlign: "center", fontSize: 13 }}>핵심 표현이 없습니다.</p>
                )}
                {fb?.keyExpressions?.map((e, i) => (
                  <div key={i} style={{ padding: 16, background: "#fff", borderRadius: 14, border: "1px solid #f4f4f5", boxShadow: "0 1px 3px #00000006" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: ci.color, marginBottom: 4 }}>"{e.expression}"</div>
                    <div style={{ fontSize: 13, color: "#52525b", marginBottom: 6 }}>{e.meaning}</div>
                    <div style={{ fontSize: 12, color: "#a1a1aa" }}>💡 {e.example}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* CTA */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 20px 24px", background: "linear-gradient(transparent, #fafafa 30%)", paddingTop: 40 }}>
        <button onClick={onRestart} style={{
          width: "100%", padding: "16px", background: ci.color, border: "none", borderRadius: 16, color: "#fff",
          fontSize: 16, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          boxShadow: `0 4px 20px ${ci.color}40`,
        }}>
          📞 새로운 통화 시작
        </button>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ROOT APP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function App() {
  const [apiKey, setApiKey] = useState(() => {
    try {
      return typeof localStorage !== "undefined" ? localStorage.getItem(API_KEY_STORAGE) : null;
    } catch {
      return null;
    }
  });
  const [screen, setScreen] = useState(apiKey ? "setup" : "apiKey");
  const [settings, setSettings] = useState(null);
  const [callData, setCallData] = useState(null);

  // Sync screen when apiKey is set from ApiKeyScreen
  useEffect(() => {
    if (apiKey && screen === "apiKey") setScreen("setup");
  }, [apiKey, screen]);

  if (!apiKey) {
    return <ApiKeyScreen onContinue={(key) => { setApiKey(key); setScreen("setup"); }} />;
  }
  if (screen === "setup") {
    return (
      <SetupScreen
        onStart={(s) => { setSettings(s); setScreen("call"); }}
        onChangeApiKey={() => { setApiKey(null); setScreen("apiKey"); }}
      />
    );
  }
  if (screen === "call") {
    return <CallScreen apiKey={apiKey} settings={settings} onEnd={(t, e) => { setCallData({ t, e }); setScreen("feedback"); }} />;
  }
  if (screen === "feedback") {
    return (
      <FeedbackScreen
        apiKey={apiKey}
        transcripts={callData.t}
        elapsed={callData.e}
        settings={settings}
        onRestart={() => { setCallData(null); setScreen("setup"); }}
      />
    );
  }
}
