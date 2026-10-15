# 04 接口设计规范

> v0.1（2026-10-15）｜[规范总览](./README.md) ｜关联：[技术方案 §5](../docs/02-technical-design.md)

## 1. 模块间接口（server 内部）

- lib 导出纯函数 / 小对象，签名稳定，例如 `git.commit(cwd, message) → { hash, summary }`
- 跨模块只传普通数据对象（camelCase 字段），不传 HTTP 的 req / res
- terminal.js 对外仅暴露：`create({ workspaceId })`、`attach(sessionId, ws)`、`resize(sessionId, cols, rows)`、`kill(sessionId)`、`list()`

## 2. REST 规范

### 统一响应格式

```jsonc
// 成功
{ "ok": true, "data": { } }
// 失败
{ "ok": false, "error": { "code": "WORKSPACE_NOT_FOUND", "message": "工作区不存在" } }
```

### 状态码约定

| 码 | 场景 |
| --- | --- |
| 200 / 201 | 成功 / 创建成功 |
| 400 | 参数非法（`INVALID_PARAM`） |
| 403 | 令牌无效 |
| 404 | 资源不存在（`*_NOT_FOUND`） |
| 409 | 状态冲突（如无变更时 commit） |
| 500 | 未预期错误（`INTERNAL`，细节只进日志） |

### 路径与参数

- 路径为 `/api/<复数资源>`；动作用 POST 子路径：`POST /api/git/commit`
- 查询参数 camelCase：`?workspaceId=xxx`
- 所有含路径的接口：目标目录必须命中工作区白名单，否则拒绝

### 长操作

- 本地环境默认同步返回；确实超过 2s 的操作改 202 + 轮询或 WS 进度（MVP 从简，先同步 + 前端 loading）

## 3. WebSocket 协议（终端流）

- 端点：`/ws/terminal/:sessionId`
- **所有帧为 JSON 文本帧**（本地环境性能足够，可调试性优先）

```jsonc
// client → server
{ "type": "input",  "data": "\u001b[A" }        // 按键（原样转发 PTY）
{ "type": "resize", "cols": 120, "rows": 30 }   // 透传 SIGWINCH

// server → client
{ "type": "output", "data": "..." }             // 终端输出（前端 term.write）
{ "type": "exit",   "code": 0 }                 // 进程退出
```

- 心跳：服务端 30s 发 `{"type":"ping"}`，客户端立即回 `{"type":"pong"}`
- 重连：前端指数退避（1s 起、上限 10s）；重连后依靠 tmux 恢复画面，前端不清屏
- 连接关闭时服务端**只 detach、不 kill** PTY（tmux 保活）；kill 仅来自显式操作

## 4. 接口文档同步

- 新增 / 修改接口时同步更新本文档与[技术方案 §5](../docs/02-technical-design.md)
- 每个接口注明：方法、路径、参数、响应、可能错误码
