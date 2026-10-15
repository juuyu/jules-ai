# 02 方法论与框架

> 本章解决：主流 Spec 驱动框架有哪些？各自工作流长什么样？怎么选？

## 2.1 地图：四种流派

| 流派 | 代表 | 形态 | 适合 |
| --- | --- | --- | --- |
| 工作流命令集 | GitHub Spec Kit | 命令行 + 斜杠命令 | 已有 AI 工具，想要结构化流程 |
| 一体化 IDE | AWS Kiro | 独立 IDE | 想开箱即用，接受新 IDE |
| 多角色方法论 | BMAD-METHOD | 角色化 Agent 体系 | 大型项目、团队协作 |
| 轻量规范 | OpenSpec | CLI + 目录约定 | 渐进引入，不加重负担 |

## 2.2 GitHub Spec Kit

仓库：[github/spec-kit](https://github.com/github/spec-kit)（逐步操作见 [05 使用指南](./05-speckit-guide.md)）

背景：GitHub 官方开源项目，把"spec 驱动"固化成一组可运行在现有 AI 工具内的 Agent 技能（斜杠命令）。

工作流（斜杠命令，按序执行）：

- `/speckit-constitution`：定项目"宪法"——长期约束与原则（每项目一次）
- `/speckit-specify`：产出需求 spec（只谈 What / Why，不含技术细节）
- `/speckit-plan`：产出技术方案（How、选型、数据模型、接口）
- `/speckit-tasks`：拆解为可执行的任务清单
- `/speckit-implement`：按任务逐条实现
- `/speckit-converge`：对照 spec 评估完成度，循环 implement ⇄ converge 直到收敛

另有可选质检命令：`/speckit-clarify`（歧义澄清）、`/speckit-checklist`（质量清单）、`/speckit-analyze`（spec ↔ plan ↔ tasks 一致性检查）。

特点：

- **工具无关**：Claude Code、GitHub Copilot、Cursor、Gemini CLI 等都可接入
- 产物是 markdown 落盘（模板 + specs/ 目录），可随代码进 git
- 通过 `specify` CLI 初始化（`uv tool install specify-cli`），模板可自定义
- 除 SDD 主线外，还有 Bug 修复、想法评估两条扩展流程

## 2.3 AWS Kiro

仓库：[kirodotdev/kiro](https://github.com/kirodotdev/kiro)（IDE 本体闭源，此为其公开仓库）

背景：AWS 推出的 agentic IDE，把 spec 工作流做成产品内置体验。

三件套（每个功能一个目录）：

- `requirements.md`：用户故事 + 验收标准（EARS 句式，天然可测试）
- `design.md`：架构、数据流、接口设计
- `tasks.md`：带依赖关系的离散任务清单

配套机制：

- **Steering**：项目级规则文件（类似 AGENTS.md），可按产品 / 技术 / 结构分多份
- **Agent Hooks**：文件事件触发的自动化（如保存时同步更新测试）
- 支持 MCP 与多模型选择

特点：规格 → 任务 → 实现全程有 UI 承载，适合不想手动管理流程的人；代价是绑定该 IDE。

## 2.4 BMAD-METHOD

仓库：[bmad-code-org/BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD)

背景：开源社区方法论（Breakthrough Method of Agile AI-Driven Development），用一组角色化 Agent 覆盖完整敏捷流程。

角色体系（部分）：

- Analyst（需求分析）→ PM（产品需求）→ Architect（技术架构）
- Scrum Master（故事拆分）→ Dev（实现）→ QA（质量评审）

特点：

- 大规模场景优势明显：团队协作、长周期项目
- 流程重、仪式感强，小项目会觉得繁琐
- 通过 workflows / agents 扩展机制定制

## 2.5 OpenSpec

仓库：[Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec)

背景：轻量级 spec 工作流 CLI，面向"想引入规范但不想大动干戈"的个人与团队。

工作流：

- `openspec init`：在仓库建立规范目录结构
- 每个变更走：proposal → tasks → implement → archive
- 与 Claude Code / Cursor 等配合，通过生成的指令文件驱动

特点：上手成本最低，适合逐步培养 spec 习惯。

## 2.6 对比与选型

| 维度 | Spec Kit | Kiro | BMAD | OpenSpec |
| --- | --- | --- | --- | --- |
| 形态 | 命令集 | 一体化 IDE | 方法论 + 提示集 | CLI |
| 上手成本 | 中 | 低 | 高 | 低 |
| 流程强度 | 中 | 中 | 强 | 轻 |
| 工具绑定 | 无 | 绑定 Kiro | 无 | 无 |
| 适合 | 通用推荐 | 完整体验 | 团队 / 大项目 | 渐进引入 |

选型建议：

- 个人尝鲜：Kiro（体验完整流程）或 OpenSpec（轻量起步）
- 已在用 Claude Code / Copilot：Spec Kit
- 团队落地：先用 OpenSpec / Spec Kit 跑通，再按需上 BMAD
- 共同点：都落实"需求 → 方案 → 任务 → 实现"四段式；不用框架也能手动执行（见 03 / 04 章）
- 了解向：Tessl（闭源商业公司，Spec-as-Source + Spec Registry，官网 [tessl.io](https://tessl.io)）与 Spec Kit、Kiro 并称 SDD 三大代表

## 2.7 趋势观察

- **概念收敛**：各家都在"spec 先行 + 任务拆解 + 逐任务实现"上对齐
- **标准融合**：AGENTS.md（[openai/agents.md](https://github.com/openai/agents.md)）等约束文件成为跨工具共识
- **Skills 生态兴起**：[anthropics/skills](https://github.com/anthropics/skills) 与 [obra/superpowers](https://github.com/obra/superpowers) 等把方法论封装为可复用技能包，与 spec 体系互补
- **从工具到流程**：真正的差异在"怎么用"，而不是"用哪个"
