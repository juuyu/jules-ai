# 01 · 官方 AI 编程资产：目录结构与文件说明

> 对照 `dsh-v0.2.1-alpha.5` 真实仓库。只讲 AI 协作资产；`packages/`、`python/`、`native/` 等产品代码不在本文范围。

## 1. 全景：AI 资产分布在四个位置

```text
deepseek-harness/
├── AGENTS.md                  # ① 指令层：根常驻规矩（18.7 KB，词数硬顶 2080）
├── CLAUDE.md                  #    符号链接 → AGENTS.md（mode 120000，目标串 "AGENTS.md"）
├── docs/
│   ├── AGENTS.md              #    文档子树规矩（层级表 / 词数预算 / slop 清单）
│   ├── architecture.md        #    架构地图（改 packages 前必读）
│   ├── testing.md             #    测试与证据政策
│   └── defensive-patterns/    #    评审强制执行的防御模式（按产物分页）
├── .agents/
│   ├── notes/                 # ② 决策层：3800+ 条 Agent Note（AI 写的 RFC）
│   └── skills/                # ③ 流程层：19 个技能
├── .claude/skills             #    符号链接 → ../.agents/skills（一份技能，多工具复用）
├── scripts/                   # ④ 门禁层：verify-* 脚本（verify-agent-note-format 等）
└── .github/
    ├── pull_request_template.md   # 人机协作接口：Motivation / Changes / Testing
    └── AGENTS.md                  # CI 子树规矩（PR 与 master 流水线分离等）
```

一句话：**指令层定规矩，决策层留理由，流程层固化操作，门禁层兜底；协作接口（PR 模板）同时写给人和 AI。**

## 2. 指令层：AGENTS.md 体系

### 2.1 根 AGENTS.md 的章节解剖

| 章节 | 给 AI 的作用 | 值得抄的写法 |
| --- | --- | --- |
| 开头定位 | 一句话说清项目是什么、改关键目录前先读哪个文档 | 「改 `packages/` 前读 architecture.md；写文档遵循 docs/AGENTS.md」 |
| Repository layout | 仓库地图：每个顶层目录一行注释 | AI 进门先建立空间感，不用瞎猜目录职责 |
| Commands | 全部常用命令 + **每条命令干什么** | 注释里写边界，如「CI coverage gate」「needs key」 |
| Host sandbox failures | 沙箱拦命令怎么办 | 允许带证据做最窄权限升级重试；**绝不绕过测试失败** |
| Run relevant checks locally | 提交前检查纪律 | 只跑覆盖本次改动的最小检查；不重复已通过的检查；只报告实际跑过的命令 |
| Secrets / .env | 密钥纪律 | 真实 API 测试读环境变量；**永不提交凭据** |
| Conventions | 约 30 条工程约定 | 每条 1~3 行、自包含、机械可查或可评审，细节链接到其「家」 |
| Defensive patterns | 指向 docs/defensive-patterns/ | 根文件不展开，只保留入口 |

Conventions 里最适合直接迁移的条目（原文摘译）：

- **注册即副作用**：一切贡献走扩展点，不许改主循环。
- **配置错误大声失败**：加载时就报错，绝不静默跳过缺失引用。
- **空 catch 必须点名错误和原因**，且 `try` 只包一条语句。
- **注释只讲本地契约**：不复述代码、不解释远处行为。
- **测试描述行为，不描述正确性**；行为过时就连测试一起改。
- **模型可见 ⟺ 可从日志重建**：任何送进模型的新输入都要落会话事件。
- 文件尾恰好一个换行，pre-commit 的 `git diff --cached --check` 把关。

### 2.2 分层就近生效（仓库里实际有 14 个生效中的子树文件）

