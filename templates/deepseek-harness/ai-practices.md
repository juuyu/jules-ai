# deepseek-harness 的 AI 编程实践：机制、原理与借鉴

> 本文分析 deepseek-harness（DeepSeek 官方开源的 agent harness）**如何使用 AI 参与开发**——不看它的产品代码，只看它的 AI 使用规则、协作机制与工程纪律。所有内容对照仓库 `dsh-v0.2.1-alpha.5` tag 下的真实文件整理（信息截至 2026-10-17）。逐件配置模板见同目录 [ai-setup-template.md](./ai-setup-template.md)；本文回答「它为什么这么做、实际怎么运转、新项目可以抄什么」。

## 0. 背景：为什么这家仓库值得研究

deepseek-harness（下称 DSH）是一个 TypeScript monorepo（60+ 个包），它把「让 AI 代理大规模、持续地参与开发」当成一等工程问题来解决。证据俯拾皆是：

- 决策日志系统的原文定位：*Agent Notes 是「由代理执笔的 RFC」*（`.agents/notes/AGENTS.md`）；
- 19 个技能（`.agents/skills/`）覆盖提交、评审、文档、清理全流程，多个技能开篇自定位为「这是指导，不是检查清单 / 脚本」；
- PR 模板的填写指令直接写成中文——模板同时服务人与 AI；
- CONTRIBUTING 明确**当前不接受外部 PR**（社区走 Discussions 和 `dsh-plugin` 插件生态）——意味着整套流程是为「内部团队 + 大量 AI 代理」设计的信任体系。

用一句话概括它的方法论：**指令层（AGENTS.md）定规矩，决策层（notes）留理由，流程层（skills）固化操作，机械门禁（scripts）兜底**。四层互相咬合，任何一环都能从其它三环找到出处。

---

## 1. 设计哲学：读懂它所有规则的钥匙

### 1.1 五条底层习惯（docs/defensive-patterns/README.md 原文归纳）

| 习惯 | 原文含义 | 对 AI 协作的意义 |
| --- | --- | --- |
| **让正确性显式** | 把正确性写进结构（命名调用点、显式生命周期、显式条件与类型），而不是事后靠时序补偿 | AI 不需要「心领神会」，结构本身就是说明书 |
| **单一事实来源** | 一份数据一条读路径、一个事实一个家、共享状态有唯一所有者 | AI 最擅长复制粘贴，「唯一」是对抗扩散的前提 |
| **经由注册的接缝扩展** | 新能力走注册扩展点；旧载体不许再长新分支 | AI 的局部视野天然爱改最近的代码，接缝纪律防止扩散 |
| **改动面 = 评审面** | 一次改动只携带其声明的行为变化所需的行；迁移是搬代码而不是重写 | 让 AI 的 diff 可被人类审得动 |
| **要求证据** | 断言必须可证伪、可复算（前后测量或门禁检验），不靠手同步 | 评审判据不依赖「代理的自我报告」 |

### 1.2 最值得学的机制：规则文本 ↔ 门禁实现成对出现

DSH 的 AGENTS.md 与技能里，几乎每条机械可查的规则都**直接点名执行它的脚本**，例如：

- 「Raw/Web 的 `cordis.yml` 插件必须出现在依赖清单里；`verify-cordis-config` 强制它」；
- 「本文件（根 AGENTS.md）≤ 2080 词；超标由 `pnpm run verify-doc-budgets` 拒绝」；
- 「客户端 UI 文案由 locale 字典拥有；`verify-client-ui-i18n` 拒绝硬编码文案」；
- 「禁用一词（prove+nance 拼接的十字母词）覆盖文件名、标识符与散文；`verify-concrete-terms` 逐字扫描」。

**效果**：规则不会沦为口号——要么机器在每次提交时把关，要么评审有明确的正反例判据。对 AI 代理尤其关键：AI 擅长遵守「有反馈的规则」，不擅长遵守「口头精神」。

### 1.3 一个事实，一个家（one home per fact）

