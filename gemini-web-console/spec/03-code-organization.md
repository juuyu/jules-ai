# 03 代码组织规范

> v0.1（2026-10-15）｜[规范总览](./README.md)

## 模块化

- 统一 ES Modules（`import` / `export`），不用 `require`
- 每个模块只暴露必要接口，内部实现默认不导出
- 顶层不产生副作用（不在 import 时启动服务、改全局状态）；入口文件除外

## 后端分层职责

| 层 | 只做 | 不做 |
| --- | --- | --- |
| api/ 路由 | 参数校验、调用 lib、统一响应 | 拼命令、写业务分支 |
| lib/ | 纯逻辑、外部进程 / 文件封装 | 感知 HTTP 的 req / res |
| terminal.js | 会话生命周期（PTY / WS） | 业务面板逻辑 |

路由只做"校验 → 调用 → 返回"：

```js
// server/api/git.js
router.post('/api/git/commit', async (req, res) => {
  const { workspaceId, message } = req.body;
  if (!message?.trim()) return fail(res, 400, 'INVALID_PARAM', '提交信息不能为空');
  const cwd = workspaces.resolve(workspaceId); // 命中白名单，否则抛 WORKSPACE_NOT_FOUND
  const result = await git.commit(cwd, message); // 逻辑在 lib
  return ok(res, result);
});
```

## 前端组织

- 组件只做渲染与用户事件；数据请求一律走 `api.js` 封装
- xterm.js 生命周期（`open` / `fit` / `dispose`、尺寸监听、WS 重连）全部封装在 `useTerminal` hook，组件不直接操作 xterm
- 面板互相独立：共享数据用 props 提升到 App 层；**MVP 不引入 Redux / Zustand 等状态库**
- 样式用 Tailwind 原子类；重复 3 次以上的样式组合抽成组件，不抽全局 CSS 类
- 终端区保持"无干扰"：工具栏 / 按钮不得覆盖终端内容区

## 依赖管理

- 新增依赖前必须回答：Node 内置 / 现有依赖能否完成？答案写进提交说明
- lockfile 提交到版本库，锁定版本
- 已确定核心依赖：`node-pty`、`ws`、`fastify`（或 express）、`@xterm/xterm` 及 addon、`react`、`vite`、`tailwindcss`；其余先讨论再加入

## 状态与并发

- 会话管理器内存态 `Map<sessionId, { pty, workspaceId, tmuxName, createdAt }>` 是唯一事实源
- 文件写入（settings.json、workspaces.json）：读-改-写串行化，避免并发覆盖
- 幂等操作（attach、list）允许并发；破坏性操作（kill、commit、push）前端按钮置 loading 防重复触发

## 注释

- **默认不写注释**。仅在 WHY 非显然时写一行：隐藏约束、必要 workaround、与官方行为的偏差
- 禁止注释描述 WHAT（代码已表达）；禁止保留被注释掉的死代码
