# Gemini Web Console（暂定名）

本地网页版 Gemini CLI 控制台 —— 个人定制实现的"轻量 Qoder 本地版"。

## 背景

公司电脑仅可使用 Gemini CLI 等命令行工具，无法安装 Code / Qoder 类 AI IDE。
目标是在本机构建一个浏览器可访问的控制台，把日常开发中的高频操作从终端搬进网页，
并封装一批定制功能：工作区选择、MCP 管理、Skills 管理、会话导出、Git 提交等。

## 产品定位

- **不是**：完整 IDE、云端协作平台
- **是**：单用户本地 Web 控制台 = 终端（与原生体验 100% 一致）+ 定制功能面板

## 技术要点（详见 docs/）

- 前端：xterm.js（终端渲染）+ 常规 Web UI（功能面板）
- 后端：Node.js（node-pty + WebSocket + REST）
- 会话层：tmux 持久化 —— 刷新页面 / 关闭浏览器不丢进程与历史
- 与 Gemini CLI 集成有官方三条通道：交互 PTY、headless stream-json、ACP 协议（渐进采用）

## 快速开始

前置要求：Node.js ≥ 20、tmux（macOS：`brew install tmux`）

```bash
# 1. 安装依赖（后端 + 前端）
npm install
cd web && npm install && cd ..

# 2. 启动后端（默认 http://127.0.0.1:7331）
npm start

# 3. 另开终端，启动前端开发服务器（http://127.0.0.1:5174）
cd web && npm run dev
```

启动日志会打印带令牌的访问地址（形如 `http://127.0.0.1:5174/?token=...`），浏览器直接打开即可。
令牌首次启动自动生成并保存于 `data/token`（仅本机可读）；服务只监听 127.0.0.1，不对外暴露。

其他命令：

| 命令 | 说明 |
| --- | --- |
| `npm test` | 运行 Vitest 测试（单元 + 接口） |
| `npm run dev` | 后端热重载启动 |
| `npm run smoke` | P0 端到端冒烟（需后端已启动、tmux 可用） |
| `cd web && npm run build` | 构建前端产物到 web/dist |

## 文档

| 文档 | 内容 |
| --- | --- |
| [docs/01-requirements.md](./docs/01-requirements.md) | 需求文档：背景、目标、功能清单、优先级、验收标准 |
| [docs/02-technical-design.md](./docs/02-technical-design.md) | 技术方案：架构、集成方式对比、接口草案、关键路径、安全设计 |
| [spec/](./spec/README.md) | 编码规范（7 项）：目录结构 / 文件命名 / 代码组织 / 接口设计 / 错误处理 / 测试 / 文档 |

## 当前状态

- [x] 需求调研与技术方案（2026-10-15）
- [x] P0：工作区 + 终端会话 + 多 tab（骨架完成，E2E 冒烟通过）
- [ ] P1：Git 面板 + 配置查看
- [ ] P2：会话导出 + MCP / Skills / 命令管理
- [ ] P3：聊天模式（stream-json）、ACP 探索