文档标准给每个层级规定了唯一职责（指令 / 架构 / 决策理由 / 操作指南 / 包 README / 生成参考），跨层只许链接，不许转述。配套的反面教材是所谓的 slop 清单（见 §6.2）。这条纪律是「上下文预算」与「防腐坏」的共同基础：同一个事实只存一处，AI 读一处即准，改一处即全。

---

## 2. 指令层：AGENTS.md 体系怎么被 AI 用

配置模板见 [ai-setup-template.md](./ai-setup-template.md) §1–3，这里只讲做法与原理：

**分层就近生效**。根文件是「每个会话都要的常驻命令」（布局、命令、全局约定）；15+ 个子树文件（`packages/`、`docs/`、`benchmarks/`、`vendor/`、`packages/client/`……）只写该子树特有规则，且不许重复根文件已有内容——代理读到哪个目录，就自然叠加该层约束。

**常驻文件有词数天花板**。根 `AGENTS.md` 上限 2080 词、子树 600 词（由 manifest + 校验脚本强制）。逻辑很直白：**常驻上下文每多一行，留给任务的注意力就少一分**。超出时的处理顺序是「搬家 → 压缩 → 才谈上调」。

**单一来源、多工具转发**。真实文件只有 `AGENTS.md`，`CLAUDE.md` 在各目录都是指向它的符号链接（git mode 120000）；`.claude/skills` 同理转发到 `.agents/skills`。根文件为此专门写了「Editing these instructions」一节，防止代理误改链接文件。

**命令一节写给代理看**。命令清单不只列命令，还写「什么时候**不要**跑」：提交前只跑覆盖改动的最小检查、不重复已通过的检查、CI 拥有穷尽性；报告时**只报告实际跑过的命令**。另有沙箱失败规则：因沙箱受限失败的命令，允许带证据做最窄权限升级重试，**绝不绕过测试失败**。

**借鉴**：这三件事（分层、单一来源、写清「不要做什么」）不需要任何工具支持，是纯写作纪律，任何新项目第一天就能落地。

---

## 3. 决策层：Agent Notes——让 AI 写 RFC（重点）

### 3.1 机制

一切「代码、测试和文档都解释不了的持久决策理由」都写进 `.agents/notes/`：路径编码状态与分类（`{proposed|implemented|rejected}/{feature|bug-fix|simplification|architecture|process|testing}/yyyy-mm-dd-topic.md`），文件内容有强制骨架（`Problem` → `Decision/Proposal` → 技术细节 → **`Alternatives considered`（必填）** → `Consequences/Acceptance/Risks`），由格式门禁逐字段校验。完整模板与规则清单见 [ai-setup-template.md](./ai-setup-template.md) §4。

几个设计点格外值得咀嚼：

- **Alternatives 是「记录」出来的，不是「发明」出来的**（原文：*Alternatives are recorded, never invented*）。没被真实考虑过的方案不许事后补编——堵死了 AI「编造一段更漂亮的推理历史」的路径。
- **implemented = 现在时 + 随代码同步事实**：代码改动时 note 在同一提交里同步路径/名字/默认值这类**事实**；但**决策本身不许被就地改写**——反转决策要新开 note 并交叉链接。事实可修、决策不可篡改，两条线分得很清。
- **新 note 必触发「取代检查」**：每写一条新 note，必须检索同类旧 note，完全被取代的同 PR 归档、部分取代的交叉链接。决策语料不会无限膨胀成一堆互相矛盾的文档。
- **归档 = 冻结**：归档 note 只允许加一行 `Archived:` 日期、重录哈希封印、修入站链接；封存后**永久不许**编辑/翻译/重排，篡改会被 append-only 校验抓出。
- **禁止 INDEX.md**：路径即元数据，集中索引会让不相关改动互相冲突。

### 3.2 真实例子解剖

以 `2026-08-26-ban-ambiguous-origin-label`（禁用一个语义模糊的出处标签）为例，看一条 note 的完整生命周期形态：

