import { useState } from 'react';

export default function WorkspaceList({ workspaces, activeWorkspaceId, onOpen, onAdd, onRemove }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!input.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      await onAdd(input.trim());
      setInput('');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-neutral-800 bg-neutral-950 text-neutral-200">
      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">工作区</div>
      <div className="flex-1 overflow-y-auto">
        {workspaces.map((workspace) => (
          <div
            key={workspace.id}
            className={`group flex items-center gap-2 px-3 py-2 text-sm ${
              workspace.id === activeWorkspaceId ? 'bg-neutral-800' : 'hover:bg-neutral-900'
            }`}
          >
            <button className="min-w-0 flex-1 text-left" onClick={() => onOpen(workspace)} title={workspace.path}>
              <div className="truncate">{workspace.name}</div>
              <div className="truncate text-xs text-neutral-500">{workspace.path}</div>
            </button>
            <button
              className="hidden text-xs text-neutral-500 hover:text-red-400 group-hover:block"
              onClick={() => onRemove(workspace)}
              title="移除工作区"
            >
              ✕
            </button>
          </div>
        ))}
        {workspaces.length === 0 && (
          <div className="px-3 py-2 text-xs text-neutral-600">还没有工作区，添加一个本机目录开始。</div>
        )}
      </div>
      <div className="border-t border-neutral-800 p-3">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && submit()}
          placeholder="/path/to/project"
          className="w-full rounded bg-neutral-900 px-2 py-1.5 text-sm outline-none placeholder:text-neutral-600"
        />
        {error && <div className="mt-1 text-xs text-red-400">{error}</div>}
        <button
          onClick={submit}
          disabled={busy}
          className="mt-2 w-full rounded bg-neutral-800 py-1.5 text-sm hover:bg-neutral-700 disabled:opacity-50"
        >
          添加工作区
        </button>
      </div>
    </aside>
  );
}
