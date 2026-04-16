# Phase 02 High-Value Docs Priority

## 目标

本文件定义 Phase 02 首批高价值入口，锁定后续 README/docs 改造的先后顺序。优先级只覆盖 `en + zh-CN` 用户最先接触、最容易断链、最容易被 mirror drift 误导的入口，不把范围扩展为全量文档翻译。

## 高价值入口

1. 根 README 语言导航
   入口文件包括 `README.md`、`README.zh-CN.md`、`README.ja-JP.md`、`README.ko-KR.md`、`README.pt-BR.md`。
   这是仓库首屏入口，必须先统一语言矩阵，避免不同 locale 看到不同的可用语言集合。

2. `docs/README.md`
   这是英文 canonical docs index，也是所有 locale docs index 的结构事实源。
   任何 locale docs README 的职责、章节结构和信息架构都要先对齐这里。

3. `docs/zh-CN/README.md`
   这是首批 `zh-CN` 用户进入文档目录的关键入口。
   当前它存在 mirror target drift，优先级必须高于新增单篇中文文档，否则用户仍会被带回 root README 风格页面。

4. `docs/USER-GUIDE.md`
   这是英文用户路径文档，直接承接“README -> docs index -> usage path”链路。
   即使其他英文参考文档暂不做 locale 镜像，这个入口也必须在优先级中被显式锁定。

5. `docs/zh-CN/USER-GUIDE.md`
   这是首批 `zh-CN` 用户闭环中已经存在的高价值资产。
   Phase 02 的导航和 gap 表达应优先把它挂到 `docs/zh-CN/README.md` 的正确位置，而不是继续孤立存在。

## 证据基础

- `.planning/phases/02-canonical/02-DOCS-MIRROR-MATRIX.json` 显示 `docs/README.md` 是唯一完整的 canonical docs index。
- 同一矩阵显示 `docs/zh-CN/README.md` 当前不是 `docs/README.md` 的结构镜像，而是漂移为 root README 风格页面。
- `docs_catalog` 覆盖率表明 `zh-CN` 目前只有 `README.md` 与 `USER-GUIDE.md` 两个顶层核心文档，覆盖率为 `2/11`。
- `ja-JP`、`ko-KR`、`pt-BR` 已经接近 `10/11`，因此本阶段更需要优先修正 `en + zh-CN` 入口链路，而不是扩大全量翻译范围。

## 范围声明

- 不在本阶段追平 zh-CN 全量文档。
- 本阶段不承诺让 `ja-JP`、`ko-KR`、`pt-BR` 达到与 `en + zh-CN` 相同的导航改造深度。
- `docs/CONFIGURATION.md` 与 `docs/COMMANDS.md` 仍属于应在导航中可见的高价值英文参考，但它们在本阶段的职责是被正确暴露、被正确标记 gap，而不是立即产出完整 `zh-CN` 镜像。

## 交付优先顺序

1. 先统一根 README 语言导航矩阵，让入口语言集合稳定。
2. 再把 `docs/README.md` 与 `docs/zh-CN/README.md` 的 canonical/mirror 关系写实并实施。
3. 然后确保 `docs/USER-GUIDE.md` 与 `docs/zh-CN/USER-GUIDE.md` 被纳入对应 docs index 的首批可达路径。
4. 最后再用 gap 状态暴露 `docs/CONFIGURATION.md`、`docs/COMMANDS.md` 等尚未镜像的高价值英文文档。

## 对后续计划的约束

- 任何后续计划都不得绕过 `docs/README.md` 直接定义 locale docs index 结构。
- 任何后续计划都不得把“补翻译更多文档”替代“修正入口职责”。
- 任何后续计划如果新增 `zh-CN` 文档入口，必须先说明它如何服务 `README -> docs/README.md -> docs/zh-CN/README.md -> target doc` 这条链路。
