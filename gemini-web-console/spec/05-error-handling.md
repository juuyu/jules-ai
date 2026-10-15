# 05 错误处理规范

> v0.1（2026-10-15）｜[规范总览](./README.md)

## 1. 原则

1. **失败要快**：参数 / 权限问题在入口拦截，不进入业务逻辑
2. **信息要准**：错误消息面向"我能做什么"，而非堆栈（如"未安装 tmux，请安装后重试"）
3. **状态可恢复**：终端类失败以 tmux 兜底；文件写入失败不得留下半成品
4. **绝不静默失败**：每个用户可见操作的失败，都必须有可见反馈

## 2. 错误类型与错误码

统一错误对象 `AppError { status, code, message }` 定义在 `server/lib/errors.js`；错误码集中定义，禁止散落字符串：

| code | status | 场景 |
| --- | --- | --- |
| INVALID_PARAM | 400 | 参数缺失 / 非法 |
| UNAUTHORIZED | 403 | 令牌错误 |
| WORKSPACE_NOT_FOUND | 404 | 工作区未登记 |
| GEMINI_FILE_NOT_FOUND | 404 | 目标配置 / 会话文件不存在 |
| GIT_FAILED | 409 | git 命令非零退出（附 stderr 摘要） |
| TMUX_NOT_AVAILABLE | 500 | 系统未安装 tmux |
| PTY_SPAWN_FAILED | 500 | 会话创建失败 |
| INTERNAL | 500 | 未预期错误 |

## 3. 后端约定

- 路由层用统一 `fail(res, status, code, message)` 输出规范错误体；未知异常由全局兜底中间件转 `INTERNAL`
- 原始异常（含堆栈）只写日志，**不返回前端**
- 外部进程统一经 `server/lib/exec.js` 封装：返回 `{ ok, stdout, stderr, exitCode }`，不抛裸异常；超时（默认 30s）与命令不存在都归一为具体错误码
- 日志：单行结构化 `[time][level][module] message`，写 stderr；MVP 不引日志库
- PTY / WS：进程退出广播 `{ type: "exit" }`；WS 异常关闭时清理内存引用但保留 tmux session
- 服务退出（SIGINT）：断开所有 PTY 连接；**保留 tmux session**（持久化设计目的）

## 4. 前端约定

- `api.js` 统一封装：HTTP 非 ok 或 `ok: false` → 抛出带 message 的错误
- 面板级错误就地内联展示（不弹全屏）；破坏性操作（commit / push / kill）失败必须展示命令 stderr 摘要
- 终端断线：顶部提示"连接已断开，正在重连…"，成功后自动消除；期间不清空终端画面
- 表单先校验再提交（如 commit message 非空），不合法不发请求

## 5. 反例（禁止）

```js
// ✗ 吞掉错误
try { await git.push(cwd); } catch (e) {}

// ✗ 把技术细节直接丢给用户
return fail(res, 500, 'INTERNAL', e.stack);

// ✗ 操作失败但界面无任何反馈（静默失败）
```
