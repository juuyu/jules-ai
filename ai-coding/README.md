# AI 编程学习

> 目标：建立完整的 AI 编程知识体系

## 章节

| 章节 | 内容 | 状态 |
| --- | --- | --- |
| [01 基础认知](./01-fundamentals.md) | LLM 原理速览、能力边界、模型选型 | 初稿 |
| [02 核心技能](./02-core-skills.md) | Prompt 技巧、上下文工程、协作模式 | 初稿 |
| [03 工具生态](./03-tools.md) | CLI / IDE / 插件 / 云端 Agent 全景与选型 | 初稿 |
| [04 工作流实践](./04-workflow.md) | 日常编码流、多 Agent、AI 审查、安全 | 初稿 |
| [05 进阶方向](./05-advanced.md) | MCP、自建工具、记忆系统 | 初稿 |
| [06 常用术语表](./06-glossary.md) | Skill / Agent / MCP 等高频词汇速查（截至 2026-10） | 初稿 |
| [07 终端 Agent 实战](./07-cli-agents.md) | Claude Code 与 Gemini 系 CLI：科普 / 教程 / 最佳实践 | 初稿 |
| [08 AI IDE 实战](./08-ai-ide.md) | Cursor / Antigravity / Trae / Qoder：科普 / 教程 / 最佳实践 | 初稿 |
| [09 MCP 开发实战](./09-mcp-dev.md) | 从开放 API 到自己的 MCP 服务器：三条路线 / FastMCP 教程 / GitHub 项目索引 | 初稿 |
| [10 能力封装](./10-skill-vs-command.md) | Skill 与 Command 怎么选：本质区别 / 两问决策法 / 判例集 / 反模式清单 | 初稿 |
| [11 项目知识库](./11-project-memory.md) | AI 的长期项目记忆：四层模型 / MAP.md 模块地图 / 漂移检测 / 定位题度量 | 初稿 |
| [12 代码腐坏治理](./12-code-rot.md) | AI 时代的熵管理：防 / 检 / 治三段机制 / rot-check / 能力清单 / 健康度量 | 初稿 |

## 建议阅读顺序

按编号顺序：01 → 02 → 03 → 04 → 05。赶时间可直接看 03（工具）+ 04（工作流）；06 术语表可随时查阅；07、08 是两个上手方向的深度实战教程，可与 03 配合着动手；09 讲 MCP 开发，建议先读过 05 的 MCP 部分或 `templates/gemini-cli` 的 MCP 章节再动手；10 讲能力封装选型（Skill / Command），建议读过 07 或 `templates/gemini-cli` 模板后再看；11 讲项目知识库的建立与维护（AI 的长期记忆），建议读过 02 的规则文件与 05 的记忆层次后再看；12 讲代码腐坏治理（防 → 检 → 治 三段机制），建议与 02、04 的质量实践配套看。
