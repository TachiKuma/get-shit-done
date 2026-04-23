# GSD-CN 中文发行版与上游兼容层

## What This Is

这是一个基于 `get-shit-done` 上游仓库维护的非官方简体中文发行版项目。

项目目标不是继续扩展“多语言本地化框架”本身，而是将当前仓库重定义为 `GSD-CN`：
- 面向中文用户提供默认 `zh-CN` 体验
- 保持与上游 GSD 的功能行为一致
- 通过 `gsdcn-*` / `$gsdcn-*` 命名空间与官方原版共存
- 仅在显示文案、注释、默认语言与命令前缀层面产生可见差异

## Current State

**Active: v2.0 — Phase 19 Complete (2026-04-23)**

当前 `.planning` 主线已从”多语言本地化框架维护”切换为 `GSD-CN` 中文发行版主线。

**Current planning state:**
- Phase 19 已完整执行并验证通过：4/4 plans，178 测试全部通过，verification passed
- `.planning-gsdcn` planning-root substrate、installer namespace 隔离、GSD-CN 中文主 README/docs、parity/coexistence blocker suite 均已落地
- v2.0 首个 milestone phase 完成，GSD-CN 产品定义与兼容边界已锁定
- v1.0-v1.2 的本地化与上游同步成果继续作为新主线的工程基础
- v1.3 证据链补齐工作不再作为当前主线目标，保留为 superseded milestone context

## Current Milestone: v2.0 GSD-CN 中文发行版基线

**Goal:** 将当前项目重定义为 `GSD-CN`，锁定中文发行版定位、上游兼容约束、共存边界与第一阶段交付范围，为后续 `discuss-phase`、`plan-phase` 和实施阶段提供稳定规格基线。

**Target features:**
- 仓库定位与对外叙事切换为 `GSD-CN`
- 所有用户可见入口统一切换到 `gsdcn` 前缀
- `zh-CN` 成为默认显示语言，同时保留国际化扩展接口
- 官方 `GSD` 与 `GSD-CN` 支持同机共存、同仓库/同工作区切换使用
- 除显示层、注释、默认语言、命令前缀外，其余行为与上游保持一致

<details>
<summary>Historical baseline retained from earlier work</summary>

- v1.0-v1.2 已完成多语言本地化框架、安装产物 locale contract、Claude/Codex display-layer、本地化治理与上游同步基础能力
- v1.3 曾聚焦上游持续同步与证据链补齐，但该方向已不再是当前主线
- 现有 locale catalogs、安装测试、governance 与文档镜像能力，将作为 `GSD-CN` 第一阶段的复用基础

</details>

## Core Value

中文用户可以直接通过 `GSD-CN` 获得默认简体中文体验，同时不牺牲上游行为一致性与官方 GSD 的共存能力。

## Requirements

### Validated Foundation

- ✓ 仓库已具备持续同步上游 `get-shit-done` 的工程基础
- ✓ `response_language` 传播链、locale catalog、installer locale contract 与 governance verifier 已存在，可作为 `GSD-CN` 的复用底座
- ✓ 首批 `zh-CN` 本地化资产、文档镜像与 installer display-layer contract 已经落地，避免从零开始
- ✓ 项目已验证“英文 canonical source + 本地化显示层”的工程分层可行，可直接复用于 `GSD-CN`

### Active (v2.0)

- CN-01: 项目必须明确定位为 `GSD-CN`，并在 `.planning`、README 叙事与后续 phase 中以“中文发行版 + 上游兼容层”为唯一主线
- CN-02: 第一阶段只承诺 `zh-CN` 中文发行版落地；其他语言支持全部延后
- CN-03: 所有用户可见入口必须统一使用 `gsdcn` 前缀，包括命令、skills、workflows、tools、安装入口、文档示例与生成产物引用
- CN-04: 官方 `GSD` 与 `GSD-CN` 必须支持同机共存且互不覆盖
- CN-05: 官方 `GSD` 与 `GSD-CN` 必须支持同仓库/同工作区切换使用
- CN-06: 除显示文案、注释、默认语言、命令前缀外，其余行为必须与上游保持一致
- CN-07: 第一阶段必须提供独立于官方原版的中文安装方式与差异说明

### Out of Scope

- 在当前里程碑内实现 `ja-JP`、`ko-KR`、`pt-BR` 等其他语言发行版
  - 原因：第一阶段只承诺 `zh-CN`
- 对上游功能行为进行增强、删减或产品级分叉
  - 原因：当前目标是中文发行版，不是独立功能 fork
- 为了“中文化”而大规模调整非用户可见的内部模块结构
  - 原因：与“行为保持一致”和“低冲突维护上游兼容层”相冲突
- 针对 CCB 的深度特化实现
  - 原因：仅作为 deferred roadmap item 记录，不进入当前 milestone scope
- 立即向上游仓库提交 PR
  - 原因：当前定位已明确为非官方发行版

## Context

- 当前仓库来源于 `https://github.com/gsd-build/get-shit-done`
- 现有代码库已经具备 locale catalogs、README/docs 镜像、installer locale contract、governance verifier 与上游 sync 工作流
- `.planning/config.json` 当前启用了 `response_language: "zh"`，初始化时规范化为 `zh-CN`
- 新主线将复用已有中文词条和本地化资产，避免无必要的全量重翻
- 当前用户已明确要求：所有用户可见入口切换到 `gsdcn` 前缀，同时保持与官方原版共存

## Constraints

- **Behavior parity**: 除显示文案、注释、默认语言、命令前缀外，其他行为必须与上游保持一致
- **Coexistence**: 同机安装与同工作区切换都必须成立，且不得互相覆盖
- **Surface completeness**: `gsdcn` 前缀覆盖所有用户可见入口，不能只改 commands 或 docs
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
3. Re-check whether deferred CCB and extra-language items should remain deferred

---
*Last updated: 2026-04-23 — v2.0 Phase 19 execution complete; 178 tests pass, verification passed*