| 子树 AGENTS.md | 只管什么 |
| --- | --- |
| `docs/AGENTS.md` | 文档层级归属、词数预算、slop 清单、一行一段 |
| `packages/AGENTS.md` | 包的编写规则（插件导出、公共面、异步生命周期） |
| `packages/client/`、`packages/web/`、`packages/experimental/`、`packages/schedule/` | 各包子树特有规则 |
| `scripts/AGENTS.md` | 门禁脚本自身的规范 |
| `benchmarks/AGENTS.md` | 性能门禁：禁用真实会话录制与用户材料 |
| `snapshots/AGENTS.md` | 录制回放测试纪律（快照目录另有 workspace 内的 AGENTS.md 用于测试嵌套加载） |
| `vendor/AGENTS.md` | vendored 代码不许随意改，偏离上游须穷尽记录 |
| `.github/AGENTS.md` | CI runner 策略 |
| `.agents/notes/` 及其下 `implemented/`、`archived/` | notes 的写作、同步、冻结规则 |
| `native/system/`、`website/`、`apps/cli/tests/profiles/` | 各自子树规则 |

规则：子树文件**只写根文件没有的、本子树特有**的规则；子树文件词数顶 600（`packages/` 810、`docs/` 1430）。

### 2.3 单一来源 + 符号链接转发

仓库中 `CLAUDE.md` 共 4 处，全部是指向同目录 `AGENTS.md` 的符号链接：根、`packages/`、`vendor/`、`.agents/notes/implemented/`；技能目录 `.claude/skills → ../.agents/skills`。只维护一份真实文件，各家 CLI 各取入口。

`.agents/skills/.gitignore` 内容只有一行 `*/agents/openai.yaml`——第三方工具给技能生成的元数据覆盖不入库。

### 2.4 词数预算：常驻上下文有天花板

`scripts/doc-budgets.manifest.json` 给常驻文档设硬顶，由 `verify-doc-budgets` 强制：根 AGENTS.md ≤ 2080、architecture.md ≤ 2400、子树 ≤ 600（例外见上）、testing.md ≤ 1300。超标处理顺序固定：**① 搬家（内容移到正确层级）→ ② 压缩 → ③ 才在 PR 说明理由上调**。逻辑：常驻文件每个会话都吃注意力。

## 3. 决策层：`.agents/notes/`（重点）

### 3.1 定位

`.agents/notes/AGENTS.md` 原文：*Agent Notes 实际上是由代理执笔的 RFC——持久化的提案与决策记录，保存理由、备选方案、后果和所需验证。* 解决「AI 会话无记忆 → 同一个决策被反复拍板、反复推翻」。

### 3.2 目录结构（路径即状态）

```text
.agents/notes/
├── README.md            # 规则本体（中英双语 + i18n yaml 三件套）
├── proposed/            # 提案：未实施或仅部分实施（约 126 条活跃文件）
│   └── <class>/yyyy-mm-dd-topic.md
├── implemented/         # 已实施：现在时描述 shipped 现实
│   └── <class>/yyyy-mm-dd-topic.md     # 六类计数：architecture 531 / feature 117
│                                       # process 102 / testing 54 / simplification 39 / bug-fix 33
├── rejected/            # 已否决：结论写在 Status 行，文件冻结
└── archived/            # 归档：永久冻结，哈希封印，只能被引用不能当现状权威
```

- **生命周期**（第一层）= 状态，随进展在文件夹间**移动**，同时改文件内 `Status:` 行。
- **分类**（第二层）是封闭集合，6 类：

  | 类别 | 范围 |
  | --- | --- |
  | `feature` | 面向用户或模型的新能力 |
  | `bug-fix` | 修缺陷、补复盘缺口 |
  | `simplification` | 不加能力地删代码/行为/对外范围 |
  | `architecture` | 交付**源码**的结构决策（包关系、运行时词汇） |
  | `process` | 代码**外围**的工具/策略/工作流 |
  | `testing` | 测试基础设施与策略 |

  （有意排除 `refactor`：与 simplification 的判别标准「可观察行为是否改变」重叠。）
