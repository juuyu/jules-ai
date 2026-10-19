# Feature Specification: 健身打卡 API

**Feature Branch**: `001-checkin-api`

**Created**: 2026-10-19

**Status**: Approved

**Input**: User description: "做一个健身打卡的后端：用户每天可以打卡一次记录运动，还能按日期查自己的打卡历史。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 提交每日打卡 (Priority: P1)

健身用户在完成当天运动后提交一次打卡，系统记录日期并返回可确认的打卡凭证。

**Why this priority**: 打卡是产品存在的唯一理由；没有它，查询等其他功能都没有数据对象。

**Independent Test**: 对一条合法打卡提交 POST 请求，得到包含打卡日期的 201 响应，且重复查询能看到这条记录——无需任何其他功能即可交付价值。

**Acceptance Scenarios**:

1. **Given** 已注册用户 ID 为 `u-1` 且今天尚未打卡，**When** 以 `{ "user_id": "u-1", "note": "晨跑 5km" }` 提交，**Then** 返回 201，响应体包含该打卡的唯一 ID、用户 ID、服务器当天日期与备注
2. **Given** 用户 `u-1` 今天已经打卡，**When** 再次提交，**Then** 返回 409，且不产生第二条记录
3. **Given** 请求体中的日期字段（如客户端传入）是未来日期，**When** 提交，**Then** 返回 422 且存储中不写入记录

---

### User Story 2 - 按日期查询打卡历史 (Priority: P2)

用户想回看自己在某些日子有没有运动，按日期或日期范围查询自己的打卡记录。

**Why this priority**: 增强留存但不阻断首个可用版本；数据累积后价值才明显。

**Independent Test**: 预置某用户三天的打卡，用日期范围查询，恰好得到这三天的记录且顺序正确。

**Acceptance Scenarios**:

1. **Given** 用户 `u-1` 在 10-01、10-02、10-03 有打卡，**When** 以 `start=2026-10-01&end=2026-10-03` 查询，**Then** 返回 3 条、按日期升序
2. **Given** 同上数据，**When** 只传 `date=2026-10-02` 查询，**Then** 只返回 10-02 一条
3. **Given** 用户 `u-2` 查询，**When** 用同样的参数，**Then** 看不到 `u-1` 的任何记录（用户隔离）
4. **Given** 查询参数 `start` 晚于 `end`，**When** 请求，**Then** 返回 422 并说明原因

---

### Edge Cases

- 请求体不是合法 JSON / 缺少 `user_id` 时怎样？→ 422，不写存储。
- `note` 超长（> 500 字）时怎样？→ 422，不写存储。
- 用户 ID 不存在时打卡怎样？→ 422（v1 不提供注册接口，用户 ID 必须来自预置白名单）。
- 跨时区的「今天」如何判定？→ 以服务器时区（Asia/Shanghai）的日期为准，客户端不许指定打卡日期。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统必须接受用户提交打卡（user_id、note 可选），日期由服务器按 Asia/Shanghai 当天写入
- **FR-002**: 系统必须保证同一用户同一天至多一条打卡（重复返回 409）
- **FR-003**: 系统必须拒绝未来日期、超长备注、未知 user_id、格式错误的请求体（422）
- **FR-004**: 系统必须支持按单日（date）或闭区间（start + end）查询打卡
- **FR-005**: 查询结果必须按日期升序，且只返回请求者本人的记录
- **FR-006**: 系统必须为每次成功创建返回全局唯一的打卡 ID

### Key Entities

- **CheckIn（打卡记录）**：一次运动打卡；业务属性有打卡 ID、所属用户、打卡日期（服务器时区）、备注、创建时间；与用户为多对一关系
- **User（用户，v1 仅白名单预置）**：拥有零到多条打卡

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 用户完成一次打卡的 API 调用在正常负载下 p95 < 200ms
- **SC-002**: 验收场景 100% 有自动化测试覆盖且通过
- **SC-003**: 照 quickstart.md，新使用者 10 分钟内在本地跑通提交与查询

## Assumptions

- v1 为单机后端服务，不做注册/登录，用户来自预置白名单；鉴权由后续功能负责
- 部署时区固定 Asia/Shanghai；不支持用户自定义时区
- 备注为纯文本，v1 不支持图片
- 只提供 JSON HTTP API，不提供页面
