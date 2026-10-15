# 技术方案

> 状态：初稿 v0.1（2026-10-15）｜关联：[需求文档](./01-requirements.md)

## 1. 总体架构

```text
┌─────────────────────── 浏览器 ───────────────────────┐
│  xterm.js 终端区（多 tab）  │  功能面板（Git/MCP/…）   │
└──────────┬─────────────────────────┬────────────────┘
      WebSocket（终端流）        REST（结构化功能）
┌──────────┴─────────────────────────┴────────────────┐
│                 Node.js 后端                         │
│  会话管理器（node-pty + tmux） │ 工作区/配置/Git 接口  │
└──────────────────┬───────────────────────────────────┘
              PTY（伪终端）
┌──────────────────┴───────────────────────────────────┐
│  tmux session（每个工作区一个） → gemini CLI          │
└───────────────────────────────────────────────────────┘
```

两条铁律：

1. 终端必须走 **PTY**（不能用普通管道子进程），否则颜色、密码输入、vim/htop 等交互全部丢失
2. 面板数据一律从**文件与命令**读取，不解析终端输出（脆弱且没必要）

## 2. 与 Gemini CLI 的集成方式

Gemini CLI 官方提供三条集成通道，按需选择 / 组合：

| 方式 | 用法 | 能力 | 工作量 | 定位 |
| --- | --- | --- | --- | --- |
| 交互终端 | PTY 中运行 `gemini`（套 tmux） | 与终端 100% 一致，审批提示、快捷键天然可用 | 最小 | **P0 采用** |
| Headless | `gemini -p "..." --output-format stream-json` | JSONL 事件流（`init`/`message`/`tool_use`/`tool_result`/`error`/`result`），可渲染聊天 UI + 工具卡片 | 中 | P3 探索 |
| ACP | `gemini --acp`（JSON-RPC over stdio） | 官方 IDE 协议（Zed/JetBrains 同款）：`newSession`/`loadSession`/`prompt`/`cancel`/`setSessionMode` 审批控制、切换模型 | 大 | P3+ 远景 |

补充：headless 模式的审批由 `--approval-mode`（`default` / `auto_edit` / `plan` / `yolo`）策略控制，没有逐条交互式审批；需要逐条审批按钮时，ACP 或交互终端是唯一选择。

## 3. 技术选型

| 层 | 选型 | 说明 |
| --- | --- | --- |
| 后端 | Node.js + Fastify（或 Express）+ `ws` + `node-pty` | node-pty 为 VS Code 同款方案；Gemini CLI 自身交互 shell 也使用 node-pty |
| 前端 | React + Vite + Tailwind CSS | 面板较多，组件化便于迭代 |
| 终端 | `@xterm/xterm` + `addon-fit` + `addon-web-links` + `addon-serialize` | fit 处理窗口自适应；serialize 支持终端缓冲导出 |
| 会话层 | tmux | 进程持久化与重连 attach |

## 4. 会话层设计（tmux）

- 每个工作区对应一个 tmux session，命名如 `ws-<id>`：
  `tmux new -A -s ws-<id> -c <工作区目录>`（存在则 attach，不存在则创建）
- PTY 直接运行上述命令 → 浏览器刷新 / 重连即重新 attach，历史画面与运行中进程自动保留
- 终端 tab 只是同一 session 的多个视图；关闭浏览器不影响进程
- 面板提供：新建 / detach / kill session

## 5. 接口草案

### WebSocket：`/ws/terminal/:sessionId`

```text
client → server:  { type: "input",  data: "..." }   # 键盘输入
                  { type: "resize", cols, rows }     # 窗口尺寸（透传 SIGWINCH）
server → client:  { type: "output", data: "..." }   # 终端输出（前端 term.write）
                  { type: "exit",   code: 0 }       # 进程退出
```

> 帧格式（JSON 文本帧）、心跳与重连策略详见 [spec/04-api-design.md](../spec/04-api-design.md)。

### REST 草案（按需求编号划分）

| 方法 | 路径 | 对应需求 |
| --- | --- | --- |
| GET/POST/DELETE | `/api/workspaces` | FR-1 |
| POST | `/api/terminal-sessions`（创建并 attach） | FR-2 |
| GET/PUT | `/api/config`（合并展示 / 写入指定层级） | FR-3 |
| GET | `/api/git/status`、`/api/git/diff` | FR-4 |
| POST | `/api/git/commit`、`/api/git/push` | FR-4 |
| GET | `/api/gemini-sessions`（按工作区列历史） | FR-5 |
| GET | `/api/gemini-sessions/:id/export`（Markdown/JSON） | FR-5 |
| GET/POST/PUT/DELETE | `/api/mcp/servers` | FR-6 |
| GET/POST/PUT | `/api/skills` | FR-7 |
| GET/PUT | `/api/commands` | FR-8 |

## 6. 关键文件路径（官方文档核实，2026-10-15）

| 用途 | 路径 |
| --- | --- |
| 用户级配置 | `~/.gemini/settings.json` |
| 工作区级配置 | `<项目>/.gemini/settings.json`（覆盖用户级同名项） |
| MCP 服务器定义 | `settings.json` → `mcpServers`；全局开关 `mcp.allowed` / `mcp.excluded` |
| Skills | `~/.gemini/skills/` 与 `<项目>/.gemini/skills/`（`.agents/skills/` 为别名；每个 Skill = 含 `SKILL.md` 的目录） |
| 自定义命令 | `~/.gemini/commands/*.toml` 与 `<项目>/.gemini/commands/`（子目录 = 命名空间，如 `git:commit`） |
| 会话记录 | `~/.gemini/tmp/<project_hash>/chats/`（含完整对话、工具执行、token 统计） |
| 恢复会话 | `gemini --resume`（`-r`，可按最新 / 序号 / UUID）——终端模式下天然可用 |

## 7. 安全设计

- 服务仅监听 `127.0.0.1`；访问需令牌（首次启动生成，URL 携带或 Header 传递）
- Git / 文件操作统一用 `execFile`（参数数组），禁止拼接 shell 字符串，防命令注入
- 所有涉及路径的接口校验目标目录属于已登记工作区
- 数据全部本地存储，无任何外发请求

## 8. 参考项目与资料

同类 / 可借鉴：

- VibeTunnel —— 浏览器中的 agent CLI 终端（终端层实现参考）
- CC Switch —— 多 AI CLI 配置统一管理（配置面板参考）
- code-server / VS Code —— xterm.js + node-pty 的工业级实现

官方文档（Gemini CLI）：

- [Headless mode](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/headless.md)（`-p`、`--output-format`）
- [ACP mode](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/acp-mode.md)
- [Session management](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/session-management.md)
- [Settings](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/settings.md)
- [Agent Skills](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/skills.md)
- [Custom commands](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/custom-commands.md)
- [MCP servers](https://github.com/google-gemini/gemini-cli/blob/main/docs/tools/mcp-server.md)