- `## Problem` 讲清乱象：该词同时指涉源码事件引用、provider 元数据、上下文生产者、构建身份、记录证据……读者无法从标签本身判断事实。（趣闻：因为禁词规则连这条 note 自己都覆盖，正文里全程用「prove 与 nance 拼接的十字母词」绕开书写它。）
- `## Decision` 现在时写明最终规则、适用范围（源码/测试/文档/提示词/快照/文件名……）、门禁（`verify-concrete-terms`）与豁免（vendor 与归档目录）。
- `## Alternatives considered` 四条，每条一段、首句加粗、紧跟否决理由：语义评审不放机械禁令（已扩散到标识符，防不住）、换成更宽泛的伞词（保留歧义）、豁免全部标识符（继续误导调用者）、扫描 vendor 与归档（违反其冻结政策）。
- `## Consequences` 既记录买到什么（调用方使用更精确的名字），也记录负债与边界：*「通过门禁只证明该词已被清除，不证明替换词是精确的」*——连**门禁能力的上限**都写进了后果节。

### 3.3 为什么这套东西对 AI 特别有效

1. **AI 会话无记忆** → 决策必须外置成文件，而不是留在某次对话里；
2. **AI 会一本正经地合理化** → alternatives 强制 + 「不许发明」把「事后编理由」变成违规；
3. **AI 产出快、语料易膨胀** → 取代检查 + 删除/归档判据 + 冻结封印，让决策库保持在「可读的活体」状态；
4. **多代理/多会话并行** → 路径编码状态让任何代理扫一眼目录就知道某个决策是提案、已实施还是已被否决。

### 3.4 借鉴（个人/小团队简化版）

不必上全套脚本。最小可行版本：`implemented/` 单目录 + 一条 AGENTS.md 规则（「非平凡决策在同一提交里加 note」）+ 人工遵守 alternatives 必填。等决策多起来再补 `proposed/` 与分类。详见模板文件 §4.6 的三档方案。

---

## 4. 流程层：技能系统（重点）

### 4.1 19 个技能全景

DSH 把「重复出现、步骤固定、容易漏项」的工作全部技能化。按目的分组：

