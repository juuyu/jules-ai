---
description: "Task list template for feature implementation"
---

# Tasks: [功能名]

**Input**: `specs/[###-feature-name]/` 下的设计文档

**Prerequisites**: plan.md、spec.md（必需）；research.md、data-model.md、contracts/（按方案）

**Organization**: 任务按用户故事分组，每个故事可独立实现、独立测试、独立交付。

## 格式：`[ID] [P?] [Story] 描述`

- **[P]**：可并行（不同文件、无依赖）
- **[Story]**：所属用户故事标签（US1、US2……）
- 每条任务必须包含**确切文件路径**；测试任务在前，先确认失败再实现

<!--
拆任务规则（/speckit-tasks 必须遵守）：
1. 必须替换下面的示例任务，不许保留。
2. 顺序：Phase 1 Setup → Phase 2 Foundational → 每个 US 一个 Phase（P1 是 MVP）→ Polish。
3. 每个 US Phase 内：测试任务（先红）→ models → service → 接口 → 校验/错误处理。
4. 结尾给「只做 P1」的任务编号范围与依赖图；任务可追溯到 spec 的 FR 编号。
-->

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 [P] 创建项目结构与依赖配置（pyproject.toml / package.json、src/、tests/）
- [ ] T002 [P] 配置 lint、格式化与测试命令

---

## Phase 2: Foundational (Blocking Prerequisites)

> 本阶段不完成，任何 US 不许开始。

- [ ] T003 建立数据模型与存储接入（确切路径：`src/...`）
- [ ] T004 [P] 建立错误响应与校验中间件（`src/...`）

**Checkpoint**: 基础设施就绪，US 可并行开工。

---

## Phase 3: User Story 1 - [标题] (Priority: P1) 🎯 MVP

**Goal**: [一句话交付物]

**Independent Test**: [独立验证方式]

### Tests for User Story 1（先写，确认失败）

- [ ] T005 [P] [US1] 契约测试：[...]（`tests/contract/test_....py`）
- [ ] T006 [P] [US1] 集成测试：[...]（`tests/integration/test_....py`）

### Implementation for User Story 1

- [ ] T007 [P] [US1] 实现 [...]（`src/...`）
- [ ] T008 [US1] 实现接口 [...]（`src/...`，依赖 T007）
- [ ] T009 [US1] 校验与错误处理（覆盖 spec Edge Cases）

**Checkpoint**: US1 独立可演示——只做 T001–T009 即 MVP。

---

## Phase 4: User Story 2 - [标题] (Priority: P2)

**Goal**: [...]

**Independent Test**: [...]

### Tests for User Story 2

- [ ] T010 [P] [US2] 测试：[...]（`tests/...`）

### Implementation for User Story 2

- [ ] T011 [US2] 实现 [...]（`src/...`）

**Checkpoint**: US1 + US2 均独立可用。

---

## Phase N: Polish & Cross-Cutting

- [ ] Txxx [P] 文档更新与 quickstart.md 实测走查
- [ ] Txxx 全量测试 + 构建（提 PR 前证据）
- [ ] Txxx 运行 /speckit-converge 直到 Converged

---

## Dependencies & Execution Order

- Setup → Foundational（阻塞全部 US）→ US 按 P1→P2 顺序（或并行）→ Polish
- 每个 US 内部：测试先红 → models → service → 接口
- **P1 MVP 任务范围**：T001–T0xx（仅完成这些即可独立交付）

## Traceability

| spec 条目 | 任务 |
| --- | --- |
| FR-001 / US1 AS-1 | T005, T008 |
| FR-002 / US1 AS-2 | T006, T009 |

## Notes

- 每条任务完成即勾选并提交一个 commit（message 带任务号）
- 范围外的改进不进本清单，另开 spec
- 测试必须先失败；不许用弱化断言的方式让测试变绿
