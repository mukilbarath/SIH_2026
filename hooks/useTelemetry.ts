'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { appendHistory, isTelemetry, type Command, type Telemetry } from '@/lib/telemetry';

export const TELEMETRY_URL = process.env.NEXT_PUBLIC_TELEMETRY_URL || 'ws://127.0.0.1:3002';
export function useTelemetry() {
  const socket = useRef<WebSocket | null>(null);
  const pendingThrottle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [currentData, setCurrentData] = useState<Telemetry | null>(null);
  const [dataHistory, setDataHistory] = useState<Telemetry[]>([]);
  const [status, setStatus] = useState('Connecting…');
  const [error, setError] = useState('');
  useEffect(() => {
    let disposed = false;
    let retry: ReturnType<typeof setTimeout>;
    let attempts = 0;
    let lastReceived = 0;
    let history: Telemetry[] = [];
    let historyDirty = false;
    const connect = () => {
      if (disposed) return;
      let ws: WebSocket;
      try { ws = new WebSocket(TELEMETRY_URL); }
      catch { setStatus('Invalid telemetry URL'); return; }
      socket.current = ws;
      ws.onopen = () => { if (!disposed) { lastReceived = Date.now(); setStatus('Waiting for telemetry…'); } };
      ws.onmessage = event => {
        if (disposed) return;
        try {
          const message: unknown = JSON.parse(event.data);
          if (isTelemetry(message)) {
            lastReceived = Date.now(); attempts = 0;
            setStatus('Connected'); setError('');
            setCurrentData(message);
            history = appendHistory(history, message);
            historyDirty = true;
            if (history.length === 1) { setDataHistory(history); historyDirty = false; }
          } else if (message && typeof message === 'object' && 'type' in message && message.type === 'error') {
            setError('The server rejected that control. Check the active mode.');
          } else if (!message || typeof message !== 'object' || !('type' in message) || message.type !== 'ack') {
            setError('Ignored invalid telemetry message.');
          }
        } catch { setError('Ignored malformed telemetry message.'); }
      };
      ws.onerror = () => ws.close();
      ws.onclose = () => {
        if (disposed) return;
        setStatus('Disconnected — reconnecting…'); setCurrentData(null); setDataHistory([]);
        history = []; historyDirty = false;
        retry = setTimeout(connect, Math.min(1000 * 2 ** attempts++, 10000));
      };
    };
    connect();
    const chartTimer = setInterval(() => {
      if (historyDirty) { setDataHistory(history); historyDirty = false; }
    }, 250);
    const watchdog = setInterval(() => {
      if (socket.current?.readyState === WebSocket.OPEN && Date.now() - lastReceived > 3000) {
        setStatus('Stale telemetry — reconnecting…'); setCurrentData(null); socket.current.close();
      }
    }, 500);
    return () => {
      disposed = true; clearTimeout(retry); clearInterval(watchdog); clearInterval(chartTimer);
      if (pendingThrottle.current) clearTimeout(pendingThrottle.current);
      socket.current?.close(); socket.current = null;
    };
  }, []);
  const send = useCallback((command: Command) => {
    if (status !== 'Connected' || socket.current?.readyState !== WebSocket.OPEN) return;
    if (pendingThrottle.current) clearTimeout(pendingThrottle.current);
    if (command.type === 'set_throttle') {
      pendingThrottle.current = setTimeout(() => {
        if (socket.current?.readyState === WebSocket.OPEN) socket.current.send(JSON.stringify(command));
      }, 75);
    } else socket.current.send(JSON.stringify(command));
  }, [status]);
  return { currentData, dataHistory, status, error, send, connected: status === 'Connected' };
}
