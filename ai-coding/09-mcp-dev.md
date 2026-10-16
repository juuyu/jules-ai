# 09 MCP 开发实战：从开放 API 到自己的服务器

> 本章解决：现成 MCP 服务器满足不了需求时，怎么用系统已有的开放 API（或内部服务）自己造一个 MCP。信息截至 2026-10-17，代码示例基于 FastMCP 3.x，安装与 API 以官方文档为准。MCP 的配置使用与握手机制见 [`templates/gemini-cli/README.md`](../templates/gemini-cli/README.md) 的 MCP 章节——本章只讲"造"的那一半。

## 9.1 科普：开发者视角的 MCP 服务器

### MCP 服务器 = 协议适配进程

从开发者视角看，stdio 型 MCP 服务器就是一个"翻译进程"：一边对你要包装的系统说 HTTP（或 SQL、SDK 调用），一边对 Gemini CLI 说 MCP 协议（JSON-RPC over stdin/stdout）。它不神秘——mcp-atlassian 的唯一上游就是 Confluence REST API，MCP 只是壳。

会话启动时 CLI 和服务器之间发生的事（initialize → tools/list → tools/call），已在模板 README 的「初次握手」一节逐条拆解。你写的服务器只需要实现这套握手的另一端：

- 收到 `initialize` → 报上自己的名字与能力；
- 收到 `tools/list` → 返回工具菜单（名字 / 描述 / 参数 schema）；
- 收到 `tools/call` → 执行真实 API 调用，返回结果。

好消息：用 FastMCP 这类框架，这三件事几乎不用手写——定义一个普通函数加装饰器即可。

### 什么时候值得自己开发

| 场景 | 例子 |
| --- | --- |
| 没有现成的服务器 | 公司内部系统、自研服务、冷门 SaaS |
| 有现成的但不好用 | 工具粒度太粗、描述含糊、缺关键操作 |
| 想聚合多个 API | 把「查订单 + 发通知 + 改状态」合成一组用户意图级工具 |

## 9.2 三条路线选型

| 路线 | 适用 | 手段 | 成本 | 定位 |
| --- | --- | --- | --- | --- |
| ① OpenAPI 自动转换 | API 有 Swagger / OpenAPI 文档 | `FastMCP.from_openapi()` 十行代码 | 半小时 | 起手原型 |
| ② 手写精选工具 | 没有规范文档、语义复杂、追求好用 | `@mcp.tool` 逐工具包 API 调用 | 按工具数 1~2 天 | 长期方案 |
| ③ 托管桥接 | 完全不想写代码，系统恰好被托管平台覆盖 | Zapier MCP、Composio 等托管服务 | 分钟级 | 应急 / 轻量，可控性最差 |

无论哪条路线，最终产出都一样：一个能被 `settings.json` 一行配置接进 Gemini CLI 的进程或 URL。

## 9.3 教程 A：OpenAPI 自动转换（半小时出原型）

前提：能拿到 API 的 OpenAPI（Swagger）文档。官方文档的十行标准写法：

```python
# api_bridge.py
import httpx2
from fastmcp import FastMCP

client = httpx2.AsyncClient(
    base_url="https://api.example.com",
    headers={"Authorization": "Bearer YOUR_TOKEN"},  # 凭证留在进程里
)
openapi_spec = httpx2.get("https://api.example.com/openapi.json").json()

mcp = FastMCP.from_openapi(
    openapi_spec=openapi_spec,
    client=client,
    name="My API Server",
)

if __name__ == "__main__":
    mcp.run()   # 默认 stdio，被 CLI 拉起时运行
```

运行后每个端点的 `operationId` 自动变成工具名与参数 schema。两个常用定制：

```python
mcp = FastMCP.from_openapi(
    openapi_spec=openapi_spec,
    client=client,
    name="My API Server",
    mcp_names={                      # operationId → 更顺手的工具名
        "listOrders": "list_orders",
        "createOrder": "create_order",
    },
    # route_map_fn：把不想暴露的端点排除（MCPType.EXCLUDE），
    # 或把 GET 类端点映射成 resource 而非 tool
)
```

> 注：`httpx2` 是 httpx 的继任版本（现由 Pydantic 团队维护）。

## 9.4 教程 B：手写精选（推荐长期方案）

自动转换是起点不是终点。手写版才能控制工具粒度、语义化名字和描述质量：

