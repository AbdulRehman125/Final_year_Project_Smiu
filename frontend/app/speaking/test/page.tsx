
















// "use client";

// // app/speaking/test/page.tsx — IELTS Speaking Test (AI Examiner)

// import { useEffect, useRef, useState, useCallback, useMemo, type CSSProperties } from "react";
// import { useRouter } from "next/navigation";
// import {
//   Mic,
//   Moon,
//   Radio,
//   Bot,
//   User,
//   Wifi,
//   ShieldCheck,
//   SkipForward,
//   LogOut,
//   Loader2,
// } from "lucide-react";

// // ─── Types ───────────────────────────────────────────────────────────────

// type MessageRole = "examiner" | "user" | "system" | "divider";
// type TestPart = "part1" | "part2" | "part3" | "completed";

// interface Part2Topic {
//   title: string;
//   bullet_points: string[];
// }

// interface ChatMessage {
//   role: MessageRole;
//   text: string;
//   part?: TestPart;
//   /** When present, this examiner message renders as a structured Part 2 cue card. */
//   cueCard?: Part2Topic;
// }

// type TestStatus =
//   | "idle"
//   | "connecting"
//   | "running"
//   | "examiner_speaking"
//   | "user_speaking"
//   | "part2_prep"
//   | "evaluating"
//   | "done";

// const PART_LABEL: Record<TestPart, string> = {
//   part1: "Part 1 — Interview",
//   part2: "Part 2 — Long Turn",
//   part3: "Part 3 — Discussion",
//   completed: "Test Complete",
// };

// // How long the mic can stay open with ZERO detected speech before we
// // treat it as "no answer" and auto-advance — distinct from the shorter
// // post-speech silence window that submits a completed answer.
// const NO_SPEECH_TIMEOUT_MS = 6000;
// const POST_SPEECH_SILENCE_MS = 2000;
// const SILENCE_VOLUME_THRESHOLD = 12;
// // Hard safety caps: even if silence detection fails for any reason, the mic
// // is force-closed after this long so a turn can never hang open forever.
// const MAX_ANSWER_MS = 45000;
// const MAX_ANSWER_PART2_MS = 120000;
// // If Part 2 prep ends and the backend never sends a "begin" prompt, open the
// // mic ourselves so the candidate is never stuck unable to answer.
// const PART2_BEGIN_FALLBACK_MS = 4000;

// // Professional spoken transitions, prepended when a new part begins so the
// // examiner clearly announces the move (only added if the backend text hasn't
// // already announced it).
// const PART_INTRO: Partial<Record<TestPart, string>> = {
//   part2:
//     "Thank you. That's the end of Part 1. Now let's move on to Part 2.",
//   part3:
//     "Thank you. That brings us to the end of Part 2. Now let's move on to Part 3, the discussion, where I'll ask you some broader questions related to the topic we've just talked about.",
// };

// function formatElapsed(totalSeconds: number) {
//   const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
//   const s = (totalSeconds % 60).toString().padStart(2, "0");
//   return `${m}:${s}`;
// }

// /**
//  * Live equalizer that matches the reference design: a horizontal strip of
//  * thin bars, tall on the left and tapering to short/faded on the right,
//  * each animating independently so it reads like real-time speech.
//  */
// function SoundWave() {
//   const bars = useMemo(
//     () =>
//       Array.from({ length: 30 }, (_, i) => {
//         // Deterministic pseudo-random config (stable across re-renders).
//         const min = 18 + ((i * 41) % 26); // 18–44%
//         const max = 55 + ((i * 67) % 45); // 55–100%
//         const duration = 520 + ((i * 137) % 520); // 520–1040ms
//         const delay = (i * 90) % 1300; // staggered start
//         // Gentle opacity taper toward the right, like the reference image.
//         const opacity = i < 20 ? 1 : Math.max(0.28, 1 - (i - 19) * 0.07);
//         return { min, max, duration, delay, opacity };
//       }),
//     []
//   );

//   return (
//     <div className="flex items-center gap-[2px] h-5" aria-hidden="true">
//       {bars.map((b, i) => (
//         <span
//           key={i}
//           className="w-[2px] rounded-full bg-blue-500"
//           style={
//             {
//               height: `${b.max}%`,
//               opacity: b.opacity,
//               animation: `iel-sw ${b.duration}ms ease-in-out ${b.delay}ms infinite alternate`,
//               // Consumed by the keyframes below.
//               "--sw-min": `${b.min}%`,
//               "--sw-max": `${b.max}%`,
//             } as CSSProperties
//           }
//         />
//       ))}
//       <style>{`
//         @keyframes iel-sw {
//           0%   { height: var(--sw-min); }
//           100% { height: var(--sw-max); }
//         }
//       `}</style>
//     </div>
//   );
// }

// /** Small reactive waveform for the candidate mic — heights follow real volume. */
// function LiveMicWave({ level }: { level: number }) {
//   const factors = [0.55, 0.85, 1, 0.8, 0.5];
//   return (
//     <div className="flex items-end justify-center gap-1 h-8">
//       {factors.map((f, i) => {
//         const h = Math.max(12, Math.min(100, level * f * 1.4));
//         return (
//           <span
//             key={i}
//             className="w-1 rounded-full bg-red-400 transition-[height] duration-100 ease-out"
//             style={{ height: `${h}%` }}
//           />
//         );
//       })}
//     </div>
//   );
// }

// export default function SpeakingTestPage() {
//   const router = useRouter();
//   const sessionId = useRef(`session_${Date.now()}`);

//   const ws = useRef<WebSocket | null>(null);
//   const mediaRecorder = useRef<MediaRecorder | null>(null);
//   const audioStream = useRef<MediaStream | null>(null);
//   const audioChunks = useRef<BlobPart[]>([]);
//   const silenceTimer = useRef<NodeJS.Timeout | null>(null);
//   const noSpeechTimer = useRef<NodeJS.Timeout | null>(null);
//   const maxAnswerTimer = useRef<NodeJS.Timeout | null>(null);
//   const part2BeginTimer = useRef<NodeJS.Timeout | null>(null);
//   const hasSpokenRef = useRef(false);
//   const noiseSamplesRef = useRef<number[]>([]);

//   // Audio graph — created ONCE per session and reused. Recreating an
//   // AudioContext on every turn eventually hits the browser's context limit,
//   // which kills the analyser and leaves the mic hanging open. Reuse fixes that.
//   const audioCtxRef = useRef<AudioContext | null>(null);
//   const analyserRef = useRef<AnalyserNode | null>(null);
//   const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
//   const freqDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
//   const animFrameRef = useRef<number | null>(null);

//   // Mirror status/part in refs to avoid stale-closure reads inside async
//   // callbacks (TTS onend, WS onmessage, RAF loop).
//   const statusRef = useRef<TestStatus>("idle");
//   const currentPartRef = useRef<TestPart>("part1");
//   const prevPartRef = useRef<TestPart | null>(null);

//   const [status, setStatus] = useState<TestStatus>("idle");
//   const [currentPart, setCurrentPart] = useState<TestPart>("part1");
//   const [questionNumber, setQuestionNumber] = useState(1);
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [part2Topic, setPart2Topic] = useState<Part2Topic | null>(null);
//   const [prepTimeLeft, setPrepTimeLeft] = useState(60);
//   const [isMicActive, setIsMicActive] = useState(false);
//   const [volumeLevel, setVolumeLevel] = useState(0);
//   const [elapsedSeconds, setElapsedSeconds] = useState(0);
//   const [noiseLevel, setNoiseLevel] = useState<"LOW" | "HIGH">("LOW");
//   const chatEndRef = useRef<HTMLDivElement>(null);
//   const prepTimer = useRef<NodeJS.Timeout | null>(null);
//   const elapsedTimer = useRef<NodeJS.Timeout | null>(null);
//   // TTS hardening: cached voices + a keep-alive so Chrome doesn't pause long
//   // utterances, and a watchdog so a silently-queued utterance gets re-kicked.
//   const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
//   const ttsKeepAlive = useRef<NodeJS.Timeout | null>(null);
//   const ttsWatchdog = useRef<NodeJS.Timeout | null>(null);

//   const setStatusBoth = useCallback((s: TestStatus) => {
//     statusRef.current = s;
//     setStatus(s);
//   }, []);

//   const applyPart = useCallback((p: TestPart) => {
//     currentPartRef.current = p;
//     setCurrentPart(p);
//   }, []);

//   /** Push a centered part-transition marker so each new part is unmistakable. */
//   const pushDivider = useCallback((p: TestPart) => {
//     if (prevPartRef.current === p) return;
//     prevPartRef.current = p;
//     setMessages((prev) => [...prev, { role: "divider", text: PART_LABEL[p], part: p }]);
//   }, []);

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // ─── Elapsed timer ────────────────────────────────────────────────

//   useEffect(() => {
//     if (status === "idle" || status === "connecting" || status === "done") return;
//     elapsedTimer.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
//     return () => {
//       if (elapsedTimer.current) clearInterval(elapsedTimer.current);
//     };
//   }, [status]);

//   // ─── TTS (Examiner speaks) ────────────────────────────────────────

//   // Voices are populated asynchronously — pre-load and keep them fresh so the
//   // first (and every) utterance has its voice ready and doesn't stall.
//   useEffect(() => {
//     const load = () => {
//       const v = window.speechSynthesis.getVoices();
//       if (v.length) voicesRef.current = v;
//     };
//     load();
//     window.speechSynthesis.addEventListener?.("voiceschanged", load);
//     return () =>
//       window.speechSynthesis.removeEventListener?.("voiceschanged", load);
//   }, []);

//   const clearTtsTimers = useCallback(() => {
//     if (ttsKeepAlive.current) { clearInterval(ttsKeepAlive.current); ttsKeepAlive.current = null; }
//     if (ttsWatchdog.current) { clearTimeout(ttsWatchdog.current); ttsWatchdog.current = null; }
//   }, []);

//   const speakAsExaminer = useCallback(
//     (text: string, onDone?: () => void) => {
//       const synth = window.speechSynthesis;
//       synth.cancel();
//       clearTtsTimers();

//       const voices =
//         voicesRef.current.length > 0 ? voicesRef.current : synth.getVoices();
//       const preferred =
//         voices.find((v) => v.lang === "en-GB" && /female/i.test(v.name)) ||
//         voices.find((v) => v.lang === "en-GB") ||
//         voices.find((v) => v.lang.startsWith("en"));

//       const build = () => {
//         const u = new SpeechSynthesisUtterance(text);
//         u.rate = 0.9;
//         u.pitch = 1.0;
//         u.volume = 1.0;
//         if (preferred) u.voice = preferred;
//         return u;
//       };

//       let finished = false;
//       let started = false;

