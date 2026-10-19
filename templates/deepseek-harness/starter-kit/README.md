# DeepSeek Harness AI 编程实践包（简化可复用版）

> 来源：DeepSeek 官方仓库 `deepseek-ai/deepseek-harness` tag `dsh-v0.2.1-alpha.5`，全部内容对照该 tag 真实文件整理（核对日期 2026-10-19）。
> 只讲 **AI 怎么参与编程**：指令、决策、技能、证据纪律——不涉及 DSH 的产品代码。

## 这套文档是什么

DSH 把「让 AI 持续参与开发」拆成四层，缺一不可：

```text
指令层 AGENTS.md     定规矩：每个会话必读，分层就近生效
决策层 .agents/notes 留理由：AI 写的 RFC，保存「为什么」和「放弃了什么」
流程层 .agents/skills 固化操作：重复出现的流程写成按需加载的技能
证据层 命令 + 门禁    兜底：声称完成必须附上实际跑过的命令与可复核输出
```

## 三份文档（按顺序读）

| 文档 | 回答什么 | 什么时候看 |
| --- | --- | --- |
| [01-official-structure.md](./01-official-structure.md) | 官方的 AI 目录长什么样、每个文件管什么 | 想理解整套设计时 |
| [02-practice-workflow.md](./02-practice-workflow.md) | 实际开发时一步一步怎么做 | 每次接任务前扫一遍 |
| [03-ai-prompts.md](./03-ai-prompts.md) | 如何用提示词让 AI 生成这些文档 | 初始化项目、写 note、做评审时 |

## 模板目录（拷贝即用）

[`templates/`](./templates/) 按目标项目的真实摆放结构组织，可以直接整体拷贝：

```sh
cp -R templates/. 你的项目根目录/
```

```text
templates/                               # 目录结构与目标项目完全一致，拷贝即到位
├── AGENTS.md                            # 根常驻指令（先改成你的项目信息）
├── .agents/
│   ├── notes/
│   │   ├── README.md                    # notes 规则（一页纸）
│   │   ├── note-proposed.md             # 提案模板
│   │   └── note-implemented.md          # 已实施决策模板
│   └── skills/
│       ├── pre-push-checks/SKILL.md     # 推送前最小检查
│       └── code-review/SKILL.md         # 先读要求再读 diff 的评审
└── .github/
    └── pull_request_template.md         # Motivation / Changes / Testing 三段式
```

## 5 分钟快速开始

1. 拷 `templates/AGENTS.md` 到项目根，填掉尖括号占位符；用 Claude Code 就 `ln -s AGENTS.md CLAUDE.md`。
2. 首次写决策时建 `.agents/notes/implemented/`，约定一句话：**非平凡决策在同一提交里附一条 note**。
3. 拷 PR 模板到 `.github/`。其余的（proposed、skills、预算）等项目长大再加。

## 想深入了解原理

同目录上两级的两份长文是完整分析，本包是它们的操作版精简：

- 机制原理与「为什么有效」→ [../ai-practices.md](../ai-practices.md)
- 含双语配对、CI、审批自动化等完整设施 → [../ai-setup-template.md](../ai-setup-template.md)