```python
# order_mcp.py
import os
import httpx2
from fastmcp import FastMCP

mcp = FastMCP(name="my-orders")
TOKEN = os.environ["MY_API_TOKEN"]          # 值放 .env，由 CLI 注入

@mcp.tool(annotations={"title": "查询订单", "readOnlyHint": True})
async def get_order(order_id: str) -> dict:
    """按订单号查询订单详情。order_id 形如 ORD-12345。"""
    async with httpx2.AsyncClient(base_url="https://api.example.com") as c:
        r = await c.get(f"/orders/{order_id}",
                        headers={"Authorization": f"Bearer {TOKEN}"})
        r.raise_for_status()
        return r.json()

@mcp.tool(annotations={"title": "取消订单", "destructiveHint": True})
async def cancel_order(order_id: str, reason: str = "") -> str:
    """取消一笔未发货订单（不可逆操作）。"""
    ...

if __name__ == "__main__":
    mcp.run()
```

三个关键点：

- **docstring 就是工具描述**——模型看到的就是它，写清楚"干什么、参数长什么样"；
- **`annotations` 是安全标注**——`readOnlyHint` 让只读工具可被策略自动放行，`destructiveHint` 让写操作进入确认流程；
- **参数名和类型即 schema**——`order_id: str` 自动生成 `{"type": "string"}` 并标记必填。

### 调试：MCP Inspector

写完别急着接进 CLI。官方可视化调试器可以单独拉起服务器、浏览工具菜单、手填参数试调用：

```bash
npx @modelcontextprotocol/inspector python /path/to/order_mcp.py
```

浏览器会自动打开控制台：工具列表、参数表单、调用结果一屏看完，改完代码重启即可——比每轮都开 Gemini CLI 会话快得多。

### 装入 Gemini CLI

```bash
# 方式一：FastMCP CLI 一键装（2.13.0+，底层自动调 gemini mcp add）
fastmcp install gemini-cli order_mcp.py
```

```jsonc
// 方式二：手动写进 .gemini/settings.json（或用户级 ~/.gemini/settings.json）
"mcpServers": {
  "my-orders": {
    "command": "python",
    "args": ["/absolute/path/order_mcp.py"],
    "env": { "MY_API_TOKEN": "$MY_API_TOKEN" },   // 值放个人 .env
    "trust": false
  }
}
```

装好后，会话启动时就会看到模板 README 里那套握手现场：进程被拉起 → initialize → tools/list → `get_order` / `cancel_order` 出现在 `/mcp` 菜单里。

## 9.5 最佳实践：六个设计要点

1. **工具粒度**：不要把 200 个 REST 端点原样暴露——菜单灌爆上下文、模型选择准确率骤降。按"用户意图"聚合；mcp-atlassian 就是"页面级"操作，不是 raw REST 镜像。
2. **描述质量**：schema 里的 description 是模型填参数时的唯一依据。把示例值写进去——mcp-atlassian 的 `space_key` 描述里直接给了 `'DEV', 'TEAM', or 'DOC'`。
3. **安全标注**：`readOnlyHint` / `destructiveHint` 会被 CLI 侧的确认与策略机制利用（见握手一节 CLI 的 `isReadOnly` 处理）。
4. **凭证**：只留在服务器进程的环境变量里，永远不作为工具参数出现；服务端自己也做权限校验（mcp-atlassian 的 `check_write_access` 与只读模式就是例子）。
5. **响应裁剪**：返回 LLM 友好的 JSON / markdown；大结果加 `limit` 分页参数或截断，别把整表原样扔给模型。
6. **官方忠告**：FastMCP 文档明确提示，auto-converted 服务器的模型表现明显差于精选手写版（另见博客《Stop Converting Your REST APIs to MCP》）——① 用于原型，② 用于长期。

## 9.6 部署形态：stdio 与远程

本地 stdio（默认）适合个人单机：进程由 CLI 按需拉起、退出即收工。远程 HTTP 适合团队共享、受限网络或多客户端：

```python
if __name__ == "__main__":
    mcp.run(transport="http", host="0.0.0.0", port=8000)   # 端点 http://<host>:8000/mcp
```

CLI 侧对应改成远程配法：

```jsonc
"mcpServers": {
  "my-orders": {
    "httpUrl": "http://192.168.1.10:8000/mcp",
    "trust": false
  }
}
```

