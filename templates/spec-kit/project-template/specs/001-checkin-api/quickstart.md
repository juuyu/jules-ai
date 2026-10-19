# Quickstart: 健身打卡 API

> 本文档的每条命令必须被实际执行过；跑不通先修文档或代码，不保留未验证步骤。

## 1. 准备

```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

## 2. 启动

```bash
uvicorn src.checkin_api.main:app --reload
```

预置白名单用户：`u-1`（小明）、`u-2`（小红），来自 `users.yml`。

## 3. 手动验证两条主路径

```bash
# 提交打卡（US1）
curl -s -X POST localhost:8000/check-ins \
  -H 'Content-Type: application/json' \
  -d '{"user_id":"u-1","note":"晨跑 5km"}'

# 再提交一次 → 409
curl -i -X POST localhost:8000/check-ins \
  -H 'Content-Type: application/json' \
  -d '{"user_id":"u-1"}'

# 查询（US2）
curl -s 'localhost:8000/check-ins?user_id=u-1&date=2026-10-19'
```

## 4. 自动化测试

```bash
pytest -q
```

预期：contract 与 integration 全部通过。测试通过替换时钟函数注入日期，不依赖运行环境时区。
