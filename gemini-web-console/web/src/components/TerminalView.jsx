import { useRef } from 'react';
import { useTerminal } from '../hooks/useTerminal.js';

const STATUS_TEXT = {
  connecting: '连接中…',
  reconnecting: '连接已断开，正在重连…',
  gone: '会话不存在（可能服务已重启）',
  exited: '进程已退出',
};

export default function TerminalView({ sessionId }) {
  const containerRef = useRef(null);
  const status = useTerminal(containerRef, sessionId);

  return (
    <div className="relative h-full w-full bg-[#0b0e14] p-2">
      {STATUS_TEXT[status] && (
        <div className="absolute right-3 top-3 z-10 rounded bg-amber-500/15 px-2 py-1 text-xs text-amber-300">
          {STATUS_TEXT[status]}
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