- 生产环境务必加认证（FastMCP 内置 auth 支持），不要把无认证的写权限端点裸奔在内网；
- 两个常被搭配的桥接工具：**supergateway**（把 stdio 服务器桥成 HTTP / SSE）、**mcpo**（MCP → OpenAPI 反代，给非 MCP 客户端消费）；
- 受限网络提醒（如公司 Windows 装不了 uvx）：stdio 型可用 `python xxx.py` 直跑；或在一台能跑进程的机器上以 HTTP 模式起服务，本机用 `httpUrl` 连。

## 9.7 GitHub 项目索引

> Star 数据为 2026-10-17 经 `gh api` 实测。`PrefectHQ/fastmcp` 即原 `jlowin/fastmcp`（仓库已迁移，旧链接自动重定向）。

### 起步四件套

| 项目 | Stars | 用途 |
| --- | --- | --- |
| [modelcontextprotocol/modelcontextprotocol](https://github.com/modelcontextprotocol/modelcontextprotocol) | 9.5k | 协议规范——动手前先读 initialize / tools 两节 |
| [PrefectHQ/fastmcp](https://github.com/PrefectHQ/fastmcp) | 28.1k | 独立完整版 FastMCP，本章教程基准 |
| [modelcontextprotocol/python-sdk](https://github.com/modelcontextprotocol/python-sdk) | 24.6k | 官方 Python SDK（内置基础版 FastMCP） |
| [modelcontextprotocol/inspector](https://github.com/modelcontextprotocol/inspector) | 11.1k | 可视化调试器，开发必备 |

### 其他语言 SDK

| 项目 | Stars | 语言 |
| --- | --- | --- |
| [modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk) | 13.6k | TypeScript（官方） |
| [mark3labs/mcp-go](https://github.com/mark3labs/mcp-go) | 9.2k | Go（社区） |
| [modelcontextprotocol/go-sdk](https://github.com/modelcontextprotocol/go-sdk) | 5.2k | Go（官方） |
| [modelcontextprotocol/csharp-sdk](https://github.com/modelcontextprotocol/csharp-sdk) | 4.6k | C#（官方） |
| [modelcontextprotocol/rust-sdk](https://github.com/modelcontextprotocol/rust-sdk) | 4.0k | Rust（官方） |
| [modelcontextprotocol/java-sdk](https://github.com/modelcontextprotocol/java-sdk) | 3.7k | Java（官方） |
| [modelcontextprotocol/kotlin-sdk](https://github.com/modelcontextprotocol/kotlin-sdk) | 1.5k | Kotlin（官方，Android 项目可留意） |

### 学习样板（读源码学设计）

| 项目 | Stars | 说明 |
| --- | --- | --- |
| [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) | 91.3k | 官方参考服务器集 |
| [github/github-mcp-server](https://github.com/github/github-mcp-server) | 33.7k | GitHub 官方服务器 |
| [sooperset/mcp-atlassian](https://github.com/sooperset/mcp-atlassian) | 6.0k | 本仓库模板配套的 Confluence / Jira 服务器，值得精读 |

### 找现成服务器（汇总目录）

| 资源 | Stars / 形态 | 说明 |
| --- | --- | --- |
| [punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) | 96.5k | 最大的 MCP 服务器清单 |
| [wong2/awesome-mcp-servers](https://github.com/wong2/awesome-mcp-servers) | 4.4k | 精选版清单 |
| Smithery / Glama / mcp.so | 网站 | 带搜索与评分，查"有没有人已经做了"最快的三个站 |

### 桥接与部署工具

| 项目 | Stars | 用途 |
| --- | --- | --- |
| [open-webui/mcpo](https://github.com/open-webui/mcpo) | 4.4k | MCP → OpenAPI 反向代理 |
| [supercorp-ai/supergateway](https://github.com/supercorp-ai/supergateway) | 2.9k | stdio ↔ HTTP / SSE 桥接 |
| [arcadeai-labs/smithery-cli](https://github.com/arcadeai-labs/smithery-cli) | 0.8k | 命令行安装 / 管理 MCP 服务器 |

## 9.8 延伸

- **配置与使用侧**：[`templates/gemini-cli/README.md`](../templates/gemini-cli/README.md)——MCP 字段全参考、握手报文、Confluence 端到端实例都在那里；本章讲"造"，那篇讲"用"。
- **术语速查**：06 章的 MCP、Skill、Agent 等词条。
- **练手路线建议**：9.3 的自动转换先跑通 → Inspector 试调用 → 挑 3 个高频操作改写为 9.4 的手写版 → 装进 CLI，观察 `/mcp` 菜单与确认框行为。
