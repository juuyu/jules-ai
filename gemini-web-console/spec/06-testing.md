# 06 测试规范

> v0.1（2026-10-15）｜[规范总览](./README.md)

## 1. 工具与运行

- 统一使用 **Vitest**（前后端一致，天然兼容 Vite）
- `npm test` 必须一键跑通全部测试才能提交
- 测试放 `tests/`，镜像源码结构：`tests/lib/git.test.js` 对应 `server/lib/git.js`

## 2. 测试分层与优先级

| 层 | 范围 | 方式 | 优先级 |
| --- | --- | --- | --- |
| 单元 | server/lib 纯逻辑：路径解析、响应封装、会话文件解析、错误码 | 直接调用 + 真实临时目录 | 高 |
| 集成 | REST 路由（workspaces / git / gemini-files） | 真实 HTTP（fastify.inject 或 fetch）+ 真实 git 临时仓库 | 高 |
| 契约 | WS 终端流消息（input / resize / output / exit） | 注入 fake PTY（依赖注入，不做模块级 mock） | 中 |
| 冒烟 | 启动服务 → 创建会话 → 收到输出 → 关连接不杀进程 | 手动为主，可脚本化 | 低 |

## 3. 原则

- **测行为，不测实现**：断言输入输出，不断言内部调用顺序
- **不 mock 自己写的模块**：只允许 fake 外部系统（PTY、tmux），通过依赖注入实现
- **真实文件系统 + 真实 git**：用 `fs.mkdtemp` 建临时目录跑真命令，不 mock fs（mock 通过 ≠ 真实环境通过）
- 不测试：xterm.js 渲染细节、tmux 行为本身、Gemini CLI 自身（上游职责）
- 每个错误码 / 分支至少一个用例

## 4. 覆盖率与边界

- 目标：`server/lib` 与 `server/api` 行覆盖 ≥ 70%；不追数字，关键路径必须覆盖
- 必测边界：空工作区列表、无效 workspaceId、git 命令失败（非零退出）、配置文件不存在、非法 JSON
- 涉及路径拼接的函数必须测：中文路径、含空格路径、symlink

## 5. 命名

- `describe('git.commit', ...)` + `it('message 为空时返回 INVALID_PARAM', ...)`
- 测试名描述行为与预期；禁止 `it('works', ...)`