| 组 | 技能 | 何时触发 | 核心内容 |
| --- | --- | --- | --- |
| **流程门禁** | `dsh-pre-push-checks` | 推送、标 ready、声称检查通过前 | 用 `change-scope` 报告界定外发 diff → 按改动面选**最小必要证据** → 历史重写用 `--force-with-lease` 保护 → `gh stack sync` 后补验证序列 |
| | `dsh-ci-test-reliability` | 设计/审查/诊断可能 flaky 的测试 | 四层执行拓扑建模、资源原子分配（`listen(0)`/`mkdtemp`）、全局态恢复、平台语义、**六种掩盖式修复黑名单**（加超时/重试/全串行/吞错/弱断言/清理前 sleep） |
| | `dsh-merging-stacked-prs` | 合并相互依赖的 PR 链 | 只用官方 `gh stack` 对象与命令，**禁止** `gh pr merge` + `gh pr edit` 手工模拟栈 |
| **评审** | `dsh-code-review` | 评审 PR | 「先读要求再读 diff」、Sources of truth 清单、6 条 blocking requirements、findings 报告格式（阻断 vs 建议分离） |
| | `cordis-styling-nitpicking` | 评审插件生命周期语义 | 3 条 P0：模块级单例、未反转的副作用、清理依赖先于消费者完成；要求给出「失败交错」反例 |
| **文档** | `dsh-doc` | 写/重构/审查/迁移文档 | 8 步工作流、**「跑一遍再写」事实核查程序**、kind→模板系统（8 种）、voice 规则、质量判据 |
| | `dsh-prose-standard` | 写/审/精简任何文案（含注释、提示词、UI 字符串） | 「完整命题」（actor/条件/模态/负保证/所有权/失败模式缺一不可）、按位置的必需覆盖清单、owner-first 修改 |
| | `dsh-trim-cot-leakage` | 清理「思维链外泄」式文案 | 「the one test」：**一个只有 HEAD 代码、没有会话记录的读者，能否解开每个引用？** 8 类分类法（见 §6.3） |
| | `dsh-create-upgrade-guide` | 改动破坏外部可感表面时 | 在**引入破坏的当次改动**里就写迁移指南（不许拖到发版前）；固定 `## Change`/`## Migration` 结构、≤500 词、同 PR 出中文对照 |
| | `dsh-translate-docs` | 用户显式点名才运行 | 简报驱动的最小化翻译（`gen-translation-brief`）、两遍法（先母语重写、再逐子句核验）、「待定术语」机制 |
| **维护清理** | `dsh-archive-agent-notes` | 新增/审计/归档决策日志 | 取代检查、按**未来价值**分类（不是按字数/年龄）、删除/保留/归档判据 + 「校准例子」、封存操作的五步序列 |
| | `dsh-find-simplifications` | 找可删的代码/API/配置/文档 | 六个发现问句（有无完整效果路径？区分是否改变消费者动作？……）、子代理分域并行、防「搬家式简化」（复杂度转移不算简化） |
| **领域规范** | `dsh-error-handling` | 设计/评审失败路径 | typed 失败 + 处理所有权 + 兜底保证；「日志不是恢复」；理论基础点名 Meyer/Sutter/Armstrong 三本经典 |
| | `dsh-client-ui-ux` | 用户可见 GUI 的设计与评审 | 视觉 token 纪律、反馈面按消息生命周期选择、overlay 三项必查、平台窗体适配 |
| | `dsh-responsive-ui` | 响应式布局 | 390px 最小视口、「先调空间 → 再截断/图标/More 菜单」决策顺序、移动 hover 用 `@media (hover: hover)` 判定 |
| | `dsh-speed-up-perf` | 提速任务 | 「先测量再动手」+ **measurement card 七字段**；隐私硬规（只取聚合特征，绝不复制提示词）；负对照证明回归 |
| | `dsh-official-plugin-artwork` | 官方插件图标 | 单一主体、36×36 viewBox、禁 glow/emoji、编号备选 + 双主题验证 |
| **元技能** | `agent-experience` | 写给模型看的一切（工具定义、技能、上下文加载） | 最小上下文起步、显式发现、关键约束前置、有界输出、**测量首轮 token 变化** |
| **工具** | `record-browser-gif` | GUI 行为 PR 附 GIF | 录制与发布严格分离、storyboard 一次隔离运行（不许拼帧）、发布前后重读 PR head 防漂移 |

### 4.2 设计模式（从 19 个技能横切提炼）

1. **「指导，不是检查清单」**——多数技能开篇自我定位，防模型机械打勾；
2. **description 写触发条件**——AI 靠这一句决定何时加载；正文再写「何时不用」与排除项（如「vendor/ 与归档目录永不触碰」）；
3. **先读真源再动手**——技能第 0 步基本是「先读这些文件」，把「凭记忆办事」从流程上掐死；
4. **指向门禁命令**——技能末尾给出确切 `verify-*` 清单，技能与脚本互锁闭环；
5. **黑名单式否定规则**——高风险场景直接列「不许做什么」（flaky 测试的六种掩盖式修复是典型）；
6. **固定报告格式**——报告「实际跑过的命令」「边界情况」，并明文禁止夸大（归档技能：不许声称已归档链接有效——校验器故意不查它们）；
7. **重流程设为人工专属**——`dsh-translate-docs` 用 `disable-model-invocation: true` + `user-invocable: true` 双开关，模型不许自动触发，只在用户点名时运行。

### 4.3 借鉴：先技能化什么

新项目的技能化优先级建议（按收益排序）：

1. **提交前检查**（对应 `dsh-pre-push-checks` 的简化版）：把「改了什么 → 该跑什么」写死，终结「每次都跑全量」或「每次都凭感觉」；
2. **评审**（对应 `dsh-code-review`）：把评审前必读的真源清单固化；
3. **文档维护**（对应 `dsh-doc` 的简化版）：更新流程 + 事实核查要求（「跑过再写」）。

一个技能 20~60 行就够。判断信号：**同一件事你已经口头交代给 AI 超过两次**。

---

## 5. 证据纪律：信任但验证（最值得抄的一章）

