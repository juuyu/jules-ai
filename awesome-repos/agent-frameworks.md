# Agent 编排框架

> 数据截至 2026-10-15（GitHub API 实时获取，约数）· 收录格式：仓库 | Star | 一句话 | 备注

## 通用框架（Python 为主）

| 仓库 | Star | 简介 | 备注 |
| --- | --- | --- | --- |
| [langgenius/dify](https://github.com/langgenius/dify) | 159k | LLMOps + Agent 工作流平台（低代码） | 极活跃；RAG 场景见 rag-knowledge |
| [langchain-ai/langchain](https://github.com/langchain-ai/langchain) | 148k | 老牌 LLM 应用框架 | 极活跃；生态最大 |
| [microsoft/autogen](https://github.com/microsoft/autogen) | 61k | 多 Agent 对话框架 | 维护模式：主线迁至 agent-framework |
| [crewAIInc/crewAI](https://github.com/crewAIInc/crewAI) | 60k | 角色协作式多 Agent | 活跃 |
| [run-llama/llama_index](https://github.com/run-llama/llama_index) | 53k | 数据 / RAG / Agent 框架 | 活跃 |
| [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph) | 43k | 有状态 Agent 编排（图结构） | 活跃 |
| [agno-agi/agno](https://github.com/agno-agi/agno) | 43k | 轻量高性能 Agent 框架 | 活跃 |
| [huggingface/smolagents](https://github.com/huggingface/smolagents) | 30k | 极简"代码即 Agent" | 活跃 |
| [microsoft/semantic-kernel](https://github.com/microsoft/semantic-kernel) | 29k | 微软企业级 SDK（.NET / Python / Java） | 活跃；生态逐步并入 agent-framework |
| [google/adk-python](https://github.com/google/adk-python) | 22k | Google 官方 Agent 开发套件 | 活跃 |
| [pydantic/pydantic-ai](https://github.com/pydantic/pydantic-ai) | 21k | 类型安全的 Agent 框架 | 活跃 |

## 模型厂商官方 SDK

| 仓库 | Star | 简介 | 备注 |
| --- | --- | --- | --- |
| [openai/openai-agents-python](https://github.com/openai/openai-agents-python) | 30k | OpenAI 官方 Agents SDK | 活跃 |
| [microsoft/agent-framework](https://github.com/microsoft/agent-framework) | 14k | 微软新一代统一框架（SK + AutoGen 继任） | 活跃，2025-10 起发布 |
| [anthropics/claude-agent-sdk-python](https://github.com/anthropics/claude-agent-sdk-python) | 8.3k | Claude Agent SDK（封装 Claude Code） | 活跃 |

## TypeScript 生态

| 仓库 | Star | 简介 | 备注 |
| --- | --- | --- | --- |
| [mastra-ai/mastra](https://github.com/mastra-ai/mastra) | 29k | TypeScript Agent 框架 | 活跃 |

## 专项方向

| 仓库 | Star | 简介 | 备注 |
| --- | --- | --- | --- |
| [browser-use/browser-use](https://github.com/browser-use/browser-use) | 118k | 浏览器自动化 Agent | 活跃；网页任务首选 |
| [strands-agents/sdk-python](https://github.com/strands-agents/sdk-python) | 8.8k | AWS 开源的 Agent 框架 | 活跃 |

## 已弃用 / 注意事项

- [openai/swarm](https://github.com/openai/swarm)（22k）已弃用，官方指向 Agents SDK
- [ag2ai/ag2](https://github.com/ag2ai/ag2)（5k）为 AutoGen 社区分叉，热度低，不建议新项目选用
- [a2aproject/A2A](https://github.com/a2aproject/A2A)（26k）是跨 Agent 通信协议（非框架），关注其标准化动向
- 选型心法：先想清楚编排模式（链式 / 图 / 多角色 / 事件驱动），再选框架；多数场景从官方 SDK 起步即可
