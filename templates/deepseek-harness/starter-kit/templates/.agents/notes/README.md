# Agent Notes（决策日志）

这里保存代码、测试和注释都带不走的东西：**为什么这么决定、放弃了什么**。它是写给后续每个会话（人和 AI）的 RFC。

## 目录与命名

```text
.agents/notes/
├── proposed/<category>/yyyy-mm-dd-topic.md      # 提案：实施前
├── implemented/<category>/yyyy-mm-dd-topic.md   # 已实施：与代码同步
└── rejected/<category>/yyyy-mm-dd-topic.md      # 已否决：仅当仍能防止一个诱人的错误时保留
```

- 日期 = 首次提出日期；实施后**移动文件夹**（不是复制），文件名日期不变。
- 类别六选一（封闭集合）：
  - `feature` 面向用户的新能力
  - `bug-fix` 缺陷修复
  - `simplification` 不增加能力地删除代码/行为
  - `architecture` 交付源码的结构决策
  - `process` 代码外围的工具/流程/策略
  - `testing` 测试基础设施与策略
- note 之间引用一律用相对 Markdown 链接；不要建 INDEX.md（目录结构本身就是索引）。

## 什么时候写

- 代码、测试、现有文档解释不了的**持久决策理由** → 写；同一提交里落盘。
- 纯机械改动、重命名、局部样式调整 → 豁免。
- 同一决策已有 note → 更新它，不新建。

## 文件格式

头部三行固定：

```markdown
# Agent Note: <标题>
Status: <proposed | implemented | rejected — 一行原因>
```

- proposed 骨架：`Problem → Proposal → Alternatives considered → Acceptance criteria → Risks`
- implemented 骨架：`Problem → Decision（现在时）→ Alternatives considered → Consequences`
- **Alternatives considered 必填**：只记录真实考虑过的方案与落选原因，不许事后编造。

## 三条维护规则

1. **事实可改，决策不可篡改**：代码移动/改名/改默认值时，同一提交同步 note 里的事实；反转决策要新开 note 并互相链接。
2. **新 note 必做取代检查**：搜同类旧 note；完全取代的同 PR 归档或删除，部分取代的交叉链接。
3. **去留判据看未来价值**：只描述小机械改动的 implemented note 直接删；有历史价值但不再指导未来的归档；仍能避免错误的保持活跃。

模板：[note-proposed.md](./note-proposed.md) · [note-implemented.md](./note-implemented.md)