DSH 对「AI 声称完成」的默认态度是：**自报告不算证据**。这在本仓库体现为一整套递进设计。

### 5.1 推送前：最小充分证据

- 推送前先跑「变更范围」报告（`pnpm run change-scope --base <ref>`，且**绝不猜 base**，用从远端核实的 ref），再按改动面选证据：

| 改动面 | 需要的证据 |
| --- | --- |
| 包/脚本行为 | 拥有它的单个测试文件或聚焦用例；跨共享契约再加相邻包 |
| 文档 / 决策日志 / 目录 | `doc-sync`（文档门禁聚合） |
| 模型/用户可见输出 | 聚焦的快照回放或真实可运行示例 |
| 清单 / 公共导出 / 构建配置 | 完整 `build` + hygiene + 对应冒烟 |
| 真实 provider / agent 行为 | 对应 `test:e2e` 目标（有密钥时；绝不打印密钥） |

- **不重复已通过的检查**（原文：*Never default to the full suite or repeat a passing check for commit or push*）——CI 拥有穷尽性与平台矩阵，本地只跑「能为本次回归负责的最小集」；
- 失败时：停下修或解释，**不赌 CI 结果不同**；疑似环境问题必须给出「命令、失败用例、平台差异」三件套证据；跳过钩子只能经用户明确同意并报告原因。

### 5.2 验证「世界」，而不是「代理的自我报告」

测试政策里这句原文值得划重点：

> *An e2e assertion re-runs the command or re-reads the file externally; a keyword probe on the agent's own output lets a cheating agent pass.*
> （e2e 断言要在外部重跑命令或重读文件；只对代理自己的输出做关键词探测，会让一个「作弊的代理」蒙混过关。）

配套纪律：断言未触碰的文件**逐字节不变**；e2e 自己拥有资源（测试里创建、`afterEach` 销毁，即使失败/重试/超时也要）。

### 5.3 负对照：护栏必须被证明会拦人

原文：*A guard only guards if the regression fails it.*（护栏只有在回归能让它变红时才算护栏。）DSH 要求每个改变的验收路径都要证明「无效案例确实被拒绝」——把回归故意引入、看它变红、再撤回。防止 AI 写出「永远为绿」的假测试/假门禁。

### 5.4 快照回放：零密钥的「整机」验收

非平凡的用户/模型可见改动，必须在同一 PR 更新一个**密钥无关的录制会话回放**场景：录制文件既是重放的输入、又是预期的持久化输出；`test:snapshot` 只回放不写入，重录需要真密钥且评审必须逐条审 diff（「把预期输出 diff 当行为变化审，不当格式噪音」）。提交的录制是「归一化不动点」（易变身份换成占位 token）。

### 5.5 覆盖率与死代码

每文件 100% 覆盖率是 CI 硬门（`test:coverage`），且官方明确其哲学：*未覆盖的行往往是被门禁标出的死代码，而不是缺一条测试要补*。覆盖率是必要条件、永远不是充分条件——它证明行被执行过，不证明功能按 shipped 方式工作。

### 5.6 反掩盖黑名单（写死进技能）

CI 测试不稳定时，禁止「加超时、加重试、全量串行、吞掉错误、弱化断言、清理前 sleep」——被定性为掩盖式修复；正确路径是「按状态同步（sleep 不算证据）、原子分配资源、销毁到静默、证明回归」。不稳定的根因通常在 4 层执行拓扑之一（同文件、跨 worker、同 job 多进程、共享主机多 job），而不是「randomness」。

### 5.7 借鉴：最小验证阶梯

| 档 | 做法 |
| --- | --- |
| 起步 | 约定「声称完成 = 附上实际跑过的命令与输出」；禁止「应该没问题」式结论 |
| 进阶 | 为关键行为写「从外部再验证」的测试（重跑命令/重读文件/校验产物），而不是只测内部函数 |
| 完整 | 引入聚焦快照/录制回放 + 每个新护栏配一个「负对照」证明它会拦人 |

---

## 6. 文档纪律：对抗 AI 文案腐坏

DSH 是少数把「文档也会腐坏」治理得比代码还细的仓库。核心武器有三件：

