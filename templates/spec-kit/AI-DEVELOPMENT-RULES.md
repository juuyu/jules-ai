# AI 规范开发规则（Spec Kit 使用手册）

> 这份文件回答两个问题：**每个阶段谁做什么、怎么管住 AI 不跑偏。**
> 配套提示词可直接复制到 AI 对话；斜杠命令形式适用于已 `specify init` 的项目，括号内是手工模式的对应动作。

## 1. 人机分工：你是产品经理 + 评审，AI 是起草人

| 阶段 | 人（必须亲自做） | AI（可以委托） |
| --- | --- | --- |
| constitution | 拍板长期原则、签字批准 | 起草、举反例检验原则是否可判定 |
| specify | 提供真实需求、删多余故事、确认验收场景 | 补全 Given/When/Then、找遗漏场景 |
| clarify | 回答业务问题、做取舍 | 提问、把结论回写 spec |
| plan | 审技术选型、确认依赖与契约 | 调研、起草方案、做 Constitution Check |
| tasks | 删任务、调优先级、确认 MVP 边界 | 按故事分组拆任务、标依赖与 `[P]` |
| implement | 每完成一批抽查代码 | 按勾选任务写代码与测试 |
| converge | 确认缺口判定是否成立 | 逐条对照验收标准出报告 |
| PR | 最终审查、按模板填证据 | 汇总变更、生成 PR 草稿 |

**不可委托给 AI 的三件事**：产品取舍（做不做某功能）、优先级排序、「完成」的最终签字。

## 2. 阶段门禁（不满足不许进下一阶段）

```text
constitution 闸门：原则 ≤ 5 条且每条「可检验」（能说出违反时的具体表现）
        ↓
specify 闸门：每条 P1 故事独立可测；验收场景是 Given/When/Then；全文无技术名词
        ↓
clarify（按需）：spec 中不得残留 NEEDS CLARIFICATION
        ↓
plan 闸门：Constitution Check 逐条有结论；contracts 覆盖全部验收场景；
           新依赖每个都有理由；复杂度违规填入 Complexity Tracking
        ↓
tasks 闸门：任务按 US 分组且带 US 标签；P1 阶段单独构成 MVP；每条任务有确切文件路径
        ↓
implement ⇄ converge：任务勾选与代码一致；converge 报告 Converged 才能提 PR
```

## 3. 三条防腐规则（长期项目最重要）

1. **三层一致**：spec.md（需求）↔ plan.md（方案）↔ tasks.md（任务）。实现中发现需求缺了/错了，**先改 spec，再让 plan/tasks 跟上，最后改代码**——顺序不能反，否则文档立刻失效。拿不准用 `/speckit-analyze`。
2. **spec 不写技术**：spec 里出现「用 FastAPI」「加个 Redis」就是越界，技术决策只在 plan 及之后出现。
3. **任务即合同**：implement 只做 tasks.md 里勾选范围的事；临时想到的改进记成新任务（或新 spec），不塞进当前 diff。

## 4. AI 使用纪律

- **一次一个命令**：不要让 AI「一口气 specify+plan+tasks」。每步产出落盘后人工读完再继续。
- **产物是文件，直接手改**：对 AI 产出不满意就改 markdown，比重跑命令更快更准；改完告诉 AI 以文件为准。
- **证据规则**：声称「测试通过」必须附实际执行的命令与输出摘要；不许写「应该没问题」。
- **失败即停**：命令/测试失败时先修，不赌 CI；环境问题记录命令、报错、平台差异三件套。
- **最小检查**：实现阶段每完成一个 US 跑该故事的测试；全量测试留到提 PR 前。
- **上下文复位**：新开对话时第一句让 AI「读 constitution.md 与 specs/NNN-*/ 全部文件，概述当前阶段与待办」，避免它凭印象接续。

## 5. 分支与提交规范

- 分支名 = spec 头部的 Feature Branch：`001-checkin-api`（spec-kit 规定的 `###-feature-name`）。
- 提交粒度：**一个任务（或一组强相关任务）一个 commit**，message 带任务号：

  ```text
  T004: add check-in creation endpoint with validation
  T005-T006: add list endpoint and integration test
  docs(spec): clarify timezone handling for date filter
  ```

- spec/plan/tasks 的修改与对应代码改动分属不同 commit（`docs(spec):` 前缀），评审时能清楚看到「需求先变、代码后跟」。
- PR 必须在 converge 显示 Converged 后开；PR 模板会要求填验收场景映射。

## 6. 每阶段提示词（复制即用）