//       const finish = () => {
//         if (finished) return;
//         finished = true;
//         clearTtsTimers();
//         onDone?.();
//       };

//       const utterance = build();
//       utterance.onstart = () => { started = true; };
//       utterance.onend = finish;
//       utterance.onerror = finish;

//       setStatusBoth("examiner_speaking");

//       // Chrome silently pauses speech after ~15s — resume() keeps it going.
//       ttsKeepAlive.current = setInterval(() => {
//         if (synth.speaking && !synth.paused) synth.resume();
//       }, 8000);

//       synth.speak(utterance);

//       // Watchdog: if speech neither started nor is queued shortly after speak(),
//       // re-issue it once. Fixes the occasional "queued but never spoke" bug.
//       ttsWatchdog.current = setTimeout(() => {
//         if (!started && !finished && !synth.speaking) {
//           const retry = build();
//           retry.onstart = () => { started = true; };
//           retry.onend = finish;
//           retry.onerror = finish;
//           synth.cancel();
//           synth.speak(retry);
//         }
//       }, 450);
//     },
//     [setStatusBoth, clearTtsTimers]
//   );

//   // ─── Audio graph (created once, reused every turn) ────────────────

//   const setupAudioGraph = useCallback((): AnalyserNode | null => {
//     if (!audioStream.current) return null;
//     try {
//       if (!audioCtxRef.current) {
//         const Ctx =
//           window.AudioContext ||
//           (window as unknown as { webkitAudioContext: typeof AudioContext })
//             .webkitAudioContext;
//         audioCtxRef.current = new Ctx();
//       }
//       const ctx = audioCtxRef.current;
//       // Autoplay policy can leave the context suspended — resume defensively.
//       if (ctx.state === "suspended") ctx.resume().catch(() => {});

//       if (!analyserRef.current) {
//         const analyser = ctx.createAnalyser();
//         analyser.fftSize = 512;
//         analyser.smoothingTimeConstant = 0.6;
//         analyserRef.current = analyser;
//         freqDataRef.current = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
//       }
//       if (!sourceRef.current) {
//         sourceRef.current = ctx.createMediaStreamSource(audioStream.current);
//         sourceRef.current.connect(analyserRef.current);
//       }
//       return analyserRef.current;
//     } catch (e) {
//       console.error("Audio graph setup failed", e);
//       return null;
//     }
//   }, []);

//   // ─── Recording + silence/no-speech detection ─────────────────────

//   const clearRecordingTimers = useCallback(() => {
//     if (silenceTimer.current) { clearTimeout(silenceTimer.current); silenceTimer.current = null; }
//     if (noSpeechTimer.current) { clearTimeout(noSpeechTimer.current); noSpeechTimer.current = null; }
//     if (maxAnswerTimer.current) { clearTimeout(maxAnswerTimer.current); maxAnswerTimer.current = null; }
//     if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
//   }, []);

//   const stopRecording = useCallback(() => {
//     clearRecordingTimers();
//     setIsMicActive(false);
//     setVolumeLevel(0);
//     if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
//       mediaRecorder.current.stop();
//     }
//   }, [clearRecordingTimers]);

//   /** No answer within the timeout, or Skip pressed — advance the session. */
//   const skipNoAnswer = useCallback(() => {
//     clearRecordingTimers();
//     setIsMicActive(false);
//     setVolumeLevel(0);
//     if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
//       // Stop without sending audio — onstop below checks hasSpokenRef.
//       mediaRecorder.current.stop();
//     }
//     setMessages((prev) => [
//       ...prev,
//       { role: "system", text: "No response detected — moving to the next question." },
//     ]);
//     if (ws.current?.readyState === WebSocket.OPEN) {
//       ws.current.send(JSON.stringify({ command: "skip_no_answer" }));
//     }
//   }, [clearRecordingTimers]);

//   const startRecording = useCallback(() => {
//     if (!audioStream.current) return;

//     const st = statusRef.current;
//     if (st === "part2_prep" || st === "evaluating" || st === "done") return;
//     if (mediaRecorder.current && mediaRecorder.current.state === "recording") return;

//     const analyser = setupAudioGraph();
//     const data = freqDataRef.current;
//     if (!analyser || !data) return;

//     // Clear any stray loop/timers from a previous turn before starting fresh.
//     clearRecordingTimers();
//     if (part2BeginTimer.current) { clearTimeout(part2BeginTimer.current); part2BeginTimer.current = null; }

//     setStatusBoth("user_speaking");
//     setIsMicActive(true);
//     audioChunks.current = [];
//     hasSpokenRef.current = false;
//     noiseSamplesRef.current = [];

//     let recorder: MediaRecorder;
//     try {
//       recorder = new MediaRecorder(audioStream.current, { mimeType: "audio/webm" });
//     } catch {
//       recorder = new MediaRecorder(audioStream.current);
//     }
//     mediaRecorder.current = recorder;

//     recorder.ondataavailable = (e) => {
//       if (e.data.size > 0) audioChunks.current.push(e.data);
//     };

//     recorder.onstop = () => {
//       // Only send audio if the candidate actually spoke — a pure no-speech
//       // timeout is handled separately via skipNoAnswer().
//       if (hasSpokenRef.current) {
//         const blob = new Blob(audioChunks.current, { type: "audio/webm" });
//         if (blob.size > 1000 && ws.current?.readyState === WebSocket.OPEN) {
//           blob.arrayBuffer().then((buf) => ws.current?.send(buf));
//         }
//       }
//       audioChunks.current = [];
//     };

//     const detectSpeech = () => {
//       analyser.getByteFrequencyData(data);
//       const avg = data.reduce((a, b) => a + b, 0) / data.length;
//       setVolumeLevel(Math.min(100, avg * 3));

//       if (avg < SILENCE_VOLUME_THRESHOLD) {
//         // Ambient/background noise sample (only while not mid-speech).
//         if (!hasSpokenRef.current) {
//           noiseSamplesRef.current.push(avg);
//           if (noiseSamplesRef.current.length > 15) noiseSamplesRef.current.shift();
//           const noiseAvg =
//             noiseSamplesRef.current.reduce((a, b) => a + b, 0) /
//             noiseSamplesRef.current.length;
//           setNoiseLevel(noiseAvg > 8 ? "HIGH" : "LOW");
//         }

//         if (hasSpokenRef.current && !silenceTimer.current) {
//           silenceTimer.current = setTimeout(() => {
//             silenceTimer.current = null;
//             stopRecording();
//           }, POST_SPEECH_SILENCE_MS);
//         }
//       } else {
//         if (!hasSpokenRef.current) {
//           // First real speech — cancel the no-speech timeout.
//           hasSpokenRef.current = true;
//           if (noSpeechTimer.current) { clearTimeout(noSpeechTimer.current); noSpeechTimer.current = null; }
//         }
//         if (silenceTimer.current) { clearTimeout(silenceTimer.current); silenceTimer.current = null; }
//       }
//       animFrameRef.current = requestAnimationFrame(detectSpeech);
//     };

//     // Never spoke at all → auto-advance instead of leaving the mic open.
//     noSpeechTimer.current = setTimeout(() => {
//       if (!hasSpokenRef.current) skipNoAnswer();
//     }, NO_SPEECH_TIMEOUT_MS);

//     // Absolute safety cap — the mic can never hang open past this.
//     const maxMs =
//       currentPartRef.current === "part2" ? MAX_ANSWER_PART2_MS : MAX_ANSWER_MS;
//     maxAnswerTimer.current = setTimeout(() => {
//       if (statusRef.current === "user_speaking") stopRecording();
//     }, maxMs);

//     recorder.start();
//     detectSpeech();
//   }, [setupAudioGraph, clearRecordingTimers, setStatusBoth, stopRecording, skipNoAnswer]);

//   // ─── WebSocket message handler ────────────────────────────────────

//   const handleWsMessage = useCallback(
//     (data: Record<string, unknown>) => {
//       const type = data.type as string;

//       if (type === "opening") {
//         const text = data.text as string;
//         setQuestionNumber((data.question_number as number) ?? 1);
//         applyPart("part1");
//         pushDivider("part1");
//         setMessages((prev) => [...prev, { role: "examiner", text, part: "part1" }]);
//         speakAsExaminer(text, () => startRecording());
//       } else if (type === "user_transcript") {
//         setMessages((prev) => [...prev, { role: "user", text: data.text as string }]);
//       } else if (type === "no_speech_detected") {
//         // Backend received audio but found no words — re-arm the mic.
//         startRecording();
//       } else if (type === "part2_topic") {
//         const topic: Part2Topic = {
//           title: data.title as string,
//           bullet_points: (data.bullet_points as string[]) ?? [],
//         };
//         setPart2Topic(topic);
//         applyPart("part2");
//         pushDivider("part2");
//         // Clean, structured cue card in the chat (no run-on paragraph).
//         setMessages((prev) => [
//           ...prev,
//           {
//             role: "examiner",
//             part: "part2",
//             text: "Now we'll move on to Part 2. Here is your topic — you have one minute to prepare, and you may make notes.",
//             cueCard: topic,
//           },
//         ]);
//         setStatusBoth("part2_prep");

//         setPrepTimeLeft(60);
//         let t = 60;
//         prepTimer.current = setInterval(() => {
//           t--;
//           setPrepTimeLeft(t);
//           if (t <= 0) {
//             if (prepTimer.current) { clearInterval(prepTimer.current); prepTimer.current = null; }
//             if (ws.current?.readyState === WebSocket.OPEN) {
//               ws.current.send(JSON.stringify({ command: "part2_ready" }));
//             }
//             // Leave prep so the next examiner prompt can open the mic.
//             setStatusBoth("running");
//             // Fallback: if no "begin" prompt arrives, open the mic ourselves.
//             part2BeginTimer.current = setTimeout(() => {
//               if (statusRef.current === "running") startRecording();
//             }, PART2_BEGIN_FALLBACK_MS);
//           }
//         }, 1000);
//       } else if (type === "examiner_text") {
//         const rawText = data.text as string;
//         const part = (data.part as TestPart) ?? currentPartRef.current;
//         const complete = data.test_complete as boolean;
//         if (data.question_number) setQuestionNumber(data.question_number as number);

//         // Detect a forward part transition BEFORE pushDivider updates the ref.
//         const isNewPart = prevPartRef.current !== null && prevPartRef.current !== part;

//         applyPart(part);
//         pushDivider(part);

//         // If we've just entered a new part and the backend didn't announce it,
//         // prepend a professional transition so the examiner says it out loud.
//         let text = rawText;
//         const alreadyAnnounced = new RegExp(`part\\s*${part.replace("part", "")}`, "i").test(rawText);
//         if (isNewPart && PART_INTRO[part] && !alreadyAnnounced) {
//           text = `${PART_INTRO[part]} ${rawText}`.trim();
//         }

