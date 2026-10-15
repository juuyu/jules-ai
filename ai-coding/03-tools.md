# 03 工具生态

> 本章解决：主流 AI 编程工具有哪些？各自适合什么场景？大概花多少钱？

## 3.1 工具分类总览

| 类型 | 形态 | 代表 | 适合 |
| --- | --- | --- | --- |
| 终端 Agent | CLI | Claude Code、Codex CLI、Gemini CLI、OpenCode、Crush | 老手、自动化、不挑编辑器 |
| AI IDE | 独立编辑器 | Cursor、Devin Desktop、Trae、Qoder、Kiro、Zed | 一体化体验、新手友好 |
| 编辑器插件 | VS Code / JetBrains 扩展 | GitHub Copilot、Cline、Kilo Code、Continue | 保留原编辑器习惯 |
| 云端 Agent | 网页 / 托管服务 | Devin、Google Jules、Codex 云端、Copilot coding agent | 委派整任务、并行推进 |
| 开源自托管 | 自由部署 | OpenHands、Cline、Continue | 数据隐私、低成本、可定制 |

> 本章是全景选型；两个上手方向的深度教程：[07 终端 Agent 实战](./07-cli-agents.md)、[08 AI IDE 实战](./08-ai-ide.md)。

## 3.2 终端 Agent（CLI）

### Claude Code（Anthropic）

- 定位：Agentic 编程命令行，代码质量公认第一梯队
- 特点：Plan 模式、subagents、hooks、MCP 生态、CLAUDE.md 规则文件
- 价格：Pro $20/月 起；重度使用有 Max 档（约 $100-200/月）；也可 API 按量计费

### Codex CLI / Codex 云端（OpenAI）

- 定位：开源 CLI + 云端任务双形态
- 特点：与 ChatGPT 订阅打通；云端可并行跑任务、直接产出 PR

### Gemini CLI / Antigravity CLI（Google）

- 现状（2026-06-18 起）：免费个人入口迁至 Antigravity CLI（`agy`，Go 编写、闭源）；Gemini CLI 本体仍在更新（v0.64，2026-10），服务付费 / API / 企业用户
- 特点：超长上下文、与 Google 生态集成；实战教程见 07 章

### Aider / OpenCode（开源）

- Aider：老牌 CLI，git 集成出色；2025-08 后无新版本（事实停滞），了解历史价值即可
- OpenCode：开源 Agent，模型可自由更换；当前 star 最高的终端 Agent（见 awesome-repos）

### 国产 CLI

- Qwen Code、Kimi Code 等与国产模型配套，价格低、国内访问稳定

## 3.3 AI IDE 与插件

### Cursor

- 定位：最流行的 AI IDE（基于 VS Code 分支）
- 特点：Tab 补全体验好、Agent 模式成熟、代码库索引
- 价格：Free 免费档；付费 Plus $8 / Premium $30 / Super $100 / Ultra $200（2026-10 官网口径；Plus 仅含 Grok，第三方模型从更高档位起按 API 原价计）
- 动态：2026-08 被 SpaceX 收购（公开报道），模型供应有变动，选型时留意

### GitHub Copilot

- 定位：生态最成熟的编程助手
- 特点：补全稳定、GitHub 深度集成、云端 coding agent
- 价格：Pro $10/月 起，学生认证免费
- 另有终端版 Copilot CLI（已开源：github/copilot-cli）

### 其他 IDE

- **Windsurf**：已更名 **Devin Desktop**（Cognition 旗下，与 Devin 同属一家）
- **Trae（字节）**：国内可用，有免费额度
- **Qoder（阿里）**：Agentic 编程平台，仓库级上下文理解
- **Antigravity（Google）**：Google 的 Agent IDE（闭源）
- **Kiro（AWS）**：以 spec 驱动工作流为特色（见 spec-coding 章节）
- **Zed**：高性能编辑器，内置开源 Agent

### 插件类

- **Cline / Kilo Code**：开源 Agent 插件，自带 API Key，灵活省钱（Roo Code 2026-05 已停运归档，官方推荐迁至 Kilo Code）
- **Continue**：可自托管、可接本地模型

## 3.4 云端 Agent

- **Devin（Cognition）**：最早的"AI 软件工程师"，擅长整任务委派；已降至 $20/月起
- **Google Jules**：异步编程 Agent，连接 GitHub 仓库，免费额度较大
- **Codex 云端 / Copilot coding agent**：在云端执行任务并提交 PR
- **适合场景**：把边界清晰的任务"扔出去"，自己同时做别的事
- **注意**：委派前把任务写清楚（这就是 spec 思维的价值），否则返工比自己做还慢

## 3.5 怎么选（决策清单）

1. 想保留现有编辑器 → 插件（Copilot / Cline）
2. 想要全面 AI 化体验 → AI IDE（Cursor / Trae / Qoder）
3. 喜欢终端与自动化 → CLI（Claude Code / Codex / Gemini CLI）
4. 想委派整任务 → 云端 Agent（Jules / Devin）
5. 预算敏感 → 开源工具 + 国产模型 API；用足免费档（Antigravity、Trae 等）
6. 数据隐私要求高 → 自托管方案或企业版

> 工具格局变化快（收购、改名、调价频繁），订阅前先玩免费档，别一次性买年付。