### 6.1 立宪法（或直接用模板里的现成版本）

```text
/speckit-constitution 为本项目创建宪法，不超过 5 条原则，每条必须可检验
（能描述违反时的具体表现），覆盖：规格先行、测试要求、接口契约、依赖与复杂度、
增量交付。产出后逐条说明「什么情况算违反」，不要写「代码优雅」这类不可判定的口号。
```

### 6.2 写规格

```text
/speckit-specify <用 2~4 句话描述需求：谁、在什么场景、要解决什么问题>
要求：只谈 What/Why，不出现任何技术选型；按用户价值排 P1/P2/P3；
每个故事给独立测试方式；验收场景用 Given/When/Then；
最后列出你做的假设和你拿不准、需要我回答的问题。
```

### 6.3 澄清歧义

```text
/speckit-clarify 针对 spec.md 中所有 NEEDS CLARIFICATION 与隐含假设向我提问，
一次最多 5 个最关键的问题（按对架构影响排序）；我回答后把结论回写 spec.md，
并删掉对应标记，不要保留未决项进入 plan 阶段。
```

### 6.4 出方案

```text
/speckit-plan 技术约束：<语言/版本/主要框架/存储/测试框架>。
要求：先逐条做 Constitution Check（引用宪法原文 + 通过/不通过结论）；
contracts/ 必须覆盖 spec.md 的每条验收场景（给出场景编号映射）；
每个新增依赖写一行理由；如有宪法违例，填入 Complexity Tracking 并说明
为什么更简单的方案不行。项目结构用真实路径，删掉用不上的 Option。
```

### 6.5 拆任务

```text
/speckit-tasks 按 spec 的用户故事分组：Phase 1 Setup、Phase 2 Foundational、
之后每个 US 一个 Phase，P1 单独构成可演示 MVP。每条任务带 US 标签和确切文件路径；
测试任务在前并标注先写测试；不同文件无依赖的任务标 [P]；
最后给出「只做 P1」时的任务编号范围。
```

### 6.6 实现（每个 US 一轮，别一次做完）

```text
/speckit-implement 只实现 tasks.md 中 Phase <N>（US<N>）的任务，严格按顺序：
先写该阶段测试任务并确认失败，再写实现；每完成一条勾选并提交一个 commit。
不要做任务范围外的重构；遇到规格没覆盖的情况先停下问我，不要自行假设。
完成后报告：执行的命令、测试结果、未完成的任务。
```

### 6.7 收敛

```text
/speckit-converge 逐条对照 spec.md 的验收场景（按编号）检查实现与测试，
给出：已满足（附证据：测试名或验证步骤）/ 未满足（缺什么、对应任务号）。
只报告实际存在的证据；测试没跑过就标未验证。
```

未达标的标准动作：读缺口 → 回到 6.6 补实现 → 再 converge，循环到 **Converged**。

### 6.8 提 PR 前

```text
读取 spec.md、plan.md、tasks.md 与 git diff <base>...HEAD：
1. 跑全量测试与构建，附实际输出；
2. 生成 PR 草稿：Motivation 引用本 spec；Changes 分「接口/数据变化」与
   「可观察行为变化」两类；Testing 把每条验收场景编号映射到具体测试；
3. 列出未覆盖项，禁止「应该没问题」。
```

## 7. 什么时候不走全流程

| 改动类型 | 走法 |
| --- | --- |
| 新功能、新模块、跨模块行为变化、对外接口变化 | 完整流程 |
| 修 bug | 可直接修；若暴露规格缺口，先补 spec 对应验收场景 |
| 改文案、改配置值、重命名、机械重构 | 直接改，正常提 PR |
| 紧急修复 | 先修 + 补测试；事后补一条 spec 验收场景防止回归 |

判断信号：**这个改动一周后还需要向别人解释「为什么」吗？** 需要 → 走 spec。

## 8. 常见失败模式（官方社区高频踩坑）

1. AI 一口气跑完所有阶段 → 三层文档互相矛盾；强制分步可解。
2. 宪法写成口号（「高质量」「易维护」）→ plan 的 Constitution Check 形同虚设；原则必须可判定。
3. spec 里混入技术方案 → 用户故事被实现绑架；发现就回退到 What/Why 重写。
4. tasks 没有确切路径 → AI 实现时自由发挥；每条任务必须点名文件。
5. 改代码不更新 spec → 文档失效后团队不再信任流程；防腐规则 1 是底线。
6. converge 一有缺口就手改报告 → 失去验收意义；缺口只能靠补实现消除。