//         // Suppress the raw cue-card run-on if the backend also sends it as a
//         // spoken instruction — we already render a clean cue card in chat.
//         const isCueCardRunOn = /you should say/i.test(text);
//         if (!isCueCardRunOn) {
//           setMessages((prev) => [...prev, { role: "examiner", text, part }]);
//         }

//         if (complete) {
//           // Speak the closing line through the hardened path (voice + watchdog),
//           // then move into evaluation.
//           speakAsExaminer(text, () => {});
//           setStatusBoth("evaluating");
//         } else if (statusRef.current === "part2_prep") {
//           // Spoken during the 60s prep window — speak only, don't record yet.
//           speakAsExaminer(text, () => {});
//         } else {
//           if (part2BeginTimer.current) { clearTimeout(part2BeginTimer.current); part2BeginTimer.current = null; }
//           speakAsExaminer(text, () => startRecording());
//         }
//       } else if (type === "evaluating") {
//         setStatusBoth("evaluating");
//         setMessages((prev) => [
//           ...prev,
//           { role: "system", text: "Evaluating your performance. Please wait..." },
//         ]);
//       } else if (type === "evaluation") {
//         setStatusBoth("done");
//         // Store in sessionStorage instead of a giant URL (avoids URL-length
//         // limits and keeps the result out of browser history/logs).
//         try {
//           sessionStorage.setItem("speaking_results", JSON.stringify(data.result));
//         } catch {
//           /* ignore quota errors — results page has a query fallback */
//         }
//         router.push("/speaking/results");
//       } else if (type === "error") {
//         setMessages((prev) => [
//           ...prev,
//           { role: "system", text: `${data.message} Please refresh and try again.` },
//         ]);
//         setStatusBoth("idle");
//       }
//     },
//     [applyPart, pushDivider, speakAsExaminer, startRecording, setStatusBoth, router]
//   );

//   // ─── Start Test ────────────────────────────────────────────────────

//   const startTest = async () => {
//     setStatusBoth("connecting");

//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 },
//       });
//       audioStream.current = stream;
//       // Warm up the (single) audio graph now, on a real user gesture.
//       setupAudioGraph();
//     } catch {
//       alert("Microphone access denied. Please allow microphone access and try again.");
//       setStatusBoth("idle");
//       return;
//     }

//     const backendHost =
//       process.env.NEXT_PUBLIC_BACKEND_WS_URL || "ws://localhost:8000";
//     const socket = new WebSocket(`${backendHost}/ws/speaking/${sessionId.current}`);
//     ws.current = socket;

//     socket.onopen = () => setStatusBoth("running");
//     socket.onmessage = (event) => {
//       try {
//         handleWsMessage(JSON.parse(event.data));
//       } catch {
//         console.error("WS parse error", event.data);
//       }
//     };
//     socket.onclose = () => {
//       if (statusRef.current !== "done" && statusRef.current !== "evaluating") {
//         setStatusBoth("idle");
//       }
//     };
//     socket.onerror = () => setStatusBoth("idle");
//   };

//   const endTestNow = () => {
//     stopRecording();
//     // Optimistic UI — show "Evaluating" immediately rather than waiting on the WS.
//     setStatusBoth("evaluating");
//     setMessages((prev) => [
//       ...prev,
//       { role: "system", text: "Ending test — evaluating your performance..." },
//     ]);
//     if (ws.current?.readyState === WebSocket.OPEN) {
//       ws.current.send(JSON.stringify({ command: "end_test" }));
//     }
//   };

//   const skipQuestion = () => {
//     if (statusRef.current === "user_speaking") skipNoAnswer();
//   };

//   // ─── Cleanup ───────────────────────────────────────────────────────

//   useEffect(() => {
//     return () => {
//       ws.current?.close();
//       audioStream.current?.getTracks().forEach((t) => t.stop());
//       try {
//         sourceRef.current?.disconnect();
//       } catch {
//         /* noop */
//       }
//       audioCtxRef.current?.close().catch(() => {});
//       window.speechSynthesis.cancel();
//       if (prepTimer.current) clearInterval(prepTimer.current);
//       if (elapsedTimer.current) clearInterval(elapsedTimer.current);
//       if (part2BeginTimer.current) clearTimeout(part2BeginTimer.current);
//       clearTtsTimers();
//       clearRecordingTimers();
//     };
//   }, [clearRecordingTimers, clearTtsTimers]);

//   // ─── Render ────────────────────────────────────────────────────────

//   const examinerStatusLabel =
//     status === "examiner_speaking"
//       ? { text: "SPEAKING", color: "text-blue-600 bg-blue-50" }
//       : status === "evaluating"
//       ? { text: "THINKING", color: "text-amber-600 bg-amber-50" }
//       : { text: "LISTENING", color: "text-emerald-600 bg-emerald-50" };

//   return (
//     <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
//       <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col px-4 py-4 gap-3 min-h-0">

//         {/* ── Header — 3 cards ── */}
//         <div className="flex flex-col sm:flex-row gap-3">
//           <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 flex items-center gap-3">
//             <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
//               <Mic className="w-4 h-4" />
//             </div>
//             <div>
//               <p className="text-sm font-semibold text-gray-900 leading-tight">IELTS Speaking</p>
//               <p className="text-xs text-gray-500 leading-tight">
//                 {PART_LABEL[currentPart].split(" — ")[1] ?? PART_LABEL[currentPart]}
//               </p>
//             </div>
//             <button
//               className="ml-2 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 shrink-0"
//               aria-label="Toggle theme"
//             >
//               <Moon className="w-4 h-4" />
//             </button>
//           </div>

//           <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-1.5 flex items-center gap-1.5">
//             {(["part1", "part2", "part3"] as const).map((p) => (
//               <div
//                 key={p}
//                 className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium text-center transition-all flex items-center justify-center gap-2 ${
//                   currentPart === p ? "bg-blue-600 text-white shadow-sm" : "text-gray-400"
//                 }`}
//               >
//                 {p === "part1" ? "Part 1" : p === "part2" ? "Part 2" : "Part 3"}
//                 {currentPart === p && <span className="w-1.5 h-1.5 rounded-full bg-white/80" />}
//               </div>
//             ))}
//           </div>

//           <div className="bg-white border border-gray-200 rounded-2xl px-5 py-2.5 flex items-center justify-between gap-4 min-w-[180px]">
//             <div className="flex items-center gap-2">
//               <Radio className="w-4 h-4 text-blue-500" />
//               <div>
//                 <p className="text-lg font-bold text-gray-900 leading-tight tabular-nums">
//                   {formatElapsed(elapsedSeconds)}
//                 </p>
//                 <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-tight">
//                   Elapsed
//                 </p>
//               </div>
//             </div>
//             {status !== "idle" && status !== "connecting" && (
//               <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
//                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
//                 AI LIVE
//               </span>
//             )}
//           </div>
//         </div>

//         {/* ── Idle / Connecting screen ── */}
//         {(status === "idle" || status === "connecting") && (
//           <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden py-3">
//             <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center">
//               <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30">
//                 <User className="w-6 h-6 text-white" />
//               </div>
//               <h1 className="text-lg font-bold text-gray-900 mb-1.5">IELTS SPEAKING TEST</h1>
//               <p className="text-xs text-gray-500 mb-4 leading-relaxed">
//                 You&apos;ll have a conversation with an AI examiner across three parts.
//                 The test simulates a real IELTS speaking examination.
//               </p>

//               <div className="grid grid-cols-3 gap-2 mb-4">
//                 <div className="bg-gray-50 rounded-xl px-2 py-2">
//                   <p className="text-xs font-semibold text-blue-600 mb-0.5">Part 1</p>
//                   <p className="text-xs text-gray-600">Interview</p>
//                   <p className="text-[11px] text-gray-400 mt-1">4-5 min</p>
//                 </div>
//                 <div className="bg-gray-50 rounded-xl px-2 py-2">
//                   <p className="text-xs font-semibold text-blue-600 mb-0.5">Part 2</p>
//                   <p className="text-xs text-gray-600">Long Turn</p>
//                   <p className="text-[11px] text-gray-400 mt-1">3-4 min</p>
//                 </div>
//                 <div className="bg-gray-50 rounded-xl px-2 py-2">
//                   <p className="text-xs font-semibold text-blue-600 mb-0.5">Part 3</p>
//                   <p className="text-xs text-gray-600">Discussion</p>
//                   <p className="text-[11px] text-gray-400 mt-1">4-5 min</p>
//                 </div>
//               </div>

//               <div className="flex items-start gap-2.5 bg-blue-50/60 rounded-xl px-4 py-3 mb-4 text-left">
//                 <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5 text-blue-500 text-xs font-bold">
//                   +
//                 </div>
//                 <p className="text-xs text-gray-600 leading-relaxed">
//                   Your microphone opens automatically after the examiner speaks. Answer naturally —
//                   the test moves to the next question shortly after you stop talking.
//                 </p>
//               </div>

//               {status === "idle" ? (
//                 <button
//                   onClick={startTest}
//                   className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
//                 >
//                   Begin Speaking Test
//                 </button>
//               ) : (
//                 <div className="w-full bg-gray-100 text-gray-500 font-medium py-3 rounded-xl text-sm flex items-center justify-center gap-2">
//                   <Loader2 className="w-4 h-4 animate-spin" />
//                   Connecting...
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* ── Running screen ── */}
//         {status !== "idle" && status !== "connecting" && (
//           <>
//             <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 min-h-0">

//               {/* Examiner panel */}
//               <div className="relative bg-white border border-gray-200 rounded-2xl flex flex-col min-h-[420px] max-h-[560px]">
//                 <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
//                   <div className="relative shrink-0">
//                     <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center">
//                       <Bot className="w-4.5 h-4.5 text-white" />
//                     </div>
//                     <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-semibold text-gray-900">AI Examiner</p>
//                     <span
//                       className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${examinerStatusLabel.color}`}
//                     >
//                       {examinerStatusLabel.text}
//                     </span>
//                   </div>
//                   {/* Live waveform — right side, exactly like the reference. */}
//                   {status === "examiner_speaking" && (
//                     <div className="shrink-0 pl-2">
//                       <SoundWave />
//                     </div>
//                   )}
//                 </div>

