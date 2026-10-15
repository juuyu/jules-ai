# Spec 方法论与提示词工程

> 数据截至 2026-10-15（GitHub API 实时获取，约数）· 收录格式：仓库 | Star | 一句话 | 备注

## Spec 驱动开发工具

| 仓库 | Star | 简介 | 备注 |
| --- | --- | --- | --- |
| [github/spec-kit](https://github.com/github/spec-kit) | 141k | GitHub 官方 SDD 工具链（specify CLI） | 极活跃；SDD 标杆 |
| [Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec) | 72k | 轻量规范驱动开发工作流 | 极活跃 |
| [bmad-code-org/BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) | 54k | BMAD 敏捷 AI 开发方法论 | 活跃 |
| [openai/agents.md](https://github.com/openai/agents.md) | 25k | AGENTS.md 标准（"给 Agent 的 README"） | 已被 Codex / Cursor 等采纳 |
| [kirodotdev/kiro](https://github.com/kirodotdev/kiro) | 4.4k | AWS Kiro（spec 驱动 IDE）公开仓 | 产品闭源；requirements / design / tasks 三件套 |

注：[Tessl](https://tessl.io)（Spec-as-Source、Spec Registry）为闭源商业公司，与 spec-kit、Kiro 并称 SDD 三大代表，可作了解。

## Agent Skills 与规则生态（2026 新叙事）

| 仓库 | Star | 简介 | 备注 |
| --- | --- | --- | --- |
| [obra/superpowers](https://github.com/obra/superpowers) | 300k | Agent Skills 框架 + 软件开发方法论 | 2026 爆款；Claude Code 生态 |
| [anthropics/skills](https://github.com/anthropics/skills) | 181k | Agent Skills 官方规范与技能集 | 被 Claude Code / Codex / Gemini CLI 等兼容 |
| [PatrickJS/awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules) | 41k | Cursor 规则大全 | 更新放缓（2026-05 后） |

## 任务管理与提示词工程

| 仓库 | Star | 简介 | 备注 |
| --- | --- | --- | --- |
| [x1xhlol/system-prompts-and-models-of-ai-tools](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools) | 144k | 各 AI 工具的系统提示词合集 | 活跃；学提示词写法的最佳素材 |
| [dair-ai/Prompt-Engineering-Guide](https://github.com/dair-ai/Prompt-Engineering-Guide) | 79k | 经典提示词工程指南 | 更新放缓（2026-03 后） |
| [eyaltoledano/claude-task-master](https://github.com/eyaltoledano/claude-task-master) | 28k | AI 编程任务管理与拆解 | 更新放缓（2026-04 后） |

## 学习路径建议

1. 先读 spec-kit 的 README 与模板（了解完整 SDD 流程）
2. 本地跑一遍 OpenSpec 或 spec-kit（建立肌肉记忆）
3. 想深入学习提示词写法 → 翻 system-prompts 合集，对照自己常用工具的规则文件
4. Skills 生态代表"可复用的方法论封装"，与 spec 互补，值得持续关注
