# Implementation Plan: [功能名]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [链接]

**Input**: `specs/[###-feature-name]/spec.md`

<!--
本模板规则（/speckit-plan 必须遵守）：
1. 先做 Constitution Check 再做设计；设计完成后复核一次。引用宪法原文，逐条 ✓/✗。
2. contracts/ 必须覆盖 spec 的每条验收场景，给出 AS 编号 → 契约条目的映射表。
3. 每个新增依赖一行理由；违例填入 Complexity Tracking，说明更简单方案为何不行。
4. 项目结构只保留选中的一种，写真实路径，删除 Option 标签。
-->

## Summary

[一句话：spec 的主要需求 + 技术路线]

## Technical Context

**Language/Version**: [如 Python 3.12]

**Primary Dependencies**: [如 FastAPI、SQLAlchemy——每个新增依赖理由见下]

**Storage**: [如 SQLite / N/A]

**Testing**: [如 pytest]

**Target Platform**: [如 Linux server]

**Project Type**: [library / cli / web-service / mobile-app / desktop-app]

**Performance Goals**: [可度量目标或 N/A]

**Constraints**: [约束或 N/A]

**Scale/Scope**: [预期规模]

### 新增依赖理由

| 依赖 | 解决什么 | 不引入它的代价 |
| --- | --- | --- |
| | | |

## Constitution Check

*闸门：研究前必过；设计后复核。引用 .specify/memory/constitution.md 原文逐条判定。*

- ✓/✗ I. 规格先行：[结论]
- ✓/✗ II. 测试为准：[P1 验收场景的测试安排]
- ✓/✗ III. 契约优先：[契约覆盖映射见下]
- ✓/✗ IV. 简单与证据：[依赖与复杂度结论]
- ✓/✗ V. 增量可交付：[P1 MVP 切片的任务范围]

### 验收场景 → 契约映射

| spec 验收场景 | contracts/ 条目 |
| --- | --- |
| US1 AS-1 | |
| US1 AS-2 | |

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md   # 由 /speckit-tasks 生成
```

### Source Code (repository root)

```text
src/
tests/
```

**Structure Decision**: [选中结构与真实路径说明]

## Complexity Tracking

> 仅当 Constitution Check 存在必须说明的违例时填写

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| | | |
