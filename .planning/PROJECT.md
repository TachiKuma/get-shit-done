# GSD-CN 中文发行版与上游兼容层

## What This Is

这是一个基于 `get-shit-done` 上游仓库维护的非官方简体中文发行版项目。

项目目标不是继续扩展“多语言本地化框架”本身，而是将当前仓库重定义为 `GSD-CN`：
- 面向中文用户提供默认 `zh-CN` 体验
- 保持与上游 GSD 的功能行为一致
- 通过 `gsdcn-*` / `$gsdcn-*` 命名空间与官方原版共存
- 仅在显示文案、注释、默认语言与命令前缀层面产生可见差异

## Current State

**Active: v2.2 — 发布前 npm/package 命名与安装体验收口 (2026-04-24)**

当前 `.planning` 主线已从“多语言本地化框架维护”切换为 `GSD-CN` 中文发行版主线。

**Current planning state:**
- v2.0 已完整执行并通过 milestone audit：Phase 19 + Phase 20，7/7 plans，requirements 7/7 satisfied
- `.planning-gsdcn` planning-root substrate、installer namespace 隔离、GSD-CN 中文主 README/docs、parity/coexistence blocker suite、`--gsdcn` install-brand activation 与 E2E evidence 均已落地
- v2.1 已创建为“用户可见字符串本地化全量收口”并有部分实现工作在当前 working tree 中；根据用户确认，先创建并推进发布前 v2.2，再回头完成 v2.1 未完成工作
- v2.2 当前目标：发布前收口 npm/package 命名、bin/npx 安装入口、安装体验、publish artifact 与 focused release gate
- v1.0-v1.2 的本地化与上游同步成果继续作为新主线的工程基础
- v1.3 证据链补齐工作不再作为当前主线目标，保留为 superseded milestone context

## Current Milestone: v2.2 发布前 npm/package 命名与安装体验收口

**Goal:** 发布前确保 GSD-CN 的 npm 包命名、安装入口、安装后体验、发布产物与回退边界一致、清晰、可验证，避免中文发行版上线时出现包名混淆、命令入口不一致或安装产物遗漏。

**Target features:**
- npm package identity 与 GSD-CN 中文发行版定位一致
- `npx` / `npm exec` / `node bin/install.js` 安装入口语义清晰
- `--gsdcn` / `--brand gsdcn` 激活路径默认呈现自然中文体验
- official 无参 fallback 路径保持上游兼容，不被 GSD-CN 文案污染
- npm pack 产物包含必要 runtime 文件且排除不应发布内容
- 发布前 focused gate 覆盖 metadata、pack、install smoke、coexistence 与 README drift

<details>
<summary>Paused v2.1 context to resume later</summary>

v2.1 用户可见字符串本地化全量收口已规划为 Phases 21-24，当前按用户确认暂停，待 v2.2 创建/推进后回头完成。

Known partial implementation evidence currently in working tree:
- Full `zh-CN` Claude skill display catalog coverage
- `zh-CN` runtime catalog residual English cleanup
- Claude localization governance upgraded from first-batch to full catalog coverage
- Focused validation: 33 tests passed / 0 failed

v2.1 must be resumed after v2.2 using the existing phase plan skeleton in ROADMAP.md.

</details>

<details>
<summary>Historical baseline retained from earlier work</summary>

- v1.0-v1.2 已完成多语言本地化框架、安装产物 locale contract、Claude/Codex display-layer、本地化治理与上游同步基础能力
- v1.3 曾聚焦上游持续同步与证据链补齐，但该方向已不再是当前主线
- 现有 locale catalogs、安装测试、governance 与文档镜像能力，将作为 `GSD-CN` 第一阶段的复用基础

</details>

## Core Value

中文用户可以直接通过 `GSD-CN` 获得默认简体中文体验，同时不牺牲上游行为一致性、官方 GSD 的共存能力和发布安装的可预测性。

## Requirements

### Validated Foundation

- ✓ 仓库已具备持续同步上游 `get-shit-done` 的工程基础
- ✓ `response_language` 传播链、locale catalog、installer locale contract 与 governance verifier 已存在，可作为 `GSD-CN` 的复用底座
- ✓ 首批 `zh-CN` 本地化资产、文档镜像与 installer display-layer contract 已经落地，避免从零开始
- ✓ 项目已验证“英文 canonical source + 本地化显示层”的工程分层可行，可直接复用于 `GSD-CN`
- ✓ v2.0 已验证 `--gsdcn` install-brand activation、namespace 隔离与 state-root E2E 可行

### Active (v2.2)

- PKG-01: npm package identity 必须明确区分官方 upstream 包与 GSD-CN 中文发行版
- PKG-02: CLI bin 名称与 `npx` 使用方式必须无歧义，并与 `--gsdcn` / `--brand gsdcn` 激活路径一致
- PKG-03: 发布版本与发布前 metadata 必须具备可审计策略
- PKG-04: GSD-CN 默认安装路径必须给出自然中文体验，并在错误、成功、下一步提示中使用 `gsdcn-*` / `$gsdcn-*`
- PKG-05: official GSD fallback 路径必须保持可用且不被 GSD-CN 文案污染
- PKG-06: 安装失败与环境前置条件提示必须面向中文用户可理解，同时保留技术标识准确性
- PKG-07: npm publish artifact 必须包含运行 GSD-CN 所需文件，且排除不应发布的规划/测试/临时产物
- PKG-08: 发布前必须提供一键 focused gate，覆盖 package metadata、pack dry-run、install smoke、GSD-CN/official coexistence 与 README install command drift

