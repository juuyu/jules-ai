# 05 进阶方向

> 本章解决：从"用好 AI 工具"到"理解并扩展 AI 工具"——MCP、自定义工具、记忆系统。

## 5.1 MCP：给 AI 接上工具与数据

### 是什么

- Model Context Protocol：一个开放协议，统一"AI 应用 ↔ 外部工具 / 数据"的接口
- 类比：AI 世界的 USB-C——Host 是电脑，MCP Server 是外设
- 解决的问题：不必为每个 AI 工具重复写集成，一次实现、处处可用

### 架构

- **Host**：AI 应用（Claude Code、Cursor 等）
- **Client**：Host 内部与 Server 通信的组件
- **Server**：对外暴露能力的一端——工具（tools）、资源（resources）、提示（prompts）
- **传输**：本地 stdio、远程 HTTP / SSE
- **演进**：2026-07 规范大修订（转向无状态架构，过渡期 12 个月），动手前先看最新规范

### 常见用法

- 接入最新文档（如 context7）、浏览器自动化（playwright）、数据库、内部系统
- 在 AI 工具的配置里添加 MCP Server 即可扩展能力，无需代码

### 自己写一个 MCP Server

- Python 用官方 SDK 或 FastMCP，TypeScript 用官方 SDK
- 一个工具 = 一个函数 + 描述；description 就是给模型看的"说明书"，写法直接决定调用质量
- 练手场景：把公司内部 API、代码规范检查器、部署脚本封装成 MCP 工具

## 5.2 基于 LLM API 构建自己的工具

### 最小 Agent 循环

```text
while 任务未完成:
    响应 = 调用模型(消息历史, 工具列表)
    if 响应包含工具调用:
        结果 = 执行工具()
        消息历史 += 工具结果
    else:
        输出最终答案，结束
```

- 工具调用（function calling）是核心原语
- 关键工程点：工具描述写法、错误结果也要回传（让模型能自我修正）、循环次数上限

### 值得自己造的轮子

- 项目专属的代码检查 / 修复 Agent
- 批量任务脚本：改 50 个文件、跨仓库迁移 API
- CI 集成：自动 review、自动修 lint、自动补测试

### 现成积木

- Claude Agent SDK、OpenAI Agents SDK，以及各种 Agent 框架（见 awesome-repos/agent-frameworks.md）
- Agent Skills 生态（anthropics/skills、superpowers 等）：把方法论封装成可复用技能包，与 MCP 互补

## 5.3 记忆与知识系统

### 记忆的层次

| 层次 | 载体 | 例子 |
| --- | --- | --- |
| 会话内 | 对话历史 | 当前任务的上下文 |
| 项目级 | 规则文件 + 文档 | AGENTS.md、docs/、spec 文档 |
| 跨项目 | 个人知识库 | 笔记、学习仓库（比如本仓库） |

### 让 AI 记住项目知识的实用做法

- 关键决策写进 ADR（架构决策记录）或 docs/ 目录
- 规则文件持续更新：每次纠正 AI，问自己"这条要不要写进规则"
- 大型代码库考虑检索增强（RAG）或代码索引工具

### 评估与迭代

- 建立个人"评测集"：常见任务 + 期望结果；换模型、换提示词后回归验证
- 记录失败案例：同一类错误反复出现 → 提炼成规则文件条目
