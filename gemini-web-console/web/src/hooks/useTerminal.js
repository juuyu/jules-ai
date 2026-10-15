import { useEffect, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import { terminalWsUrl } from '../api.js';

const RETRY_BASE = 1000;
const RETRY_MAX = 10_000;

export function useTerminal(containerRef, sessionId) {
  const [status, setStatus] = useState('connecting');

  useEffect(() => {
    const terminal = new Terminal({
      fontSize: 13,
      cursorBlink: true,
      scrollback: 5000,
      theme: { background: '#0b0e14' },
    });
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.loadAddon(new WebLinksAddon());
    terminal.open(containerRef.current);
    fitAddon.fit();
    terminal.focus();

    let ws = null;
    let disposed = false;
    let exited = false;
    let retries = 0;
    let timer = null;

    const send = (message) => {
      if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message));
    };

    const connect = () => {
      if (disposed) return;
      setStatus(retries === 0 ? 'connecting' : 'reconnecting');
      ws = new WebSocket(terminalWsUrl(sessionId, terminal.cols, terminal.rows));

      ws.onopen = () => {
        retries = 0;
        setStatus('open');
        send({ type: 'resize', cols: terminal.cols, rows: terminal.rows });
      };

      ws.onmessage = (event) => {
        let message;
        try {
          message = JSON.parse(event.data);
        } catch {
          return;
        }
        if (message.type === 'output') terminal.write(message.data);
        else if (message.type === 'ping') send({ type: 'pong' });
        else if (message.type === 'exit') {
          exited = true;
          setStatus('exited');
          terminal.write(`\r\n\x1b[2m[进程已退出：code ${message.code}]\x1b[0m\r\n`);
        }
      };

      ws.onclose = (event) => {
        if (disposed || exited) return;
        if (event.code === 4404) {
          setStatus('gone');
          return;
        }
        retries += 1;
        timer = setTimeout(connect, Math.min(RETRY_BASE * 2 ** (retries - 1), RETRY_MAX));
      };
    };

    const onData = terminal.onData((data) => send({ type: 'input', data }));

    const observer = new ResizeObserver(() => {
      fitAddon.fit();
      send({ type: 'resize', cols: terminal.cols, rows: terminal.rows });
    });
    observer.observe(containerRef.current);

    connect();

    return () => {
      disposed = true;
      clearTimeout(timer);
      observer.disconnect();
      onData.dispose();
      ws?.close();
      terminal.dispose();
    };
  }, [containerRef, sessionId]);

  return status;
}