### 6.1 词数预算 + 层级唯一归属

常驻文档（AGENTS.md、架构、测试政策……）全部进 `doc-budgets.manifest.json` 设词数上限，超标走「搬家 → 压缩 → 上调」三步。配合「一个事实一个家」的层级表（§1.3），文档体积被两个方向夹住：**总量有帽、内容各归其位**。

### 6.2 slop 清单（8 类 AI 文案垃圾）

直译自 `docs/AGENTS.md`：重复规则 / 历史错位（非历史层讲历史）/ 状态标注（「已实现！」——状态会腐烂）/ 手工复述生成的目录 / 推理实录（实现过程叙述、明显分支的证明）/ 理由散落（同一理由在多个方法旁重复）/ 段落墙 / 强调膨胀。`dsh-doc` 技能把这个清单当作「审计清单」现场执行。

### 6.3 CoT 泄漏清理：AI 文案特有垃圾的清洗术

`dsh-trim-cot-leakage` 处理一类特别「AI」的问题：文稿的**叙述视角停留在写它的那次会话里**——引用只在那次会话可见的编号、对着已经离开的评审辩解、叙述「这次改动」。总判据一句话：

> **一个只有 HEAD 代码、没有会话记录/PR 线程/未提交草稿的读者，能否解开每个引用、核验每个断言？** 不能 → 把存活的事实改写成「站在仓库视角能独立成立」的句子，删掉其余；能 → 但当前状态面（README/JSDoc）里的「变更故事」仍要挪到它该去的层级。

8 类分类法（附实际例子）：死掉的设计会话引用（`(decision 7)`、`§4.7`）、栈/PR 视角（「本栈中更晚的 PR」）、变更叙述与版本戳（「曾经」「不再」）、评审编排（「评审中否决：」）、向评审答辩（「这里安全，因为……」）、复述与推导实录（「先 X 后 Y」）、对冲与计划残留（「目前应该够用」）、作者语言残留（中英混杂的工作语）。同时给出「什么不是泄漏」的保留规则（issue 引用、被抑制告警的理由、反事实回归钉子「没有 X 就会 Y」、测量边界值……），并警告过度清理的陷阱：把义务修剪成背书、把假设升级成已发布功能。

### 6.4 术语正名

根 AGENTS.md 的写作节规定：**不用隐喻**；写下 `contract` / `boundary` / `shape` 之前先问有没有更精确的词——写 `response fields`、`JSON validation`、`ESM exports`；`contract` 只留给前置/后置条件、不变量、兼容承诺这类真义务。这一条直接对抗 AI 最爱用的「大词糊弄」。

### 6.5 双语配对（可选了解）

DSH 要求所有范围内文档中英成对，机制见 [ai-setup-template.md](./ai-setup-template.md) §8.4。最值得记住的是它的诚实：**门禁只证明「在这个内容上确认过」，不证明确认本身可靠**——翻译质量仍归评审。还有两个细节：中文侧必须保留英文回链；重流程技能设有「待定术语」机制（找不到可引用先例的新术语，挂起而不是随手翻）。

### 6.6 借鉴

- 给自己的常驻文档设一个「词数天花板」（哪怕只是人工记在 README 里）；
- 把 slop 8 条抄进评审习惯或 AI 的文档技能；
- 写完文档后用「the one test」（§6.3）自检一遍——尤其你在用 AI 写说明文时。

---

## 7. 抗腐坏：把「删」也工程化

这是 DSH 与「只加速写」的 AI 工作流最大的区别——**它同时工程化了删减**：