//                 <div className="flex-1 overflow-y-auto p-4 space-y-3">
//                   {messages.map((msg, i) => {
//                     if (msg.role === "divider") {
//                       return (
//                         <div key={i} className="flex items-center gap-3 py-1">
//                           <div className="flex-1 h-px bg-gray-200" />
//                           <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 whitespace-nowrap">
//                             {msg.text}
//                           </span>
//                           <div className="flex-1 h-px bg-gray-200" />
//                         </div>
//                       );
//                     }
//                     return (
//                       <div
//                         key={i}
//                         className={
//                           msg.role === "system"
//                             ? "text-center"
//                             : msg.role === "user"
//                             ? "flex justify-end"
//                             : "flex justify-start"
//                         }
//                       >
//                         <div className="max-w-[85%]">
//                           {msg.role !== "system" && (
//                             <p
//                               className={`text-[10px] font-medium mb-1 ${
//                                 msg.role === "user"
//                                   ? "text-right text-emerald-500"
//                                   : "text-blue-400"
//                               }`}
//                             >
//                               {msg.role === "user" ? "You" : "Examiner"}
//                             </p>
//                           )}
//                           <div
//                             className={`inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed ${
//                               msg.role === "examiner"
//                                 ? "bg-blue-50 text-blue-900 rounded-tl-sm"
//                                 : msg.role === "user"
//                                 ? "bg-emerald-50 text-emerald-900 rounded-tr-sm"
//                                 : "bg-amber-50 text-amber-800 text-xs px-3 py-1.5"
//                             }`}
//                           >
//                             {msg.text}

//                             {/* Structured Part 2 cue card */}
//                             {msg.cueCard && (
//                               <div className="mt-3 rounded-xl bg-white/70 border border-blue-100 p-3">
//                                 <p className="text-[13px] font-semibold text-blue-900 mb-2">
//                                   {msg.cueCard.title}
//                                 </p>
//                                 <p className="text-[11px] font-medium uppercase tracking-wide text-blue-400 mb-1.5">
//                                   You should say
//                                 </p>
//                                 <ul className="space-y-1.5">
//                                   {msg.cueCard.bullet_points.map((bp, bi) => (
//                                     <li
//                                       key={bi}
//                                       className="flex items-start gap-2 text-[13px] text-blue-900/90"
//                                     >
//                                       <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
//                                       <span>{bp}</span>
//                                     </li>
//                                   ))}
//                                 </ul>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                   <div ref={chatEndRef} />
//                 </div>
//               </div>

//               {/* Candidate panel */}
//               <div className="bg-white border border-gray-200 rounded-2xl flex flex-col min-h-[420px] max-h-[560px]">
//                 <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
//                   <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
//                     <User className="w-4.5 h-4.5 text-gray-500" />
//                   </div>
//                   <div className="flex-1">
//                     <p className="text-sm font-semibold text-gray-900">Test Candidate</p>
//                     <p className="text-xs text-gray-400">Your responses</p>
//                   </div>
//                   <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
//                     <Wifi className="w-3 h-3" /> GOOD
//                   </span>
//                   <span
//                     className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
//                       noiseLevel === "LOW"
//                         ? "bg-emerald-50 text-emerald-600"
//                         : "bg-amber-50 text-amber-600"
//                     }`}
//                   >
//                     <ShieldCheck className="w-3 h-3" /> NOISE {noiseLevel}
//                   </span>
//                 </div>

//                 <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
//                   {status === "part2_prep" && part2Topic ? (
//                     <div className="w-full">
//                       <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
//                         Cue Card
//                       </p>
//                       <p className="text-sm font-semibold text-gray-900 mb-3">
//                         {part2Topic.title}
//                       </p>
//                       <p className="text-xs text-gray-500 mb-2">You should say:</p>
//                       <ul className="space-y-1.5 mb-4">
//                         {part2Topic.bullet_points.map((bp, i) => (
//                           <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
//                             <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
//                             <span>{bp}</span>
//                           </li>
//                         ))}
//                       </ul>
//                       <div className="text-center">
//                         <p className="text-xs text-gray-400 mb-1">Preparation time</p>
//                         <p
//                           className={`text-3xl font-bold tabular-nums ${
//                             prepTimeLeft <= 10 ? "text-red-500" : "text-blue-600"
//                           }`}
//                         >
//                           {prepTimeLeft}s
//                         </p>
//                       </div>
//                     </div>
//                   ) : (
//                     <>
//                       <div className="relative flex items-center justify-center">
//                         {isMicActive && (
//                           <span
//                             className="absolute rounded-full bg-blue-400/30 transition-all"
//                             style={{
//                               width: `${100 + volumeLevel}px`,
//                               height: `${100 + volumeLevel}px`,
//                             }}
//                           />
//                         )}
//                         <button
//                           onClick={() =>
//                             !isMicActive && status === "user_speaking" && startRecording()
//                           }
//                           className={`relative w-20 h-20 rounded-2xl flex items-center justify-center transition-colors ${
//                             isMicActive
//                               ? "bg-red-500"
//                               : status === "user_speaking"
//                               ? "bg-blue-500"
//                               : "bg-gray-300"
//                           }`}
//                         >
//                           <Mic className="w-8 h-8 text-white" />
//                         </button>
//                       </div>
//                       {isMicActive && <LiveMicWave level={volumeLevel} />}
//                       <p className="text-sm text-gray-500">
//                         {isMicActive
//                           ? "Listening..."
//                           : status === "examiner_speaking"
//                           ? "Examiner is speaking"
//                           : status === "evaluating"
//                           ? "Evaluating..."
//                           : "Tap to speak"}
//                       </p>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Bottom bar */}
//             <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center justify-between">
//               <span className="text-sm text-gray-500">
//                 {PART_LABEL[currentPart].split(" — ")[0]} — Question {questionNumber}
//               </span>
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={skipQuestion}
//                   disabled={status !== "user_speaking"}
//                   className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   <SkipForward className="w-4 h-4" /> Skip
//                 </button>
//                 <button
//                   onClick={endTestNow}
//                   disabled={status === "evaluating" || status === "done"}
//                   className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
//                 >
//                   <LogOut className="w-4 h-4" /> End Test
//                 </button>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }









































"use client";

// app/speaking/test/page.tsx — IELTS Speaking Test (AI Examiner)

import { useEffect, useRef, useState, useCallback, useMemo, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import {
  Mic,
  Moon,
  Radio,
  Bot,
  User,
  Wifi,
  WifiOff,
  ShieldCheck,
  SkipForward,
  LogOut,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────

type MessageRole = "examiner" | "user" | "system" | "divider";
type TestPart = "part1" | "part2" | "part3" | "completed";

interface Part2Topic {
  title: string;
  bullet_points: string[];
}

interface ChatMessage {
  role: MessageRole;
  text: string;
  part?: TestPart;
  /** When present, this examiner message renders as a structured Part 2 cue card. */
  cueCard?: Part2Topic;
}

type TestStatus =
  | "idle"
  | "connecting"
  | "running"
  | "examiner_speaking"
  | "user_speaking"
  | "part2_prep"
  | "evaluating"
  | "done";

/** A user-facing message shown for errors, warnings and connection issues. */
interface Banner {
  kind: "error" | "warning" | "info";
  title: string;
  message: string;
  action?: { label: string; run: () => void };
}

const PART_LABEL: Record<TestPart, string> = {
  part1: "Part 1 — Interview",
  part2: "Part 2 — Long Turn",
  part3: "Part 3 — Discussion",
  completed: "Test Complete",
};

// How long the mic can stay open with ZERO detected speech before we
// treat it as "no answer" and auto-advance — distinct from the shorter
// post-speech silence window that submits a completed answer.
const NO_SPEECH_TIMEOUT_MS = 6000;
const POST_SPEECH_SILENCE_MS = 2000;
const SILENCE_VOLUME_THRESHOLD = 12;
// Hard safety caps: even if silence detection fails for any reason, the mic
// is force-closed after this long so a turn can never hang open forever.
const MAX_ANSWER_MS = 45000;
const MAX_ANSWER_PART2_MS = 120000;
// If Part 2 prep ends and the backend never sends a "begin" prompt, open the
// mic ourselves so the candidate is never stuck unable to answer.
const PART2_BEGIN_FALLBACK_MS = 4000;

// Watchdogs that catch a silently-dropped connection (dead-but-open socket,
// backend hang, or internet loss that never fires onclose/offline). If the
// server doesn't respond within these windows while we're waiting on it, we
// surface a clear error instead of letting the screen hang.
const OPENING_TIMEOUT_MS = 15000;   // after connect, expect the first question
const RESPONSE_TIMEOUT_MS = 30000;  // after an answer/command, expect a reply
const EVAL_TIMEOUT_MS = 90000;      // after End Test, evaluation can take longer

// Professional spoken transitions, prepended when a new part begins so the
// examiner clearly announces the move (only added if the backend text hasn't
// already announced it).
const PART_INTRO: Partial<Record<TestPart, string>> = {
  part2:
    "Thank you. That's the end of Part 1. Now let's move on to Part 2.",
  part3:
    "Thank you. That brings us to the end of Part 2. Now let's move on to Part 3, the discussion, where I'll ask you some broader questions related to the topic we've just talked about.",
};

function formatElapsed(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/**
 * Actively check whether the machine can actually reach the internet.
 *
 * We can't rely on `navigator.onLine` (stays true when the LAN is up but has no
 * internet) or on the localhost WebSocket (loopback stays open regardless), so
 * we fire a tiny no-cors request at a couple of well-known, rarely-blocked
 * connectivity endpoints. Success on either = online; both failing = offline.
 */
async function isInternetReachable(timeoutMs = 2500): Promise<boolean> {
  const endpoints = [
    "https://www.gstatic.com/generate_204",
    "https://connectivitycheck.gstatic.com/generate_204",
    "https://www.cloudflare.com/cdn-cgi/trace",
  ];
  for (const url of endpoints) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), timeoutMs);
      await fetch(url, { mode: "no-cors", cache: "no-store", signal: ctrl.signal });
      clearTimeout(t);
      return true; // the request completed → the network is reachable
    } catch {
      // try the next endpoint
    }
  }
  return false;
}

/**
 * Live equalizer that matches the reference design: a horizontal strip of
 * thin bars, tall on the left and tapering to short/faded on the right,
 * each animating independently so it reads like real-time speech.
 */
function SoundWave() {
  const bars = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => {
        // Deterministic pseudo-random config (stable across re-renders).
        const min = 18 + ((i * 41) % 26); // 18–44%
        const max = 55 + ((i * 67) % 45); // 55–100%
        const duration = 520 + ((i * 137) % 520); // 520–1040ms
        const delay = (i * 90) % 1300; // staggered start
        // Gentle opacity taper toward the right, like the reference image.
        const opacity = i < 20 ? 1 : Math.max(0.28, 1 - (i - 19) * 0.07);
        return { min, max, duration, delay, opacity };
      }),
    []
  );

  return (
    <div className="flex items-center gap-[2px] h-5" aria-hidden="true">
      {bars.map((b, i) => (
        <span
          key={i}
          className="w-[2px] rounded-full bg-blue-500"
          style={
            {
              height: `${b.max}%`,
              opacity: b.opacity,
              animation: `iel-sw ${b.duration}ms ease-in-out ${b.delay}ms infinite alternate`,
              // Consumed by the keyframes below.
              "--sw-min": `${b.min}%`,
              "--sw-max": `${b.max}%`,
            } as CSSProperties
          }
        />
      ))}
      <style>{`
        @keyframes iel-sw {
          0%   { height: var(--sw-min); }
          100% { height: var(--sw-max); }
        }
      `}</style>
    </div>
  );
}

