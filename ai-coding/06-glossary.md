# 06 常用术语表

> 本章解决：读 AI 编程文档、文章和仓库时反复出现的高频词汇——Skill、Agent、MCP 等，一页速查。生态现状信息截至 2026-10-15；这个领域变化快，重要决策前以官方文档为准。

## 6.1 模型基础

**LLM（大语言模型，Large Language Model）**
预测下一个 token 的神经网络，是所有 AI 编程工具的能力底座。三个必须记住的特性：输出是概率性的、知识有截止日期、只生成不执行——"思考"与"动手"之间隔着工具层。详见 [01 基础认知](./01-fundamentals.md)。

**Token（词元）**
模型处理文本的最小单位，大约 0.5–1 个英文单词或 1 个汉字上下。计费和上下文长度都以它为单位。

**Context Window（上下文窗口）**
模型单次能"看到"的 token 上限（2026 年主流模型已达数十万到百万级）。窗口越满，模型对中间内容的注意力越差——所以上下文不是越多越好。

**Prompt / System Prompt（提示词 / 系统提示词）**
给模型的指令。System Prompt 是工具预先注入的角色与规则（用户通常看不到），User Prompt 是你在对话里输入的内容。

**Temperature（温度）**
采样随机性参数。编程场景通常用低值，让输出更确定。

**Reasoning Model（推理模型）/ Extended Thinking（扩展思考）**
回答前先生成一段思考过程再给结论的模型类别。各家叫法不同：Anthropic 叫 extended thinking，OpenAI 叫 reasoning，Google 叫 thinking。适合复杂规划与难题调试；简单任务用它又慢又贵。

**Hallucination（幻觉）**
模型一本正经地编造不存在的 API、依赖或事实。缓解方式：让它先查证（读文档、跑代码）再下结论；对它的"确定"保持默认怀疑。

**Multimodal（多模态）**
能同时处理文本、图片、音频、视频的模型。编程场景常见用法：贴设计截图让它写 UI、贴报错截图排查问题。

**RAG（检索增强生成，Retrieval-Augmented Generation）**
先检索相关资料、再让模型基于资料回答的范式。2026 现状：企业知识问答仍是标配；但编程 Agent 更多转向 Agentic Search（代理式检索）——让 Agent 自己 grep、读文件、按需取上下文，而不是预先建向量库。

**Fine-tuning（微调）**
用自有数据继续训练模型、把能力"焊"进权重里。个人 AI 编程场景基本用不上：提示词、上下文工程、规则文件、RAG 能解决绝大多数问题，且无需训练。

## 6.2 提示与上下文工程

**Prompt Engineering（提示工程）**
把话说清楚让模型做对事：明确目标、给示例、规定输出格式。模型越强，"话术"越不重要，结构化表达越重要。

**Context Engineering（上下文工程）**
比提示工程更大的范畴：管理模型在整条任务轨迹中"看到的一切"——系统提示、工具定义、历史消息、检索内容、文件片段。2026 年已是 Agent 开发的标准实践（Anthropic 2025 年 9 月的官方文章是共识起点）。核心动作：压缩、结构化记忆、子代理隔离。详见 [02 核心技能](./02-core-skills.md)。

**Context Compaction（上下文压缩）**
上下文快满时，让模型把历史总结成要点后继续（如 Claude Code 的 `/compact`）。长任务不中断的关键机制。

**Memory（记忆）**
跨会话保留信息的能力，分三层：会话内（对话历史）→ 项目级（规则文件、文档）→ 跨项目（个人知识库）。工程上推荐"文档式记忆"（写成文件进 git），而非黑盒记忆插件。详见 [05 进阶方向](./05-advanced.md)。

## 6.3 Agent 体系

**Agent（智能体）**
"模型 + 循环 + 工具"：模型观察状态、决定下一步动作（调工具或输出），结果回灌，循环直到任务完成。判断标准只有一条：它能不能自己决定下一步做什么。

**Agentic（代理式的）**
形容词，指具备自主多步执行能力的。如 agentic coding = 让 Agent 自己规划、改代码、跑测试、看结果再修，而不是只做单轮问答。

**Agent Loop（代理循环）**
Agent 的工作循环：观察 → 决策 → 行动 → 再观察……直到达成目标或触及步数上限。写 Agent 的核心之一就是设计好这个循环的出口。

**Tool Use / Function Calling（工具调用）**
模型输出结构化请求来调用外部函数（读写文件、执行命令、查数据库），由宿主程序执行后回传结果。相当于 Agent 的"手"；工具描述怎么写，直接决定调用质量。

**Subagent（子代理）**
主 Agent 派生的专职小 Agent，跑在独立上下文里，只把摘要带回主线程。三大用途：隔离上下文（不污染主任务）、并行探索、专职审查（如安全审查子代理）。Claude Code、Codex 均已内置。

**Multi-Agent / Orchestration（多智能体 / 编排）**
多个 Agent 分工协作，主流是"编排者–工作者"模式：一个主管拆任务、多个子代理执行。2026 现实：子代理这一层最实用；"Agent 蜂群"多为概念炒作。详见 [04 工作流实践](./04-workflow.md)。

**Harness（运行时框架）**
2026 年最热的词之一：围绕模型的整套运行时脚手架——循环、工具、上下文管理、权限、沙箱、记忆。一句话："模型负责推理，harness 负责做事。"同一个模型换不同 harness，编程得分可能差一大截，所以开源 harness 成了 2026 年的竞争焦点。

**Sandbox（沙箱）**
给 Agent 圈定的隔离执行环境：容器、microVM、受限文件系统与网络白名单。运行自动生成的代码和命令时，沙箱是保命底线。

