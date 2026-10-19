# AGENTS.md

本项目采用 **Spec Kit 规格驱动流程**：产品代码的功能性变更必须先有规格。流程规矩见 [AI 开发规则](../AI-DEVELOPMENT-RULES.md)（模板外项目可将该文件复制到 docs/ 下）。

## 目录地图

```text
.specify/memory/constitution.md   项目宪法：最高优先级的长期原则
.specify/templates/               spec/plan/tasks/checklist 的模板（命令读取）
specs/NNN-feature/                每个功能一个目录（spec → plan → tasks 全套产物）
src/                              产品代码
tests/                            测试
```

## 工作流（按顺序，每步人工签字后才继续）

```text
/speckit-constitution   仅新项目一次
/speckit-specify        每功能：只谈 What/Why
/speckit-clarify        按需：消除全部 NEEDS CLARIFICATION
/speckit-plan           技术方案 + Constitution Check + contracts
/speckit-tasks          按用户故事分组、带文件路径的任务
/speckit-implement      一次只做一个 Phase；先红后绿
/speckit-converge       对照验收场景；Converged 后才可提 PR
```

## 硬性约定

- **无 spec 不动产品代码**：新功能/行为变化先走规格；修 bug、改文案、机械重构例外（见规则文件 §7）。
- **spec 不写技术**：技术选型只出现在 plan.md 及之后。
- **三层一致**：需求变更先改 spec.md，再同步 plan.md / tasks.md，最后改代码；顺序不许反。
- **任务即合同**：实现只做 tasks.md 勾选范围；范围外改进另开任务/spec，不夹带。
- **先红后绿**：tasks 中测试任务先写并确认失败，再写实现。
- **证据要求**：声称完成须附实际执行的命令与输出；测试失败先修，不赌 CI；没验证的项明确标注。
- **分支与提交**：分支名 = `NNN-feature-name`；一个任务一个 commit，message 带任务号（如 `T004: ...`）；规格修改用 `docs(spec):` 前缀。
- **PR 门禁**：converge 显示 Converged、验收场景逐条映射到测试、Constitution Check 无未决违例，才可开 PR。

## 新对话开场

任何新会话开始时，先读 `.specify/memory/constitution.md` 与当前功能目录下的全部文件，概述：所处阶段、已勾选/未勾选任务、下一步命令。信息不足时提问，不要凭印象接续。
