import { useEffect, useRef, useState } from "react";
import { Viseme } from "../types/avatar";

interface StreamEventBase { type: string }
interface StartAnswerEvent extends StreamEventBase { utteranceId: string; emotion: string }
interface TokenEvent extends StreamEventBase { utteranceId: string; textFragment: string }
interface VisemeEvent extends StreamEventBase { utteranceId: string; viseme: Viseme; startMs: number; endMs: number }
interface DoneEvent extends StreamEventBase { utteranceId: string }

export function useWebSocketAnswer(wsUrl: string) {
  const [connected, setConnected] = useState(false);
  const [tokens, setTokens] = useState<string>("");
  const [emotion, setEmotion] = useState<string>("neutral");
  const [currentViseme, setCurrentViseme] = useState<Viseme>("REST");
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data.type === "start_answer") {
          const ev = data as StartAnswerEvent;
          setEmotion(ev.emotion);
          setTokens("");
        } else if (data.type === "token") {
            const ev = data as TokenEvent;
            setTokens(prev => prev + ev.textFragment);
        } else if (data.type === "viseme") {
            const ev = data as VisemeEvent;
            setCurrentViseme(ev.viseme);
            // revert to REST after endMs
            setTimeout(() => setCurrentViseme("REST"), (ev.endMs - ev.startMs) + 50);
        } else if (data.type === "done") {
            // done event can trigger final cleanup if needed
        }
      } catch { /* ignore parse errors */ }
    };
    return () => ws.close();
  }, [wsUrl]);

  const ask = (question: string) => {
    if (socketRef.current && connected) {
      socketRef.current.send(question);
    }
  };

  return { connected, ask, tokens, emotion, currentViseme };
}