/** Small reactive waveform for the candidate mic — heights follow real volume. */
function LiveMicWave({ level }: { level: number }) {
  const factors = [0.55, 0.85, 1, 0.8, 0.5];
  return (
    <div className="flex items-end justify-center gap-1 h-8">
      {factors.map((f, i) => {
        const h = Math.max(12, Math.min(100, level * f * 1.4));
        return (
          <span
            key={i}
            className="w-1 rounded-full bg-red-400 transition-[height] duration-100 ease-out"
            style={{ height: `${h}%` }}
          />
        );
      })}
    </div>
  );
}

export default function SpeakingTestPage() {
  const router = useRouter();
  const sessionId = useRef(`session_${Date.now()}`);

  const ws = useRef<WebSocket | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioStream = useRef<MediaStream | null>(null);
  const audioChunks = useRef<BlobPart[]>([]);
  const silenceTimer = useRef<NodeJS.Timeout | null>(null);
  const noSpeechTimer = useRef<NodeJS.Timeout | null>(null);
  const maxAnswerTimer = useRef<NodeJS.Timeout | null>(null);
  const part2BeginTimer = useRef<NodeJS.Timeout | null>(null);
  const serverWatchdog = useRef<NodeJS.Timeout | null>(null);
  // Once a connection error is shown, this blocks the mic from reopening
  // (e.g. from a queued TTS onend or timer callback) until the user retries.
  const abortedRef = useRef(false);
  const hasSpokenRef = useRef(false);
  const noiseSamplesRef = useRef<number[]>([]);

  // Audio graph — created ONCE per session and reused. Recreating an
  // AudioContext on every turn eventually hits the browser's context limit,
  // which kills the analyser and leaves the mic hanging open. Reuse fixes that.
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const freqDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Mirror status/part in refs to avoid stale-closure reads inside async
  // callbacks (TTS onend, WS onmessage, RAF loop).
  const statusRef = useRef<TestStatus>("idle");
  const currentPartRef = useRef<TestPart>("part1");
  const prevPartRef = useRef<TestPart | null>(null);

  const [status, setStatus] = useState<TestStatus>("idle");
  const [currentPart, setCurrentPart] = useState<TestPart>("part1");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [part2Topic, setPart2Topic] = useState<Part2Topic | null>(null);
  const [prepTimeLeft, setPrepTimeLeft] = useState(60);
  const [isMicActive, setIsMicActive] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [noiseLevel, setNoiseLevel] = useState<"LOW" | "HIGH">("LOW");
  // ── Error handling ──
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const connectTimeout = useRef<NodeJS.Timeout | null>(null);
  const wasConnected = useRef(false);
  const retryRef = useRef<() => void>(() => {});
  const chatEndRef = useRef<HTMLDivElement>(null);
  const prepTimer = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimer = useRef<NodeJS.Timeout | null>(null);
  // TTS hardening: cached voices + a keep-alive so Chrome doesn't pause long
  // utterances, and a watchdog so a silently-queued utterance gets re-kicked.
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const ttsKeepAlive = useRef<NodeJS.Timeout | null>(null);
  const ttsWatchdog = useRef<NodeJS.Timeout | null>(null);

  const setStatusBoth = useCallback((s: TestStatus) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  const applyPart = useCallback((p: TestPart) => {
    currentPartRef.current = p;
    setCurrentPart(p);
  }, []);

  /** Push a centered part-transition marker so each new part is unmistakable. */
  const pushDivider = useCallback((p: TestPart) => {
    if (prevPartRef.current === p) return;
    prevPartRef.current = p;
    setMessages((prev) => [...prev, { role: "divider", text: PART_LABEL[p], part: p }]);
  }, []);

  /** Show a friendly connection error with a one-tap retry. */
  const handleConnectionLost = useCallback((title: string, message: string) => {
    // Block any queued callback (TTS onend, timers) from reopening the mic.
    abortedRef.current = true;
    try { window.speechSynthesis?.cancel?.(); } catch { /* noop */ }
    setBanner({
      kind: "error",
      title,
      message,
      action: { label: "Try again", run: () => retryRef.current() },
    });
  }, []);

  /** Safely send a JSON command; surfaces a friendly error if the socket is down. */
  const sendCommand = useCallback(
    (payload: Record<string, unknown>): boolean => {
      const sock = ws.current;
      if (sock && sock.readyState === WebSocket.OPEN) {
        try {
          sock.send(JSON.stringify(payload));
          return true;
        } catch (e) {
          console.error("WS send failed", e);
        }
      }
      handleConnectionLost(
        "Connection problem",
        "We couldn't reach the examiner server. Check your internet connection and try again."
      );
      return false;
    },
    [handleConnectionLost]
  );

  // Close the error modal on Escape.
  useEffect(() => {
    if (!banner) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBanner(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [banner]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Elapsed timer ────────────────────────────────────────────────

  useEffect(() => {
    if (status === "idle" || status === "connecting" || status === "done") return;
    elapsedTimer.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => {
      if (elapsedTimer.current) clearInterval(elapsedTimer.current);
    };
  }, [status]);

  // ─── TTS (Examiner speaks) ────────────────────────────────────────

  // Voices are populated asynchronously — pre-load and keep them fresh so the
  // first (and every) utterance has its voice ready and doesn't stall.
  useEffect(() => {
    const load = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length) voicesRef.current = v;
    };
    load();
    window.speechSynthesis.addEventListener?.("voiceschanged", load);
    return () =>
      window.speechSynthesis.removeEventListener?.("voiceschanged", load);
  }, []);

  const clearTtsTimers = useCallback(() => {
    if (ttsKeepAlive.current) { clearInterval(ttsKeepAlive.current); ttsKeepAlive.current = null; }
    if (ttsWatchdog.current) { clearTimeout(ttsWatchdog.current); ttsWatchdog.current = null; }
  }, []);

  const speakAsExaminer = useCallback(
    (text: string, onDone?: () => void) => {
      // If the browser has no speech synthesis (or it throws), don't stall the
      // test — show the examiner text and move straight to the mic.
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        setStatusBoth("examiner_speaking");
        setTimeout(() => onDone?.(), 300);
        return;
      }

      let synth: SpeechSynthesis;
      try {
        synth = window.speechSynthesis;
        synth.cancel();
      } catch {
        setStatusBoth("examiner_speaking");
        setTimeout(() => onDone?.(), 300);
        return;
      }
      clearTtsTimers();

      const voices =
        voicesRef.current.length > 0 ? voicesRef.current : synth.getVoices();
      const preferred =
        voices.find((v) => v.lang === "en-GB" && /female/i.test(v.name)) ||
        voices.find((v) => v.lang === "en-GB") ||
        voices.find((v) => v.lang.startsWith("en"));

      const build = () => {
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.9;
        u.pitch = 1.0;
        u.volume = 1.0;
        if (preferred) u.voice = preferred;
        return u;
      };

      let finished = false;
      let started = false;

      const finish = () => {
        if (finished) return;
        finished = true;
        clearTtsTimers();
        onDone?.();
      };

      const utterance = build();
      utterance.onstart = () => { started = true; };
      utterance.onend = finish;
      utterance.onerror = finish;

      setStatusBoth("examiner_speaking");

      // Chrome silently pauses speech after ~15s — resume() keeps it going.
      ttsKeepAlive.current = setInterval(() => {
        if (synth.speaking && !synth.paused) synth.resume();
      }, 8000);

      try {
        synth.speak(utterance);
      } catch {
        finish();
        return;
      }

      // Watchdog: if speech neither started nor is queued shortly after speak(),
      // re-issue it once. Fixes the occasional "queued but never spoke" bug.
      ttsWatchdog.current = setTimeout(() => {
        if (!started && !finished && !synth.speaking) {
          try {
            const retry = build();
            retry.onstart = () => { started = true; };
            retry.onend = finish;
            retry.onerror = finish;
            synth.cancel();
            synth.speak(retry);
          } catch {
            finish();
          }
        }
      }, 450);
    },
    [setStatusBoth, clearTtsTimers]
  );

  // ─── Audio graph (created once, reused every turn) ────────────────

  const setupAudioGraph = useCallback((): AnalyserNode | null => {
    if (!audioStream.current) return null;
    try {
      if (!audioCtxRef.current) {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        audioCtxRef.current = new Ctx();
      }
      const ctx = audioCtxRef.current;
      // Autoplay policy can leave the context suspended — resume defensively.
      if (ctx.state === "suspended") ctx.resume().catch(() => {});

      if (!analyserRef.current) {
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.6;
        analyserRef.current = analyser;
        freqDataRef.current = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
      }
      if (!sourceRef.current) {
        sourceRef.current = ctx.createMediaStreamSource(audioStream.current);
        sourceRef.current.connect(analyserRef.current);
      }
      return analyserRef.current;
    } catch (e) {
      console.error("Audio graph setup failed", e);
      return null;
    }
  }, []);

  // ─── Recording + silence/no-speech detection ─────────────────────

  const clearRecordingTimers = useCallback(() => {
    if (silenceTimer.current) { clearTimeout(silenceTimer.current); silenceTimer.current = null; }
    if (noSpeechTimer.current) { clearTimeout(noSpeechTimer.current); noSpeechTimer.current = null; }
    if (maxAnswerTimer.current) { clearTimeout(maxAnswerTimer.current); maxAnswerTimer.current = null; }
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
  }, []);

  const stopRecording = useCallback(() => {
    clearRecordingTimers();
    setIsMicActive(false);
    setVolumeLevel(0);
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
    }
  }, [clearRecordingTimers]);

  const clearServerWatchdog = useCallback(() => {
    if (serverWatchdog.current) {
      clearTimeout(serverWatchdog.current);
      serverWatchdog.current = null;
    }
  }, []);

  /**
   * Arm a watchdog for when we're waiting on the server. If no message arrives
   * in `ms`, we treat the connection as lost and show a clear error instead of
   * letting the screen hang (covers dead-but-open sockets / silent drops).
   */
  const armServerWatchdog = useCallback(
    (ms: number) => {
      clearServerWatchdog();
      serverWatchdog.current = setTimeout(() => {
        serverWatchdog.current = null;
        stopRecording();
        setStatusBoth("idle");
        try { ws.current?.close(); } catch { /* noop */ }
        handleConnectionLost(
          "Connection lost",
          navigator.onLine
            ? "The examiner stopped responding — the connection dropped or the server restarted. Please try again."
            : "Your internet connection dropped. Reconnect to the internet, then tap Try again."
        );
      }, ms);
    },
    [clearServerWatchdog, stopRecording, setStatusBoth, handleConnectionLost]
  );

  // Detect the browser going offline/online so we can tell the user immediately.
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const goOnline = () => {
      setIsOnline(true);
      // Clear only the soft "offline" warning; leave hard errors for the user.
      setBanner((b) => (b?.kind === "warning" ? null : b));
    };
    const goOffline = () => {
      setIsOnline(false);
      const st = statusRef.current;
      const active =
        st !== "idle" && st !== "connecting" && st !== "done";
      if (active) {
        // Mid-test: stop everything and show a clear, actionable error now —
        // don't wait for the (possibly slow) socket close to be detected.
        clearServerWatchdog();
        stopRecording();
        try { ws.current?.close(); } catch { /* noop */ }
        setStatusBoth("idle");
        handleConnectionLost(
          "You went offline",
          "Your internet connection dropped during the test. Reconnect to the internet, then tap Try again to start over."
        );
      } else {
        setBanner({
          kind: "warning",
          title: "You're offline",
          message:
            "You don't have an internet connection right now. Reconnect before starting the test.",
        });
      }
    };
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [clearServerWatchdog, stopRecording, setStatusBoth, handleConnectionLost]);

  // Active connection health check. On localhost the frontend↔backend socket
  // is a loopback (stays OPEN with no internet) and `navigator.onLine` stays
  // true when the LAN is up but has no internet — so neither is reliable here.
  // We therefore actively probe a public endpoint to detect real internet loss
  // within seconds, and also treat a genuinely closed socket as a drop.
  useEffect(() => {
    const active =
      status === "running" ||
      status === "examiner_speaking" ||
      status === "user_speaking" ||
      status === "part2_prep" ||
      status === "evaluating";
    if (!active) return;

    let cancelled = false;
    let fails = 0;
    let timer: NodeJS.Timeout;

    const fail = (title: string, message: string) => {
      clearServerWatchdog();
      stopRecording();
      try { ws.current?.close(); } catch { /* noop */ }
      setStatusBoth("idle");
      handleConnectionLost(title, message);
    };

    const tick = async () => {
      if (cancelled || abortedRef.current) return;

      // 1) A truly closed socket is an instant, definitive drop (skip during
      //    evaluation, where the server closes right after sending results).
      const sock = ws.current;
      const socketDead =
        !sock ||
        sock.readyState === WebSocket.CLOSING ||
        sock.readyState === WebSocket.CLOSED;
      if (socketDead && statusRef.current !== "evaluating") {
        fail(
          "Connection lost",
          "The connection to the examiner server was closed. Please try again."
        );
        return;
      }

      // 2) Probe real internet reachability (independent of localhost / onLine).
      const online = await isInternetReachable();
      if (cancelled || abortedRef.current) return;

      if (!online) {
        fails += 1;
        // Two consecutive failures (~a few seconds) → treat as offline. This
        // avoids aborting a valid test on a single transient network blip.
        if (fails >= 2) {
          fail(
            "You're offline",
            "Your internet connection dropped, so the examiner can't respond. Reconnect to the internet, then tap Try again to start over."
          );
          return;
        }
      } else {
        fails = 0;
      }

      // After a failure, re-check quickly to confirm; otherwise poll calmly.
      if (!cancelled) timer = setTimeout(tick, fails > 0 ? 1200 : 3000);
    };

    // First check runs quickly so an already-dead connection is caught fast.
    timer = setTimeout(tick, 900);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [status, clearServerWatchdog, stopRecording, setStatusBoth, handleConnectionLost]);

  /** No answer within the timeout, or Skip pressed — advance the session. */
  const skipNoAnswer = useCallback(() => {
    clearRecordingTimers();
    setIsMicActive(false);
    setVolumeLevel(0);
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      // Stop without sending audio — onstop below checks hasSpokenRef.
      mediaRecorder.current.stop();
    }
    setMessages((prev) => [
      ...prev,
      { role: "system", text: "No response detected — moving to the next question." },
    ]);
    if (sendCommand({ command: "skip_no_answer" })) armServerWatchdog(RESPONSE_TIMEOUT_MS);
  }, [clearRecordingTimers, sendCommand, armServerWatchdog]);

  const startRecording = useCallback(() => {
    if (!audioStream.current) return;
    if (abortedRef.current) return; // a connection error is showing — don't reopen the mic

    const st = statusRef.current;
    if (st === "part2_prep" || st === "evaluating" || st === "done") return;
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") return;

    const analyser = setupAudioGraph();
    const data = freqDataRef.current;
    if (!analyser || !data) return;

    // Clear any stray loop/timers from a previous turn before starting fresh.
    clearRecordingTimers();
    clearServerWatchdog(); // the user is now speaking — not waiting on the server
    if (part2BeginTimer.current) { clearTimeout(part2BeginTimer.current); part2BeginTimer.current = null; }

    setStatusBoth("user_speaking");
    setIsMicActive(true);
    audioChunks.current = [];
    hasSpokenRef.current = false;
    noiseSamplesRef.current = [];

    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(audioStream.current, { mimeType: "audio/webm" });
    } catch {
      try {
        recorder = new MediaRecorder(audioStream.current);
      } catch (e) {
        console.error("MediaRecorder unavailable", e);
        setIsMicActive(false);
        setBanner({
          kind: "error",
          title: "Recording not supported",
          message:
            "Your browser couldn't start audio recording. Please use the latest Chrome, Edge, or Firefox on a desktop, then try again.",
        });
        return;
      }
    }
    mediaRecorder.current = recorder;

    recorder.onerror = (e) => {
      console.error("Recorder error", e);
      stopRecording();
    };

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.current.push(e.data);
    };

    recorder.onstop = () => {
      // Only send audio if the candidate actually spoke — a pure no-speech
      // timeout is handled separately via skipNoAnswer().
      if (hasSpokenRef.current) {
        const blob = new Blob(audioChunks.current, { type: "audio/webm" });
        if (blob.size > 1000) {
          if (ws.current?.readyState === WebSocket.OPEN) {
            blob
              .arrayBuffer()
              .then((buf) => {
                try {
                  ws.current?.send(buf);
                  // Now waiting on the examiner's reply — arm the watchdog.
                  armServerWatchdog(RESPONSE_TIMEOUT_MS);
                } catch (e) {
                  console.error("Audio send failed", e);
                  handleConnectionLost(
                    "Couldn't send your answer",
                    "The connection dropped while sending your response. Please try again."
                  );
                }
              })
              .catch((e) => console.error("Reading recorded audio failed", e));
          } else {
            handleConnectionLost(
              "Couldn't send your answer",
              "The connection to the examiner server was lost. Please try again."
            );
          }
        }
      }
      audioChunks.current = [];
    };

    const detectSpeech = () => {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      setVolumeLevel(Math.min(100, avg * 3));

      if (avg < SILENCE_VOLUME_THRESHOLD) {
        // Ambient/background noise sample (only while not mid-speech).
        if (!hasSpokenRef.current) {
          noiseSamplesRef.current.push(avg);
          if (noiseSamplesRef.current.length > 15) noiseSamplesRef.current.shift();
          const noiseAvg =
            noiseSamplesRef.current.reduce((a, b) => a + b, 0) /
            noiseSamplesRef.current.length;
          setNoiseLevel(noiseAvg > 8 ? "HIGH" : "LOW");
        }

        if (hasSpokenRef.current && !silenceTimer.current) {
          silenceTimer.current = setTimeout(() => {
            silenceTimer.current = null;
            stopRecording();
          }, POST_SPEECH_SILENCE_MS);
        }
      } else {
        if (!hasSpokenRef.current) {
          // First real speech — cancel the no-speech timeout.
          hasSpokenRef.current = true;
          if (noSpeechTimer.current) { clearTimeout(noSpeechTimer.current); noSpeechTimer.current = null; }
        }
        if (silenceTimer.current) { clearTimeout(silenceTimer.current); silenceTimer.current = null; }
      }
      animFrameRef.current = requestAnimationFrame(detectSpeech);
    };

    // Never spoke at all → auto-advance instead of leaving the mic open.
    noSpeechTimer.current = setTimeout(() => {
      if (!hasSpokenRef.current) skipNoAnswer();
    }, NO_SPEECH_TIMEOUT_MS);

    // Absolute safety cap — the mic can never hang open past this.
    const maxMs =
      currentPartRef.current === "part2" ? MAX_ANSWER_PART2_MS : MAX_ANSWER_MS;
    maxAnswerTimer.current = setTimeout(() => {
      if (statusRef.current === "user_speaking") stopRecording();
    }, maxMs);

    recorder.start();
    detectSpeech();
  }, [setupAudioGraph, clearRecordingTimers, clearServerWatchdog, armServerWatchdog, setStatusBoth, stopRecording, skipNoAnswer, handleConnectionLost]);

  // ─── WebSocket message handler ────────────────────────────────────

  const handleWsMessage = useCallback(
    (data: Record<string, unknown>) => {
      const type = data.type as string;
      // Any message means the server is alive — stand the watchdog down.
      clearServerWatchdog();

      if (type === "opening") {
        const text = data.text as string;
        setQuestionNumber((data.question_number as number) ?? 1);
        applyPart("part1");
        pushDivider("part1");
        setMessages((prev) => [...prev, { role: "examiner", text, part: "part1" }]);
        speakAsExaminer(text, () => startRecording());
      } else if (type === "user_transcript") {
        setMessages((prev) => [...prev, { role: "user", text: data.text as string }]);
      } else if (type === "no_speech_detected") {
        // Backend received audio but found no words — re-arm the mic.
        startRecording();
      } else if (type === "part2_topic") {
        const topic: Part2Topic = {
          title: data.title as string,
          bullet_points: (data.bullet_points as string[]) ?? [],
        };
        setPart2Topic(topic);
        applyPart("part2");
        pushDivider("part2");
        // Clean, structured cue card in the chat (no run-on paragraph).
        setMessages((prev) => [
          ...prev,
          {
            role: "examiner",
            part: "part2",
            text: "Now we'll move on to Part 2. Here is your topic — you have one minute to prepare, and you may make notes.",
            cueCard: topic,
          },
        ]);
        setStatusBoth("part2_prep");

        setPrepTimeLeft(60);
        let t = 60;
        prepTimer.current = setInterval(() => {
          t--;
          setPrepTimeLeft(t);
          if (t <= 0) {
            if (prepTimer.current) { clearInterval(prepTimer.current); prepTimer.current = null; }
            if (sendCommand({ command: "part2_ready" })) armServerWatchdog(RESPONSE_TIMEOUT_MS);
            // Leave prep so the next examiner prompt can open the mic.
            setStatusBoth("running");
            // Fallback: if no "begin" prompt arrives, open the mic ourselves.
            part2BeginTimer.current = setTimeout(() => {
              if (statusRef.current === "running") startRecording();
            }, PART2_BEGIN_FALLBACK_MS);
          }
        }, 1000);
      } else if (type === "examiner_text") {
        const rawText = data.text as string;
        const part = (data.part as TestPart) ?? currentPartRef.current;
        const complete = data.test_complete as boolean;
        if (data.question_number) setQuestionNumber(data.question_number as number);

        // Detect a forward part transition BEFORE pushDivider updates the ref.
        const isNewPart = prevPartRef.current !== null && prevPartRef.current !== part;

        applyPart(part);
        pushDivider(part);

        // If we've just entered a new part and the backend didn't announce it,
        // prepend a professional transition so the examiner says it out loud.
        let text = rawText;
        const alreadyAnnounced = new RegExp(`part\\s*${part.replace("part", "")}`, "i").test(rawText);
        if (isNewPart && PART_INTRO[part] && !alreadyAnnounced) {
          text = `${PART_INTRO[part]} ${rawText}`.trim();
        }

        // Suppress the raw cue-card run-on if the backend also sends it as a
        // spoken instruction — we already render a clean cue card in chat.
        const isCueCardRunOn = /you should say/i.test(text);
        if (!isCueCardRunOn) {
          setMessages((prev) => [...prev, { role: "examiner", text, part }]);
        }

        if (complete) {
          // Speak the closing line through the hardened path (voice + watchdog),
          // then move into evaluation.
          speakAsExaminer(text, () => {});
          setStatusBoth("evaluating");
          armServerWatchdog(EVAL_TIMEOUT_MS);
        } else if (statusRef.current === "part2_prep") {
          // Spoken during the 60s prep window — speak only, don't record yet.
          speakAsExaminer(text, () => {});
        } else {
          if (part2BeginTimer.current) { clearTimeout(part2BeginTimer.current); part2BeginTimer.current = null; }
          speakAsExaminer(text, () => startRecording());
        }
      } else if (type === "evaluating") {
        setStatusBoth("evaluating");
        setMessages((prev) => [
          ...prev,
          { role: "system", text: "Evaluating your performance. Please wait..." },
        ]);
        // Still waiting for the final result — keep the watchdog running.
        armServerWatchdog(EVAL_TIMEOUT_MS);
      } else if (type === "evaluation") {
        setStatusBoth("done");
        // Store in sessionStorage instead of a giant URL (avoids URL-length
        // limits and keeps the result out of browser history/logs).
        let stored = true;
        try {
          sessionStorage.setItem("speaking_results", JSON.stringify(data.result));
        } catch {
          stored = false; // results page has a query fallback
        }
        try {
          if (stored) router.push("/speaking/results");
          else
            router.push(
              `/speaking/results?data=${encodeURIComponent(JSON.stringify(data.result))}`
            );
        } catch (e) {
          console.error("Navigation to results failed", e);
          setBanner({
            kind: "error",
            title: "Couldn't open your results",
            message:
              "Your test was scored, but we couldn't open the results page. Please go to /speaking/results manually.",
          });
        }
      } else if (type === "error") {
        setBanner({
          kind: "error",
          title: "Something went wrong",
          message:
            "The examiner ran into a problem on the server. You can retry right away — your microphone stays ready.",
          action: { label: "Try again", run: () => retryRef.current() },
        });
        setStatusBoth("idle");
      }
    },
    [applyPart, pushDivider, speakAsExaminer, startRecording, setStatusBoth, sendCommand, clearServerWatchdog, armServerWatchdog, router]
  );

  // ─── Start Test ────────────────────────────────────────────────────

  /** Verify the browser can actually run the test. Returns an error message or null. */
  const checkSupport = (): string | null => {
    if (typeof window === "undefined") return null;
    if (!("WebSocket" in window))
      return "Your browser doesn't support the live connection needed for this test.";
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia)
      return "Your browser can't access the microphone. Please use the latest Chrome, Edge, or Firefox on a desktop.";
    if (typeof MediaRecorder === "undefined")
      return "Your browser can't record audio. Please use the latest Chrome, Edge, or Firefox on a desktop.";
    if (typeof AudioContext === "undefined" &&
        typeof (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext === "undefined")
      return "Your browser can't process audio. Please use the latest Chrome, Edge, or Firefox on a desktop.";
    return null;
  };

  const startTest = async () => {
    setBanner(null);
    abortedRef.current = false;

    // 1) Browser capability check.
    const unsupported = checkSupport();
    if (unsupported) {
      setBanner({ kind: "error", title: "Browser not supported", message: unsupported });
      setStatusBoth("idle");
      return;
    }

    // 2) Internet check up-front.
    if (!navigator.onLine) {
      setBanner({
        kind: "error",
        title: "You're offline",
        message: "You need an internet connection to start the test. Reconnect, then try again.",
        action: { label: "Try again", run: () => retryRef.current() },
      });
      setStatusBoth("idle");
      return;
    }

    setStatusBoth("connecting");

    // 3) Microphone — reuse an existing live stream, else request one.
    const streamLive =
      audioStream.current &&
      audioStream.current.getTracks().some((t) => t.readyState === "live");
    if (!streamLive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 },
        });
        audioStream.current = stream;
      } catch (err) {
        const name = (err as DOMException)?.name;
        let message =
          "We couldn't access your microphone. Please check your device and try again.";
        if (name === "NotAllowedError" || name === "SecurityError" || name === "PermissionDeniedError")
          message =
            "Microphone access is blocked. Click the padlock (or camera icon) in your browser's address bar, allow the microphone, then try again.";
        else if (name === "NotFoundError" || name === "DevicesNotFoundError")
          message = "No microphone was found. Please connect a microphone and try again.";
        else if (name === "NotReadableError" || name === "TrackStartError" || name === "AbortError")
          message =
            "Your microphone is being used by another app. Close it (e.g. Zoom, Meet, Teams) and try again.";
        setBanner({
          kind: "error",
          title: "Microphone unavailable",
          message,
          action: { label: "Try again", run: () => retryRef.current() },
        });
        setStatusBoth("idle");
        return;
      }
    }
    // Warm up the (single) audio graph now, on a real user gesture.
    setupAudioGraph();

    // 4) Open the WebSocket with a connection timeout + robust handlers.
    wasConnected.current = false;
    const backendHost =
      process.env.NEXT_PUBLIC_BACKEND_WS_URL || "ws://localhost:8000";

    let socket: WebSocket;
    try {
      socket = new WebSocket(`${backendHost}/ws/speaking/${sessionId.current}`);
    } catch (e) {
      console.error("WebSocket init failed", e);
      handleConnectionLost(
        "Couldn't connect",
        "We couldn't reach the examiner server. Make sure the backend is running and try again."
      );
      setStatusBoth("idle");
      return;
    }
    ws.current = socket;

    if (connectTimeout.current) clearTimeout(connectTimeout.current);
    connectTimeout.current = setTimeout(() => {
      if (socket.readyState !== WebSocket.OPEN) {
        try { socket.close(); } catch { /* noop */ }
        handleConnectionLost(
          "Server not responding",
          "The examiner server didn't respond. Make sure the backend is running (port 8000) and you're online, then try again."
        );
        setStatusBoth("idle");
      }
    }, 12000);

    socket.onopen = () => {
      wasConnected.current = true;
      if (connectTimeout.current) { clearTimeout(connectTimeout.current); connectTimeout.current = null; }
      setBanner(null);
      setStatusBoth("running");
      // Expect the first question shortly; if it never comes, surface an error.
      armServerWatchdog(OPENING_TIMEOUT_MS);
    };

    socket.onmessage = (event) => {
      try {
        handleWsMessage(JSON.parse(event.data));
      } catch (e) {
        console.error("WS parse error", event.data, e);
      }
    };

    socket.onerror = () => {
      // onclose fires right after and handles the user-facing message.
      console.error("WebSocket error");
    };

    socket.onclose = () => {
      if (connectTimeout.current) { clearTimeout(connectTimeout.current); connectTimeout.current = null; }
      const st = statusRef.current;
      // Expected closes: after the test finishes or during evaluation.
      if (st === "done" || st === "evaluating") return;
      // Unexpected drop mid-test.
      stopRecording();
      window.speechSynthesis?.cancel?.();
      setStatusBoth("idle");
      if (!wasConnected.current) {
        handleConnectionLost(
          "Couldn't connect",
          navigator.onLine
            ? "We couldn't reach the examiner server. Make sure the backend is running (port 8000), then try again."
            : "You appear to be offline. Reconnect to the internet, then try again."
        );
      } else {
        handleConnectionLost(
          "Connection lost",
          navigator.onLine
            ? "The connection to the examiner dropped (the server may have restarted). Your progress can't be resumed — please start again."
            : "Your internet connection dropped. Reconnect, then start the test again."
        );
      }
    };
  };

  /** Reset to a clean slate and start over (used by every "Try again" action). */
  const retryTest = () => {
    setBanner(null);
    abortedRef.current = false;
    clearServerWatchdog();
    stopRecording();
    try { ws.current?.close(); } catch { /* noop */ }
    if (connectTimeout.current) { clearTimeout(connectTimeout.current); connectTimeout.current = null; }
    // Fresh session so the backend starts cleanly.
    sessionId.current = `session_${Date.now()}`;
    setMessages([]);
    prevPartRef.current = null;
    currentPartRef.current = "part1";
    setCurrentPart("part1");
    setQuestionNumber(1);
    setPart2Topic(null);
    setElapsedSeconds(0);
    startTest();
  };
  // Keep the retry ref pointing at the latest closure for banner actions.
  retryRef.current = retryTest;

  const endTestNow = () => {
    stopRecording();
    // Only move to "evaluating" if we actually reached the server.
    if (!sendCommand({ command: "end_test" })) {
      setStatusBoth("idle");
      return;
    }
    setStatusBoth("evaluating");
    setMessages((prev) => [
      ...prev,
      { role: "system", text: "Ending test — evaluating your performance..." },
    ]);
    // Evaluation can take a while, but not forever — catch a dead connection.
    armServerWatchdog(EVAL_TIMEOUT_MS);
  };

  const skipQuestion = () => {
    if (statusRef.current === "user_speaking") skipNoAnswer();
  };

  // ─── Cleanup ───────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      ws.current?.close();
      audioStream.current?.getTracks().forEach((t) => t.stop());
      try {
        sourceRef.current?.disconnect();
      } catch {
        /* noop */
      }
      audioCtxRef.current?.close().catch(() => {});
      window.speechSynthesis.cancel();
      if (prepTimer.current) clearInterval(prepTimer.current);
      if (elapsedTimer.current) clearInterval(elapsedTimer.current);
      if (part2BeginTimer.current) clearTimeout(part2BeginTimer.current);
      if (connectTimeout.current) clearTimeout(connectTimeout.current);
      if (serverWatchdog.current) clearTimeout(serverWatchdog.current);
      clearTtsTimers();
      clearRecordingTimers();
    };
  }, [clearRecordingTimers, clearTtsTimers]);

  // ─── Render ────────────────────────────────────────────────────────

  const examinerStatusLabel =
    status === "examiner_speaking"
      ? { text: "SPEAKING", color: "text-blue-600 bg-blue-50" }
      : status === "evaluating"
      ? { text: "THINKING", color: "text-amber-600 bg-amber-50" }
      : { text: "LISTENING", color: "text-emerald-600 bg-emerald-50" };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col px-4 py-4 gap-3 min-h-0">

        {/* ── Header — 3 cards ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 leading-tight">IELTS Speaking</p>
              <p className="text-xs text-gray-500 leading-tight">
                {PART_LABEL[currentPart].split(" — ")[1] ?? PART_LABEL[currentPart]}
              </p>
            </div>
            <button
              className="ml-2 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 shrink-0"
              aria-label="Toggle theme"
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-1.5 flex items-center gap-1.5">
            {(["part1", "part2", "part3"] as const).map((p) => (
              <div
                key={p}
                className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium text-center transition-all flex items-center justify-center gap-2 ${
                  currentPart === p ? "bg-blue-600 text-white shadow-sm" : "text-gray-400"
                }`}
              >
                {p === "part1" ? "Part 1" : p === "part2" ? "Part 2" : "Part 3"}
                {currentPart === p && <span className="w-1.5 h-1.5 rounded-full bg-white/80" />}
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl px-5 py-2.5 flex items-center justify-between gap-4 min-w-[180px]">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-lg font-bold text-gray-900 leading-tight tabular-nums">
                  {formatElapsed(elapsedSeconds)}
                </p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-tight">
                  Elapsed
                </p>
              </div>
            </div>
            {status !== "idle" && status !== "connecting" && (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                AI LIVE
              </span>
            )}
          </div>
        </div>

        {/* ── Idle / Connecting screen ── */}
        {(status === "idle" || status === "connecting") && (
          <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden py-3">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30">
                <User className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900 mb-1.5">IELTS SPEAKING TEST</h1>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                You&apos;ll have a conversation with an AI examiner across three parts.
                The test simulates a real IELTS speaking examination.
              </p>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-gray-50 rounded-xl px-2 py-2">
                  <p className="text-xs font-semibold text-blue-600 mb-0.5">Part 1</p>
                  <p className="text-xs text-gray-600">Interview</p>
                  <p className="text-[11px] text-gray-400 mt-1">4-5 min</p>
                </div>
                <div className="bg-gray-50 rounded-xl px-2 py-2">
                  <p className="text-xs font-semibold text-blue-600 mb-0.5">Part 2</p>
                  <p className="text-xs text-gray-600">Long Turn</p>
                  <p className="text-[11px] text-gray-400 mt-1">3-4 min</p>
                </div>
                <div className="bg-gray-50 rounded-xl px-2 py-2">
                  <p className="text-xs font-semibold text-blue-600 mb-0.5">Part 3</p>
                  <p className="text-xs text-gray-600">Discussion</p>
                  <p className="text-[11px] text-gray-400 mt-1">4-5 min</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-blue-50/60 rounded-xl px-4 py-3 mb-4 text-left">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5 text-blue-500 text-xs font-bold">
                  +
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Your microphone opens automatically after the examiner speaks. Answer naturally —
                  the test moves to the next question shortly after you stop talking.
                </p>
              </div>

              {status === "idle" ? (
                <button
                  onClick={startTest}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
                >
                  Begin Speaking Test
                </button>
              ) : (
                <div className="w-full bg-gray-100 text-gray-500 font-medium py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Running screen ── */}
        {status !== "idle" && status !== "connecting" && (
          <>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 min-h-0">

              {/* Examiner panel */}
              <div className="relative bg-white border border-gray-200 rounded-2xl flex flex-col min-h-[420px] max-h-[560px]">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center">
                      <Bot className="w-4.5 h-4.5 text-white" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">AI Examiner</p>
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${examinerStatusLabel.color}`}
                    >
                      {examinerStatusLabel.text}
                    </span>
                  </div>
                  {/* Live waveform — right side, exactly like the reference. */}
                  {status === "examiner_speaking" && (
                    <div className="shrink-0 pl-2">
                      <SoundWave />
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg, i) => {
                    if (msg.role === "divider") {
                      return (
                        <div key={i} className="flex items-center gap-3 py-1">
                          <div className="flex-1 h-px bg-gray-200" />
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 whitespace-nowrap">
                            {msg.text}
                          </span>
                          <div className="flex-1 h-px bg-gray-200" />
                        </div>
                      );
                    }
                    return (
                      <div
                        key={i}
                        className={
                          msg.role === "system"
                            ? "text-center"
                            : msg.role === "user"
                            ? "flex justify-end"
                            : "flex justify-start"
                        }
                      >
                        <div className="max-w-[85%]">
                          {msg.role !== "system" && (
                            <p
                              className={`text-[10px] font-medium mb-1 ${
                                msg.role === "user"
                                  ? "text-right text-emerald-500"
                                  : "text-blue-400"
                              }`}
                            >
                              {msg.role === "user" ? "You" : "Examiner"}
                            </p>
                          )}
                          <div
                            className={`inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                              msg.role === "examiner"
                                ? "bg-blue-50 text-blue-900 rounded-tl-sm"
                                : msg.role === "user"
                                ? "bg-emerald-50 text-emerald-900 rounded-tr-sm"
                                : "bg-amber-50 text-amber-800 text-xs px-3 py-1.5"
                            }`}
                          >
                            {msg.text}

                            {/* Structured Part 2 cue card */}
                            {msg.cueCard && (
                              <div className="mt-3 rounded-xl bg-white/70 border border-blue-100 p-3">
                                <p className="text-[13px] font-semibold text-blue-900 mb-2">
                                  {msg.cueCard.title}
                                </p>
                                <p className="text-[11px] font-medium uppercase tracking-wide text-blue-400 mb-1.5">
                                  You should say
                                </p>
                                <ul className="space-y-1.5">
                                  {msg.cueCard.bullet_points.map((bp, bi) => (
                                    <li
                                      key={bi}
                                      className="flex items-start gap-2 text-[13px] text-blue-900/90"
                                    >
                                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                      <span>{bp}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
              </div>

              {/* Candidate panel */}
              <div className="bg-white border border-gray-200 rounded-2xl flex flex-col min-h-[420px] max-h-[560px]">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <User className="w-4.5 h-4.5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Test Candidate</p>
                    <p className="text-xs text-gray-400">Your responses</p>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                    <Wifi className="w-3 h-3" /> GOOD
                  </span>
                  <span
                    className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      noiseLevel === "LOW"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3" /> NOISE {noiseLevel}
                  </span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
                  {status === "part2_prep" && part2Topic ? (
                    <div className="w-full">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                        Cue Card
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mb-3">
                        {part2Topic.title}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">You should say:</p>
                      <ul className="space-y-1.5 mb-4">
                        {part2Topic.bullet_points.map((bp, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                            <span>{bp}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="text-center">
                        <p className="text-xs text-gray-400 mb-1">Preparation time</p>
                        <p
                          className={`text-3xl font-bold tabular-nums ${
                            prepTimeLeft <= 10 ? "text-red-500" : "text-blue-600"
                          }`}
                        >
                          {prepTimeLeft}s
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="relative flex items-center justify-center">
                        {isMicActive && (
                          <span
                            className="absolute rounded-full bg-blue-400/30 transition-all"
                            style={{
                              width: `${100 + volumeLevel}px`,
                              height: `${100 + volumeLevel}px`,
                            }}
                          />
                        )}
                        <button
                          onClick={() =>
                            !isMicActive && status === "user_speaking" && startRecording()
                          }
                          className={`relative w-20 h-20 rounded-2xl flex items-center justify-center transition-colors ${
                            isMicActive
                              ? "bg-red-500"
                              : status === "user_speaking"
                              ? "bg-blue-500"
                              : "bg-gray-300"
                          }`}
                        >
                          <Mic className="w-8 h-8 text-white" />
                        </button>
                      </div>
                      {isMicActive && <LiveMicWave level={volumeLevel} />}
                      <p className="text-sm text-gray-500">
                        {isMicActive
                          ? "Listening..."
                          : status === "examiner_speaking"
                          ? "Examiner is speaking"
                          : status === "evaluating"
                          ? "Evaluating..."
                          : "Tap to speak"}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {PART_LABEL[currentPart].split(" — ")[0]} — Question {questionNumber}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={skipQuestion}
                  disabled={status !== "user_speaking"}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <SkipForward className="w-4 h-4" /> Skip
                </button>
                <button
                  onClick={endTestNow}
                  disabled={status === "evaluating" || status === "done"}
                  className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> End Test
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Error / connection modal — overlays the current screen, blurs behind ── */}
      {banner && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="speaking-error-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 backdrop-blur-sm animate-[fadeIn_120ms_ease-out]"
          onClick={() => setBanner(null)}
        >
          <div
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl ring-1 ring-black/5 p-6 text-center animate-[popIn_150ms_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setBanner(null)}
              aria-label="Close"
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                banner.kind === "error"
                  ? "bg-red-50"
                  : banner.kind === "warning"
                  ? "bg-amber-50"
                  : "bg-blue-50"
              }`}
            >
              {banner.kind === "warning" && !isOnline ? (
                <WifiOff className="w-6 h-6 text-amber-500" />
              ) : (
                <AlertTriangle
                  className={`w-6 h-6 ${
                    banner.kind === "error"
                      ? "text-red-500"
                      : banner.kind === "warning"
                      ? "text-amber-500"
                      : "text-blue-500"
                  }`}
                />
              )}
            </div>

            <h2
              id="speaking-error-title"
              className="text-base font-bold text-gray-900 mb-1.5"
            >
              {banner.title}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">{banner.message}</p>

            <div className="flex flex-col gap-2">
              {banner.action && (
                <button
                  onClick={banner.action.run}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
                >
                  {banner.action.label}
                </button>
              )}
              <button
                onClick={() => setBanner(null)}
                className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-50 font-medium py-2.5 rounded-xl text-sm transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>

          <style>{`
            @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
            @keyframes popIn {
              from { opacity: 0; transform: translateY(8px) scale(0.98) }
              to   { opacity: 1; transform: translateY(0) scale(1) }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}