- **文件名日期** = 首次提出日期；note 间互链一律用相对 Markdown 链接，**禁止 INDEX.md**（路径本身就是元数据，集中索引造成无关改动争用同一文件）。
- 每条 note 是英/中/配对记录三件套（`.md` / `.zh.md` / `.i18n.yaml`）；个人项目可只用单语。

### 3.3 文件格式（门禁逐字段校验）

头部三行固定：

```markdown
# Agent Note: <标题>
Status: <proposed | implemented | rejected — 一行原因>
```

正文按生命周期用不同骨架，章节名是封闭集合：

```markdown
# proposed/                          # implemented/
## Problem                           ## Problem
## Proposal                          ## Decision          ← 现在时写 shipped 现实
…按需技术节…                          …按需技术节…
## Alternatives considered  ← 必填    ## Alternatives considered  ← 必填
## Acceptance criteria               ## Consequences       ← 代价与收益都写
## Risks
```

四条容易被忽略的硬规则：

1. **Alternatives 是记录的，不是发明的**——没真实考虑过的方案不许事后补编；记录决策却不记录它击败了什么，等于邀请反复争论。
2. **implemented 只同步事实，不反转决策**——代码移动/改名/改默认值时，同一提交就地更新 note 里的路径与名称；但决策反转必须新开 note 并交叉链接。
3. **每写新 note 必触发取代检查**——搜同类旧 note，完全取代的同 PR 归档，部分取代的交叉链接。
4. **归档即冻结**——只允许加一行 `Archived: 日期`、重录哈希、修入站链接；之后永久不许编辑/翻译/重排。

何时豁免：机械改动、局部 UI 调整不需要 note；已有 owner note 就更新它，不新建重复。

### 3.4 真实示例（implemented，最短的一类）

`implemented/process/2026-09-14-generated-cli-help-reference.md`：Problem 讲「手工维护的命令参考会漏子命令、留过时默认值」；Decision 现在时写生成机制（抓取各 profile help、递归发现子命令、校验器名）；Alternatives 一条（自建命令清单会重复解析器定义）；Consequences 写收益（命令变更经同一生成器更新）。全文约 40 行。

## 4. 流程层：`.agents/skills/`（19 个技能）

### 4.1 目录解剖

```text
.agents/skills/<skill-name>/
├── SKILL.md          # 必备：YAML frontmatter + 正文
├── references/       # 可选：细节参考（渐进披露，如 dsh-ci-test-reliability/references/）
├── templates/        # 可选：模板（dsh-doc 带 8 个文档模板，kind 与模板一一对应）
└── scripts/          # 可选：可执行脚本（record-browser-gif 带 GIF 编码脚本）
```

frontmatter 极简，19 个技能里 18 个只有两个字段：

```yaml
---
name: kebab-case-与目录名一致
description: 写「何时触发 + 做什么」——AI 靠这句话决定要不要加载本技能
---
```

唯一例外 `dsh-translate-docs` 额外设 `disable-model-invocation: true` + `user-invocable: true`：重型流程只准人工点名，模型不许自动触发。

### 4.2 19 个技能清单（按用途分组）

| 组 | 技能 | 触发时机 |
| --- | --- | --- |
| 流程门禁 | `dsh-pre-push-checks` | 推送/标 ready/声称检查通过前：按外发 diff 选最小证据 |
| | `dsh-ci-test-reliability` | 设计、诊断 flaky 测试时（含六种掩盖式修复黑名单） |
| | `dsh-merging-stacked-prs` | 合并堆叠 PR 链 |
| 评审 | `dsh-code-review` | 评审 PR：先读要求再读 diff |
| | `cordis-styling-nitpicking` | 评审插件生命周期（3 条 P0 规则） |
| 文档 | `dsh-doc` | 写/重构/审文档：8 步流程 +「跑一遍再写」事实核查 |
| | `dsh-prose-standard` | 写注释/文档/提示词/可见文案时的契约标准 |
| | `dsh-trim-cot-leakage` | 清理「思维链外泄」式文案（the one test 判据） |
| | `dsh-create-upgrade-guide` | 引入破坏性改动的当次变更里写迁移指南 |
| | `dsh-translate-docs` | （仅人工触发）双语文档翻译 |
| 维护 | `dsh-archive-agent-notes` | note 取代检查与归档 |
| | `dsh-find-simplifications` | 找可删除的维护义务（拒绝「搬家式简化」） |
| 领域规范 | `dsh-error-handling` | 设计/评审失败路径 |
| | `dsh-client-ui-ux` / `dsh-responsive-ui` | GUI 设计与评审 / 响应式 |
| | `dsh-speed-up-perf` | 性能任务（先测量，附 measurement card） |
| | `dsh-official-plugin-artwork` | 官方插件图标规范 |
| 元技能 | `agent-experience` | 写给模型看的一切：最小上下文、显式发现、测量首轮 token |
| 工具 | `record-browser-gif` | GUI 行为 PR 录 GIF |

