# MCP 协议与生态

> 数据截至 2026-10-15（GitHub API 实时获取，约数）· 收录格式：仓库 | Star | 一句话 | 备注

## 规范与官方 SDK

| 仓库 | Star | 简介 | 备注 |
| --- | --- | --- | --- |
| [modelcontextprotocol/modelcontextprotocol](https://github.com/modelcontextprotocol/modelcontextprotocol) | 9.5k | MCP 官方规范与文档 | 活跃；**2026-07 规范大修订：转向无状态架构**（12 个月过渡期） |
| [modelcontextprotocol/python-sdk](https://github.com/modelcontextprotocol/python-sdk) | 24.6k | 官方 Python SDK | 活跃 |
| [modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk) | 13.6k | 官方 TypeScript SDK | 活跃 |
| [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) | 91.3k | 官方参考 Server 合集（filesystem、git、memory 等） | 活跃；旧第三方 Server 已移入 servers-archived |
| [modelcontextprotocol/inspector](https://github.com/modelcontextprotocol/inspector) | 11.1k | 官方调试 / 可视化测试工具 | 活跃；写 Server 必备 |
| [modelcontextprotocol/registry](https://github.com/modelcontextprotocol/registry) | 7.4k | 官方 MCP Registry | 活跃；registry.modelcontextprotocol.io 已上线 |
| [modelcontextprotocol/ext-apps](https://github.com/modelcontextprotocol/ext-apps) | 3.0k | MCP Apps 规范与 SDK（对话内嵌 UI） | 2026 新热点，Claude / ChatGPT 已支持 |

## 热门 Server 与工具

| 仓库 | Star | 简介 | 备注 |
| --- | --- | --- | --- |
| [upstash/context7](https://github.com/upstash/context7) | 63.1k | 给 Agent 注入最新官方文档 | 活跃；第三方 Server 第一梯队 |
| [ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp) | 53.6k | Chrome 官方 DevTools MCP | 活跃；浏览器调试首选 |
| [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) | 38.2k | 微软官方浏览器自动化 MCP | 活跃 |
| [github/github-mcp-server](https://github.com/github/github-mcp-server) | 33.6k | GitHub 官方 MCP Server | 活跃 |
| [ahujasid/mcp-for-blender](https://github.com/ahujasid/mcp-for-blender) | 30.9k | 用 LLM 控制 Blender 建模 | 活跃；已更名（原 blender-mcp） |
| [oraios/serena](https://github.com/oraios/serena) | 30.3k | 编码 Agent 的语义检索 / 编辑工具包 | 活跃 |
| [PrefectHQ/fastmcp](https://github.com/PrefectHQ/fastmcp) | 28.1k | Python 构建 MCP 服务端的事实标准 | 活跃；已被 Prefect 收编 |
| [GLips/Figma-Context-MCP](https://github.com/GLips/Figma-Context-MCP) | 16.0k | 给 Agent 喂 Figma 设计稿上下文 | 活跃 |
| [mcp-use/mcp-use](https://github.com/mcp-use/mcp-use) | 10.8k | 全栈 MCP 开发框架 | 活跃 |
| [wonderwhy-er/DesktopCommanderMCP](https://github.com/wonderwhy-er/DesktopCommanderMCP) | 10.1k | 桌面文件 / 终端操作 MCP | 活跃 |
| [mark3labs/mcp-go](https://github.com/mark3labs/mcp-go) | 9.2k | Go 语言 MCP 实现库 | 活跃 |
| [awslabs/mcp](https://github.com/awslabs/mcp) | 9.8k | AWS 官方 MCP Server 集合 | 活跃 |
| [firecrawl/firecrawl-mcp-server](https://github.com/firecrawl/firecrawl-mcp-server) | 7.6k | 网页抓取 MCP | 活跃 |

## 清单与目录站

| 名称 | Star / 形态 | 简介 | 备注 |
| --- | --- | --- | --- |
| [punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) | 96.4k | 最大的 MCP Server 清单 | 活跃 |
| Smithery（网站 + CLI） | 网站 | MCP Server 托管与目录（2.7 万+） | **已并入 Arcade.dev** |
| Glama（网站） | 网站 | MCP 目录（9.9 万+ 收录） | 持续运营 |
| mcp.so（网站） | 网站 | MCP Server 目录站 | 持续运营 |

## 2025-2026 关键动态

- **2026-07 规范大修订**：核心转向"无状态"设计，进入 12 个月弃用过渡期——写 Server / Client 前先读最新规范
- **MCP Apps 成为新热点**：在对话内嵌交互 UI，Claude / ChatGPT 均已支持
- **生态入口集中化**：官方 Registry 上线 + Glama 近 10 万收录；Smithery 被收购
- 旧清单 [wong2/awesome-mcp-servers](https://github.com/wong2/awesome-mcp-servers)（4.4k）已明显停更，优先看 punkpeye 版