- **跨文件克隆检测**：`pnpm run duplication` 做 TypeScript 克隆检测（对应用户 12 章讲的「语义重复」问题）；
- **找简化点技能**（`dsh-find-simplifications`）：目标是「删除**维护义务**」——API、表示法、生命周期状态、配置路径、依赖、测试、文档；候选必须**证据化**（先 `rg` 精确符号，再读匹配；静态未用扫描必须覆盖 manifest 驱动的加载、生成产物、编译器面）；明确拒绝「搬家式简化」（把复杂度挪个地方不算简化）；
- **收紧公共面**：包规则要求「每个抽象、状态机、选项、防御性拷贝、兼容路径都要绑定一个当前契约或生产消费者」；「一个公共方法只有一个内部调用者」被视为反向味道——改为传一个私有能力闭包；新增值导出「需要用户签字，而不是仅有一个消费者」；
- **异步操作单一生命周期主**：一个异步操作一个 controller/transaction，额外的就绪/取消/销毁/预占状态必须有独立主，否则折叠——防止 AI 在异步代码里不断叠加新的 flag。

**借鉴**：定期（比如每迭代一次）让 AI 做一轮「找简化点」：给它三句问句——「这个能力有完整的效果路径吗（生产者→转换→消费→可观察结果）？」「这些区分会改变哪个消费者的动作？」「删掉它，什么维护义务消失、什么能力被放弃？」——把回答记成候选清单，人工挑。

---

## 8. 评审与信任边界

### 8.1 评审技能的方法论（`dsh-code-review`）

- **先读要求、再读 diff**：原文尖锐——*「凭记忆中的规则去评判一个 diff，正是违规能通过评审的方式。」* 技能第 0 步是从「Sources of truth」清单里打开所有该 diff 触碰到的权威页面；
- 用 `change-scope` 报告建立「改动面 → 需要检查的要求」映射后才开始读代码；
- 优先级序：正确性、生命周期、安全、被破坏的必需行为 > 风格；*「一条有实据的阻断意见，好过一列 nits」*；
- 与决策日志冲突时的姿态：*「与 Agent Note 的意见分歧是设计讨论，不是自动否决」*；
- 接收评审时：*「逐条核实，凭技术理由修复或反驳，不做表演式认同」*。

### 8.2 人机协作接口

PR 模板三段式（Motivation 必引 issue / Changes 显式声明可观察行为变化、无则 None / Testing 每条方法一个条目 + Proof 折叠证据区）；Issue 模板带 type frontmatter 对接 GitHub Issue Types。「没有则写 None」和「Proof 必须有可复核证据」是专门设计的**反模糊**条款——不给 AI 留「写了但没说什么」的空间。

### 8.3 信任边界（团队规模参考）

- 外部 PR 暂不接收（社区走 Discussions + 插件生态）——流程假定参与者可信度分层；
- 自动化工作流的安全不变量：**策略脚本永远从默认分支检出执行**、`persist-credentials: false`，PR 事件只作数据——防 pwn-request；
- 审批建模为**加权、可撤销的 commit status**（review 事件串行化、`/delegate` 触发、失败独立兜底）——适配「人 + 多代理混合产出」的仓库。

---

## 9. 产品化视角：面向模型的契约（加分项）

DSH 本身是 agent 产品，所以它把「怎么给模型写东西」也沉淀成了文档规则和技能（`agent-experience`），对写 prompt / skill 同样适用：

- **从模型视角写模型面契约**：提示词、工具 schema、结果、诊断只含任务相关概念，不混入 UI/传输/实现词汇；稳定文本逐字钉住、动态行为用快照或端到端覆盖；
- **`Model-visible ⟺ logged`**：任何到达模型请求的东西都必须能从会话日志重建——新增模型可见输入必须新增会话事件（对你自建 agent 的直接启示）；
- **agent-experience 六条**：最小上下文起步 / 显式发现（每个延迟加载的资源都要有说明和可检索路径）/ 关键约束前置 / 有界输出（返回标识符和路径，别 dump 整个日志）/ 局部性（在结果里带一点最可能需要的相邻上下文，并标注截断）/ 评估总工作量（省 context 反而造成更多搜索就得不偿失）；
- 工具定义四原则：删掉模型能从结果学到的约束、描述行为而非实现、参数规则写在参数上、每个事实说一次、并**测量首轮 token 变化**。

---

## 10. 借鉴总结：分档落地清单