### 4.3 技能正文的七个共同写法

1. 开篇自我定位：**「指导，不是检查清单」**——防模型机械打勾。
2. description 写触发条件，正文再写「何时不用」与排除项。
3. 第 0 步是**先读真源**（先打开权威文件，再判断 diff），从流程上掐死「凭记忆办事」。
4. 末尾点名确切的门禁命令，技能与 `verify-*` 脚本互锁。
5. 高风险场景给**黑名单**（如 flaky 测试禁加超时/重试/全串行/吞错/弱断言/sleep）。
6. 固定报告格式：实际跑过的命令、边界、未验证项；不许夸大。
7. 渐进披露：正文只留入口，细节放 `references/`，不搞深层引用链。

## 5. 文档标准：`docs/AGENTS.md`（与 AI 写作直接相关的部分）

**一个事实一个家**（one home per fact）：每层文档职责固定，跨层只许链接不许转述——

| 层 | 只放什么 |
| --- | --- |
| 根 AGENTS.md | 每会话都要的常驻命令，1~3 行/条 + 链接 |
| 架构文档 | 有序的概念地图 |
| Agent Notes | 决策的为什么、放弃了什么、所需验证 |
| cookbook | 编号步骤、每步可验证的 how-to |
| 包 README | 该包自己的契约 |
| Skills | 可复用工作流与专门判据 |

**slop 清单（8 类文案垃圾，dsh-doc 现场当审计表用）**：① 重复规则 ② 历史错位 ③ 状态标注（「已实现！」）④ 手工复述生成目录 ⑤ 推理实录 ⑥ 理由散落 ⑦ 段落墙 ⑧ 强调膨胀。

**CoT 泄漏总判据**（dsh-trim-cot-leakage）：一个只有 HEAD 代码、没有会话记录的读者，能否解开文中每个引用、核验每个断言？不能就改写成仓库视角能独立成立的句子。

## 6. 人机协作接口：`.github/pull_request_template.md`

官方模板只有三段（注释直接用中文写，模板同时服务人和 AI）：

```markdown
## Motivation      一句话问题 + Fixes/Related #NN（必须关联 issue）
## Changes         两类变化各一行：命令/配置/API 变化；可观察行为变化。没有写 None
## Testing         每种测试方法一个条目；可复核证据放进折叠的 Proof 区
```

两个反模糊设计：**「没有则写 None」**（不留空、不含糊）与 **Proof 必须可复核**（输出/截图/日志）。

## 7. 最小迁移建议

不要一次搬全套。DSH 自己的演进顺序也是「规矩 → 决策 → 流程 → 门禁」：

1. **今天**：根 AGENTS.md + CLAUDE.md 转发 + PR 模板。
2. **半天**：`.agents/notes/implemented/` 单目录 + 2~3 个技能（提交检查、评审、文档）。
3. **项目长大**：补 proposed 两态、词数预算、门禁脚本、归档流程。

门槛从来不在文件数量，而在两条纪律：**规则要么机器能查、要么人能判，不写空话；决策进 notes、流程进 skills，不只留在会话里。**
