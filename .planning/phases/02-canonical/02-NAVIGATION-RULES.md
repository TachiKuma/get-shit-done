# Phase 02 Navigation Rules

## 目的

本文件定义 root README、docs index、canonical source、locale mirror 与 gap 暴露的统一规则。后续 `02-02`、`02-03` 只能在这些规则之内实施，不得重新解释入口职责。

## 规则 1: root README 的职责

- `root README` 指 `README.md` 与各 `README.<locale>.md`。
- `root README` 负责仓库级入口：价值主张、安装、快速开始、命令概览和跨语言入口。
- `root README` 可以直接链接高价值文档，但不能承担 docs index 的完整目录职责。

## 规则 2: docs index 的职责

- `docs index` 指 `docs/README.md` 与各 `docs/<locale>/README.md`。
- `docs index` 负责文档目录入口：文档分类、面向读者的索引、Quick Links、以及 mirror/gap 状态暴露。
- `docs/README.md` 是唯一 canonical docs index，其他 locale docs index 只能作为 mirror。

## 规则 3: canonical / mirror 关系

- `docs/README.md` 是 canonical source。
- `docs/zh-CN/README.md`、`docs/ja-JP/README.md`、`docs/ko-KR/README.md`、`docs/pt-BR/README.md` 都属于 mirror。
- mirror 允许本地化文案，但章节结构、链接职责、文档分组和状态标签必须对齐 canonical。
- 当前 `docs/zh-CN/README.md` 被认定为 mirror drift，后续修正必须以对齐 `docs/README.md` 为目标，而不是继续贴近 `README.zh-CN.md`。

## 规则 4: gap 状态标签

- `已同步`：locale 页面或目标文档已存在，并且职责与 canonical 对齐。
- `暂缺`：canonical 文档存在，但该 locale 尚未提供对应镜像。
- `回退英文`：当前入口可继续访问英文 canonical 文档，但必须明确告知用户这是 fallback，不得伪装为 locale 已同步。

## 规则 5: 链路表达

- `root README` 的语言导航必须先暴露可用 locale 集合，再把用户导向适合其语言的 docs index 或高价值文档。
- `docs index` 必须显示 canonical 与 mirror 的关系，而不是只罗列链接。
- 当 `docs/zh-CN/README.md` 指向 `docs/USER-GUIDE.md`、`docs/COMMANDS.md` 或 `docs/CONFIGURATION.md` 等英文页面时，必须显式使用 `回退英文` 状态。

## 规则 6: 高价值入口优先

- `docs/README.md`、`docs/zh-CN/README.md`、`docs/USER-GUIDE.md`、`docs/zh-CN/USER-GUIDE.md` 属于首批必须打通的路径。
- 根 README 语言导航属于高价值入口的一部分，因此 root/docs 两层入口必须一起校对。
- `docs/COMMANDS.md` 与 `docs/CONFIGURATION.md` 在本阶段可以维持英文 canonical，但不能在导航中消失。

## 规则 7: scope 约束

- 本阶段不以“补齐全部 locale 文档”为完成条件。
- 本阶段不在 `docs/zh-CN/` 之外大规模重写 `ja-JP`、`ko-KR`、`pt-BR` 的内容。
- 任何后续实现如果扩大为全量翻译，都应视为超出本文件定义的 canonical/mirror 导航范围。

## 规则 8: 事实优先于口头认知

- 覆盖状态必须以 `.planning/phases/02-canonical/02-DOCS-MIRROR-MATRIX.json` 为准。
- 如果 `docs/README.md` 与某个 locale docs index 的结构再次漂移，应先更新矩阵事实，再做导航实现。
- 后续计划不得假设 `zh-CN` 与其他 locale 的覆盖度相同；必须根据矩阵中的 `已同步`、`暂缺`、`回退英文` 状态设计导航。
