# Data Model: 健身打卡 API

## 表：checkins

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| id | TEXT (uuid4 hex) | PRIMARY KEY | 全局唯一打卡 ID（FR-006） |
| user_id | TEXT | NOT NULL，外键 → users.id | 所属用户 |
| checkin_date | DATE | NOT NULL | 服务器 Asia/Shanghai 当天日期 |
| note | TEXT NULL | 长度 1–500（应用层校验） | 备注 |
| created_at | TIMESTAMP | NOT NULL DEFAULT now | 创建时间（UTC 存储） |

**索引/约束**：

- `UNIQUE(user_id, checkin_date)` —— 幂等的最终裁决（research R4），冲突 → HTTP 409
- `INDEX(user_id, checkin_date)` —— 覆盖 US2 的本人 + 范围查询

## 表：users（v1 白名单）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| id | TEXT | PRIMARY KEY | 形如 `u-1` |
| display_name | TEXT | NOT NULL | 展示名 |

v1 通过启动时读取 `users.yml` 预置；注册接口不在本功能范围。

## 日期语义

- `checkin_date` 是「Asia/Shanghai 的日历日」，与 `created_at`（UTC 时刻）分离存储；
- 查询参数 `date` / `start` / `end` 均为 `YYYY-MM-DD`，按同一日历日语义比较；
- 日历计算唯一入口：`src/checkin_api/clock.py::today_shanghai()`。

## 初始化与迁移

- v1 单文件 SQLite，启动时 `CREATE TABLE IF NOT EXISTS` 建表（无迁移框架）；
- 引入第二张需要演进的表时再评估迁移工具（写入后续 spec 的假设）。