### Paused (v2.1)

- L10N-01..L10N-07: 用户可见字符串 inventory、分类、翻译、治理 verifier 与默认路径验收
- Resume after v2.2 per user instruction

### Out of Scope

- 实际执行 `npm publish`、`git push`、npm dist-tag 或发布 tag
  - 原因：需要单独发布决策确认
- 改变 GSD-CN 的核心行为语义
  - 原因：当前目标是命名、安装体验和发布产物边界，不是功能 fork
- 为发布前收口而大规模重写 installer/runtime 架构
  - 原因：优先修正命名、文案、metadata 与验证缺口
- 在当前里程碑内实现 `ja-JP`、`ko-KR`、`pt-BR` 等其他语言发行版
  - 原因：第一阶段只承诺 `zh-CN`
- 针对 CCB 的深度特化实现
  - 原因：仅作为 deferred roadmap item 记录，不进入当前 milestone scope

## Context

- 当前仓库来源于 `https://github.com/gsd-build/get-shit-done`
- 现有 package name 为 `get-shit-done-cc`，README 当前使用 `npx get-shit-done-cc@latest --gsdcn`
- 现有代码库已经具备 locale catalogs、README/docs 镜像、installer locale contract、governance verifier 与上游 sync 工作流
- `.planning/config.json` 当前启用了 `response_language: "zh"`，初始化时规范化为 `zh-CN`
- 新主线将复用已有中文词条和本地化资产，避免无必要的全量重翻
- 当前用户已明确要求：所有用户可见入口切换到 `gsdcn` 前缀，同时保持与官方原版共存

## Constraints

- **Behavior parity**: 除显示文案、注释、默认语言、命令前缀外，其他行为必须与上游保持一致
- **Coexistence**: 同机安装与同工作区切换都必须成立，且不得互相覆盖
- **Surface completeness**: `gsdcn` 前缀覆盖所有用户可见入口，不能只改 commands 或 docs
- **Package clarity**: npm package/bin/npx 命名必须避免让用户误以为安装了官方原版或错误 brand
- **Publish safety**: 发布前只做 dry-run、pack、smoke 与 checklist，不做真实 publish/push/tag
- **Minimal internal churn**: 非用户可见层尽量保持不动，除非为满足共存硬约束不得不调整
- **Reuse first**: 优先复用现有已中文化词条和本地化资产，避免重复翻译
- **Deferred CCB specialization**: CCB 仅作为后续路线项记录，不进入当前实现边界

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 项目主线从“多语言本地化框架”切换为 `GSD-CN` | 用户已明确要求以中文发行版为唯一主线，而不是继续扩张多语言框架 | ✓ Locked |
| `GSD-CN` 定位为“中文发行版 + 上游兼容层” | 既要服务中文用户，又不能失去对上游行为的稳定跟随能力 | ✓ Locked |
| 新主线作为当前项目的后续 milestone 延续，而不是独立新仓库规划 | 复用现有 `.planning`、历史 phase 与已交付的本地化基础设施 | ✓ Locked |
| 第一阶段只承诺 `zh-CN` | 控制范围，避免在项目重定义阶段引入多语言 scope creep | ✓ Locked |
| 所有用户可见入口统一切到 `gsdcn` 前缀 | 这是与官方 GSD 共存的显式边界，不允许半迁移 | ✓ Locked |
| 共存要求同时覆盖“同机安装”和“同工作区切换” | 只满足其中一种都会导致用户体验或工程边界不完整 | ✓ Locked |
| 行为差异仅允许出现在显示文案、注释、默认语言、命令前缀 | 保持 `GSD-CN` 仍然是上游兼容层，而不是行为分叉版 | ✓ Locked |
| v2.2 先于 v2.1 完成发布前收口 | 用户明确确认先创建新 milestone，再回头完成 v2.1 未完成工作 | ✓ Locked |
| 非用户可见层尽量保持不动 | 降低维护成本，减少未来同步上游时的冲突面 | ✓ Locked |
| CCB 特化仅记录为 deferred roadmap item | 避免远景方向污染第一阶段交付与验收边界 | ✓ Locked |

## Evolution

This document evolves at milestone and phase transitions.

**After each phase transition**:
1. Requirements validated? -> move them into validated foundation or milestone evidence
2. Requirements changed? -> update Active and Out of Scope
3. Compatibility or coexistence decisions changed? -> update Key Decisions immediately
4. Deferred items promoted? -> move them from deferred notes into Active scope

**After each milestone**:
1. Re-check whether `GSD-CN` is still a compatibility-layer product, not a behavior fork
2. Re-check whether `gsdcn` naming still covers all user-visible surfaces
3. Re-check whether npm/package naming still matches the published install path
4. Re-check whether deferred v2.1 localization, CCB and extra-language items should remain deferred or be resumed

---
*Last updated: 2026-04-24 — v2.2 requirements and roadmap defined for pre-release npm/package and install experience closure*
