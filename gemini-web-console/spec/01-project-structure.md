# 01 目录结构规范

> v0.1（2026-10-15）｜[规范总览](./README.md) ｜关联：[技术方案](../docs/02-technical-design.md)

## 目标结构

```text
gemini-web-console/
├── README.md               # 产品总览（是什么、怎么跑）
├── docs/                   # 需求与技术设计（现状文档）
├── spec/                   # 编码规范（本目录）
├── package.json            # 后端依赖与脚本（根包）
├── server/                 # Node 后端（唯一服务进程）
│   ├── index.js            # 入口：启动 HTTP 服务，挂载 REST 与 WebSocket
│   ├── config.js           # 端口、令牌、路径常量（唯一配置来源）
│   ├── terminal.js         # 会话管理器：node-pty + tmux 生命周期
│   ├── api/                # REST 路由，按领域一文件
│   │   ├── workspaces.js
│   │   ├── git.js
│   │   ├── gemini-files.js # 配置 / MCP / Skills / 命令（读写 ~/.gemini 与项目 .gemini）
│   │   └── sessions.js     # 终端会话 + 历史会话导出
│   └── lib/                # 纯逻辑与外部命令封装（不感知 HTTP）
│       ├── errors.js       # 错误码集中定义 + AppError + 统一响应体
│       ├── exec.js         # execFile 统一封装（超时、错误归一）
│       ├── json-file.js    # JSON 文件安全读写（读-改-写串行）
│       ├── workspaces.js   # 工作区白名单存取（路径校验、去重）
│       ├── gemini-paths.js # ~/.gemini 路径解析（以官方文档为准）
│       └── git.js          # git 命令封装（status / diff / commit / push）
├── web/                    # 前端（Vite 工程）
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx         # 布局：工作区侧栏 + 终端区 + 面板
│       ├── api.js          # REST / WS 客户端封装（前端唯一网络入口）
│       ├── components/     # 通用组件（TerminalView、Panel、Toast）
│       ├── panels/         # 功能面板（Git、MCP、Skills、命令、会话）
│       └── hooks/          # useTerminal、useApi 等
├── tests/                  # 测试，镜像 server / web 结构
├── scripts/                # 开发辅助脚本（不参与服务运行时）
│   ├── fix-node-pty.js     # postinstall：修复 node-pty spawn-helper 可执行权限
│   └── e2e-smoke.mjs       # P0 端到端冒烟（需 tmux + 后端已启动）
└── data/                   # 运行时数据（workspaces.json 等）→ .gitignore
```

## 分层规则

| 层 | 可以依赖 | 禁止 |
| --- | --- | --- |
| server/api | server/lib、config | 直接调用 pty / child_process（必须经 lib 封装） |
| server/lib | Node 内置、第三方库 | 引用 server/api、web/* |
| web/* | server 的 HTTP / WS 接口 | 直接读文件系统、直接执行命令 |
| 任意 | — | 跨层反向引用、循环依赖 |

## 约束

- `server/` 与 `web/` 严格分离：前端是纯消费方，一切数据经 API
- 单文件 ≤ 300 行；超出时按职责拆分（拆职责，不是为行数而拆）
- `data/`、`node_modules/`、构建产物一律进 `.gitignore`
- 新增顶层目录前先更新本规范
