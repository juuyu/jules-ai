import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api.js';
import TerminalView from './components/TerminalView.jsx';
import WorkspaceList from './components/WorkspaceList.jsx';

const TABS_KEY = 'gwc-tabs';

function loadStoredTabs() {
  try {
    const parsed = JSON.parse(localStorage.getItem(TABS_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [workspaces, setWorkspaces] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [banner, setBanner] = useState('');
  const restoredRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const workspaceList = await api.listWorkspaces();
        setWorkspaces(workspaceList);
        const sessions = await api.listTerminalSessions();
        const sessionIds = new Set(sessions.map((session) => session.sessionId));
        const restored = [];
        for (const tab of loadStoredTabs()) {
          const workspace = workspaceList.find((item) => item.id === tab.workspaceId);
          if (!workspace) continue;
          if (sessionIds.has(tab.sessionId)) {
            restored.push(tab);
            continue;
          }
          // 服务重启后 sessionId 失效，重新 attach 到同一 tmux session（历史仍保留）
          try {
            const { sessionId } = await api.createTerminalSession(tab.workspaceId);
            restored.push({ ...tab, sessionId });
          } catch {
            // 工作区目录已丢失等场景，跳过该 tab
          }
        }
        setTabs(restored);
        setActiveTabId(restored[0]?.sessionId ?? null);
      } catch (error) {
        setBanner(error.message);
      } finally {
        restoredRef.current = true;
      }
    })();
  }, []);

  useEffect(() => {
    // 恢复完成前不写 localStorage，避免挂载时的初始空数组覆盖已保存的 tab
    if (!restoredRef.current) return;
    localStorage.setItem(TABS_KEY, JSON.stringify(tabs));
  }, [tabs]);

  const createTab = useCallback(async (workspace) => {
    setBanner('');
    try {
      const { sessionId } = await api.createTerminalSession(workspace.id);
      setTabs((prev) => [...prev, { sessionId, workspaceId: workspace.id, title: workspace.name }]);
      setActiveTabId(sessionId);
    } catch (error) {
      setBanner(error.message);
    }
  }, []);

  const openWorkspace = useCallback(
    (workspace) => {
      const existing = tabs.find((tab) => tab.workspaceId === workspace.id);
      if (existing) {
        setActiveTabId(existing.sessionId);
        return;
      }
      createTab(workspace);
    },
    [tabs, createTab],
  );

  const newTab = useCallback(() => {
    const active = tabs.find((tab) => tab.sessionId === activeTabId);
    const workspace = workspaces.find((item) => item.id === active?.workspaceId) ?? workspaces[0];
    if (!workspace) {
      setBanner('请先在左侧添加工作区');
      return;
    }
    createTab(workspace);
  }, [tabs, activeTabId, workspaces, createTab]);

  const closeTab = useCallback(
    (tab) => {
      const next = tabs.filter((item) => item.sessionId !== tab.sessionId);
      setTabs(next);
      if (activeTabId === tab.sessionId) {
        setActiveTabId(next[0]?.sessionId ?? null);
      }
      api.killTerminalSession(tab.sessionId).catch(() => {});
    },
    [tabs, activeTabId],
  );

  const addWorkspace = useCallback(async (inputPath) => {
    const workspace = await api.addWorkspace(inputPath);
    setWorkspaces((prev) => (prev.some((item) => item.id === workspace.id) ? prev : [...prev, workspace]));
  }, []);

  const removeWorkspace = useCallback(async (workspace) => {
    try {
      await api.removeWorkspace(workspace.id);
      setWorkspaces((prev) => prev.filter((item) => item.id !== workspace.id));
    } catch (error) {
      setBanner(error.message);
    }
  }, []);

  const activeTab = tabs.find((tab) => tab.sessionId === activeTabId) ?? null;

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100">
      <WorkspaceList
        workspaces={workspaces}
        activeWorkspaceId={activeTab?.workspaceId}
        onOpen={openWorkspace}
        onAdd={addWorkspace}
        onRemove={removeWorkspace}
      />
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-1 border-b border-neutral-800 px-2 pt-1.5">
          {tabs.map((tab) => (
            <div
              key={tab.sessionId}
              className={`flex items-center gap-2 rounded-t px-3 py-1.5 text-sm ${
                tab.sessionId === activeTabId
                  ? 'bg-neutral-800 text-neutral-100'
                  : 'text-neutral-400 hover:bg-neutral-900'
              }`}
            >
              <button onClick={() => setActiveTabId(tab.sessionId)}>{tab.title}</button>
              <button
                className="text-xs text-neutral-500 hover:text-red-400"
                onClick={() => closeTab(tab)}
                title="关闭"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={newTab}
            className="rounded px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-900 hover:text-neutral-300"
            title="新建终端"
          >
            ＋
          </button>
        </div>
        {banner && (
          <div className="border-b border-red-900/40 bg-red-950/40 px-3 py-1.5 text-xs text-red-300">{banner}</div>
        )}
        <div className="min-h-0 flex-1">
          {activeTab ? (
            <TerminalView key={activeTab.sessionId} sessionId={activeTab.sessionId} />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-neutral-600">
              从左侧选择工作区打开终端
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
