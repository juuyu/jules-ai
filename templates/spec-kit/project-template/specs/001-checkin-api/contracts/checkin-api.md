# Contract: Check-in HTTP API

Base URL: `http://localhost:8000`
Content-Type: 所有请求与响应均为 `application/json; charset=utf-8`
时间/日期：打卡日期由服务器按 Asia/Shanghai 写入；请求体不接受任何日期字段。

## POST /check-ins —— §201（US1 AS-1）

请求：

```json
{ "user_id": "u-1", "note": "晨跑 5km" }
```

- `user_id`：string，必填，必须存在于白名单
- `note`：string，可选，1–500 字符

成功响应 `201 Created`：

```json
{
  "id": "9f1c...e2",
  "user_id": "u-1",
  "checkin_date": "2026-10-19",
  "note": "晨跑 5km",
  "created_at": "2026-10-19T01:12:30Z"
}
```

### §409（US1 AS-2）—— 同日重复

同一 `user_id` 在该 `checkin_date` 已有记录：

```json
{ "error": "already_checked_in", "checkin_date": "2026-10-19" }
```

不写入第二条记录。

### §422（US1 AS-3 与 Edge Cases）—— 请求不合法

任一则返回 422 且不写存储：

- 请求体非合法 JSON 或缺 `user_id`
- `user_id` 不在白名单
- `note` 长度 > 500
- 请求体携带任何日期字段（防止客户端指定日期，research R3）

错误体：`{ "error": "validation_failed", "details": [ { "field": "...", "reason": "..." } ] }`

## GET /check-ins —— §200-range（US2 AS-1）

查询某用户的打卡，支持两种参数形态（互斥规则：`date` 不与 `start`/`end` 同用）：

```
GET /check-ins?user_id=u-1&start=2026-10-01&end=2026-10-03
```

- 区间为闭区间；响应按 `checkin_date` 升序
- 200：`{ "items": [ { …打卡对象… }, … ] }`

### §200-date（US2 AS-2）

```
GET /check-ins?user_id=u-1&date=2026-10-02
```

等价于 `start=end=2026-10-02`；无记录时 `items` 为空数组。

### §isolation（US2 AS-3）

`user_id` 是必填查询参数；响应只包含该用户的记录，服务端不提供任何跨用户查询途径。

### §422-range（US2 AS-4）

- `start` 晚于 `end`、日期格式非 `YYYY-MM-DD`、`date` 与区间参数混用、缺 `user_id` → 422
- 错误体同 POST §422 的结构

## 非目标（Non-goals）

- 无鉴权头（白名单见 data-model.md；鉴权属后续功能）
- 无 DELETE/PUT、无分页、无批量端点
