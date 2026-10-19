# Feature Specification: [功能名]

**Feature Branch**: `[###-feature-name]`

**Created**: [DATE]

**Status**: Draft

**Input**: User description: "$ARGUMENTS"

<!--
本模板规则（/speckit-specify 必须遵守）：
1. 本文件只写 What / Why：禁止任何技术选型（框架、数据库、库、协议字样一律不出现）。
2. 用户故事按价值排 P1/P2/P3；每个故事必须独立可测——只实现它一个也能交付价值（MVP 切片）。
3. 验收场景一律 Given/When/Then；歧义点用 [NEEDS CLARIFICATION: ...] 显式标注，不自行假设。
4. 语言：中文正文，字段标签保持英文。
-->

## User Scenarios & Testing *(mandatory)*

### User Story 1 - [一句话标题] (Priority: P1)

[用大白话描述用户旅程]

**Why this priority**: [价值与优先级理由]

**Independent Test**: [如何独立验证——做一个什么动作、得到什么价值]

**Acceptance Scenarios**:

1. **Given** [初始状态], **When** [动作], **Then** [可观察结果]
2. **Given** [初始状态], **When** [动作], **Then** [可观察结果]

---

### User Story 2 - [一句话标题] (Priority: P2)

[描述]

**Why this priority**: [...]

**Independent Test**: [...]

**Acceptance Scenarios**:

1. **Given** [...], **When** [...], **Then** [...]

---

### Edge Cases

- [边界条件] 时会怎样？（空值、超长、重复、并发、权限不足……）
- [错误场景] 如何处理？（用户看到什么、系统状态是否变化）

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统必须 [具体能力]
- **FR-002**: 用户必须能 [关键交互]

<!-- 拿不准的需求这样标，交给 /speckit-clarify： -->
- **FR-003**: 系统必须 [NEEDS CLARIFICATION: 未说明的点]

### Key Entities *(涉及数据时填写，只写业务属性，不写表/字段实现)*

- **[实体 1]**: [代表什么、关键业务属性]
- **[实体 2]**: [代表什么、与其他实体的关系]

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: [可度量结果，如「用户首次尝试完成主操作成功率 ≥ 90%」]
- **SC-002**: [性能/业务指标，技术中立、可测量]

## Assumptions

- [目标用户假设]
- [范围边界，如「v1 不包含移动端」]
- [对既有系统的依赖]