**Permission Mode（权限模式）**
Agent 执行动作前需要人工批准的程度，常见三档：计划模式（只读不动）、自动接受编辑（改文件不打扰）、全放行（俗称 YOLO 模式，如 `--dangerously-skip-permissions`）——最后一档只应在沙箱里使用。

**Plan Mode（计划模式）**
先让 Agent 只读探索、产出计划，人批准后才动手改代码。把"想"和"做"分开，是防止大范围乱改的最实用机制。

**Human-in-the-loop（人在回路）**
在关键节点保留人工确认：审查计划、批准危险命令、验收结果。spec 驱动开发本质上就是系统化的 human-in-the-loop。

**Guardrails（护栏）**
限制 Agent 行为边界的机制：命令黑名单、路径白名单、网络出口限制、输出过滤。防的不是模型"变坏"，而是它"好心办坏事"。

**Prompt Injection（提示词注入）**
把恶意指令藏在 Agent 会读到的内容里（网页、issue、README、依赖文档），诱使它执行不该做的操作。这是给 Agent 开放外部输入和工具权限后的主要安全风险，缓解靠权限控制、沙箱与人工确认。

**Computer Use / Browser Agent（计算机操作 / 浏览器代理）**
让模型直接操作 GUI 或浏览器（截屏 → 点击 → 输入）的能力类别。2026 现状：已从演示走向实用——Anthropic 的 computer use 已 GA 并内置浏览器能力，常用于端到端测试与网页任务自动化。

## 6.4 扩展能力与协议

**Skill（技能，Agent Skills）**
Anthropic 2025 年 10 月推出的能力封装格式：一个文件夹 + `SKILL.md`（含 name、description 元信息）+ 可选脚本与资源，按"渐进式披露"原则只在需要时加载完整内容，节省上下文。2026 现状：已成为跨工具事实标准——Claude Code、GitHub Copilot、OpenAI Codex、Cursor、Qoder 等均支持，社区有 skills.sh 等注册中心（兼容 20+ 工具）。个人用法：把团队规范、部署流程、专属检查封装成 Skill 复用。详见 [05 进阶方向](./05-advanced.md)。

**MCP（模型上下文协议，Model Context Protocol）**
统一"AI 应用 ↔ 外部工具 / 数据"接口的开放协议，类比 AI 世界的 USB-C：一次实现，各处可用。最新规范为 2026 年 7 月修订：核心转向无状态架构（部署更简单、易扩容），新增扩展机制与 MCP Apps（带交互 UI 的服务端应用）。治理上已归入 Linux 基金会下的 Agentic AI Foundation（与 AGENTS.md、A2A 等同体系）。详见 [05 进阶方向](./05-advanced.md)。

**ACP（Agent Client Protocol）**
Zed 提出的 JSON-RPC 标准，让"任意 Agent 接入任意编辑器"：编辑器实现一次 ACP 即可支持多家 Agent，对抗厂商锁定。2026 现状：JetBrains 2026.1 起集成，OpenCode、Kimi CLI 等已跟进。与 MCP 的分工：MCP 连工具，ACP 连宿主。

**AGENTS.md / Rules File（规则文件）**
写在仓库里的"给 AI 的说明书"：技术栈、约定、禁忌。AGENTS.md（2025 年 8 月由 OpenAI 随 Codex 发布）已是跨工具事实标准——Codex、Cursor、Copilot、Jules 等都读，Claude Code 2026 年 9 月起也已支持，官网自称 6 万+ 项目在使用。同类还有 CLAUDE.md、.cursor/rules、copilot-instructions.md。详见 [02 核心技能](./02-core-skills.md)。

**Slash Command（斜杠命令）**
对话里以 `/` 开头的指令，触发预定义流程（如 `/init`、`/review`、`/compact`）。Claude Code 的自定义斜杠命令已并入 Skill 体系。

**Hook（钩子）**
挂在 Agent 生命周期事件上的命令回调：保存后自动格式化、提交前跑 lint、危险操作前拦截。Claude Code 2025 年已支持，Codex CLI 2026 年跟进。与规则文件的区别：规则是"建议"，Hook 是"强制"。

## 6.5 开发范式

**Vibe Coding（氛围编程）**
Karpathy 2025 年 2 月提出的说法：不看代码、凭感觉让 AI 写，能跑就行（Collins 2025 年度词汇）。它准确描述了"快速捣鼓原型"的用法，也成了"不可维护代码"的代名词。2026 现状：原型阶段仍常见，生产环境已被更严谨的实践取代。

**Agentic Engineering（代理式工程）**
2026 年上升中的说法：以"指挥 Agent"为核心的工程实践——管理上下文、审查产出、设计验证回路。相当于职业化的 vibe coding：同样依赖 AI 写代码，但测试、审查、规范一个不少。

**Spec-Driven Development（规范驱动开发，SDD）**
先写清"做什么、为什么"（spec），再让 AI 做"怎么做"与实现，与 vibe coding 相对的另一端。完整方法见 [spec-coding 章节](../spec-coding/README.md)。

**Eval（评测）**
用标准题库衡量模型 / Agent 的能力。编程领域常被引用的榜单：SWE-bench Verified（已趋饱和）、SWE-bench Pro、Terminal-Bench。读分注意两点：分数受 harness 影响很大；刷榜成绩与日常体验有差距。

---

> 术语现状会漂移：每隔几个月就有旧词退场、新词出现（如 2026 年的 harness、agentic engineering）。本表随 [awesome-repos](../awesome-repos/README.md) 的 Star 数据一起定期校准。