| 档 | 做法 | 解决什么问题 | 落地方式 |
| --- | --- | --- | --- |
| **零成本（今天）** | ① 根 AGENTS.md 单源 + symlink 转发；② 约定「声称完成必附实际命令与输出」；③ PR 模板三段式（含 None/Proof 条款）；④ 写作规则一节（不用隐喻、不叙述改动史） | 规矩常驻化、自报告不可信、协作接口标准化 | 模板文件 §1/§3/§7 直接抄 |
| **低成本（半天）** | ⑤ 3 个起步技能（提交前检查 / 评审 / 文档维护）；⑥ `.agents/notes/implemented/` 单目录；⑦ 文档预算表（哪怕人工维护）；⑧ slop 8 条进习惯 | 重复流程固化、决策外置、文档防肥 | 模板文件 §4.6 最简档 / §5 / §6 |
| **进阶（项目长大）** | ⑨ notes 全生命周期 + 取代检查（脚本可选）；⑩ 快照/录制回放测试 + 负对照；⑪ CI 分层 + pre-commit 门禁脚本；⑫ 定期「找简化点」清理；⑬ 双语配对 / 审批自动化（按需） | 决策库不膨胀、验收防作弊、熵有出口 | 本文 §3/§5/§7/§8 |

**核心心法一句话**：DSH 不是让 AI「更聪明」，而是把仓库改造成一个**让平庸发挥也难出大错**的环境——规矩有门禁、决策有台账、流程有技能、证据可复核。

---

## 11. 反模式警示（他们在原文中明令禁止的）

| 反模式 | DSH 的处置 |
| --- | --- |
| 用加超时/重试/串行/吞错误掩盖 flaky 测试 | 六项黑名单，定性为掩盖式修复 |
| 关键词探测代理自己的输出当作测试证据 | 点名「会让一个作弊的代理通过」 |
| 「通过门禁 = 质量合格」 | 多处声明门禁上限（如翻译门禁「只证明确认过」） |
| 决策反转就地改写旧记录 | 必须新开 note + 交叉链接 |
| 归档后修改/翻译/修复封存件 | 永久冻结 + 哈希封印校验 |
| 集中式决策索引 INDEX.md | 校验脚本直接报错 |
| 手工模拟堆叠 PR、手工分发迁移指南 | 走官方工具与固定结构 |
| 文档里叙述改动史、保留状态标注 | slop 清单 / CoT 清理技能 |
| 为静态接口已保证的值加运行时兜底 | 一条约定钉死「校验只留边界」 |
| 空 catch 注释、注释复述代码 | 规则级禁止 |

---

## 12. 信息来源（全部对照 `dsh-v0.2.1-alpha.5` tag，核对日期 2026-10-17）

| 主题 | 出处 |
| --- | --- |
| 根指令（命令/约定/沙箱规则） | https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/AGENTS.md |
| 防御模式五习惯 | https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/docs/defensive-patterns/README.md |
| 决策日志规则与格式 | https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/.agents/notes/README.md |
| 决策日志「RFC by agents」定位 | https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/.agents/notes/AGENTS.md |
| 禁用模糊标签实例（alternatives 写法） | https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/.agents/notes/implemented/process/2026-08-26-ban-ambiguous-origin-label.md |
| 文档标准（层级/预算/slop） | https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/docs/AGENTS.md |
| 测试政策（证据/快照/反作弊） | https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/docs/testing.md |
| 技能全集 | https://github.com/deepseek-ai/deepseek-harness/tree/dsh-v0.2.1-alpha.5/.agents/skills |
| 推送前检查技能 | https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/.agents/skills/dsh-pre-push-checks/SKILL.md |
| 评审技能 | https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/.agents/skills/dsh-code-review/SKILL.md |
| CoT 泄漏清理技能 | https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/.agents/skills/dsh-trim-cot-leakage/SKILL.md |
| 找简化点技能 | https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/.agents/skills/dsh-find-simplifications/SKILL.md |
| 双语配对契约 | https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/docs/i18n/README.md |
| PR / Issue 模板与安全流程 | https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/.github/pull_request_template.md · https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/.github/workflows/weighted-approval.yml |
| 外部 PR 政策 | https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/CONTRIBUTING.md |
