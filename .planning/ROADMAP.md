# Roadmap: GSD-CN 中文发行版与上游兼容层

## Milestones

- ✅ **v1.0 多语言本地化框架 MVP** — Phases 1-5 (shipped 2026-04-18)
- ✅ **v1.1 上游同步与安装产物本地化深化** — Phases 6-12 (shipped 2026-04-19)
- ✅ **v1.2 债务清理与 Claude Skills 本地化** — Phases 13-15 (shipped 2026-04-21)
- ⏸ **v1.3 上游持续同步与本地化框架维护** — Phases 16-18 (superseded as active mainline on 2026-04-23)
- ✅ **v2.0 GSD-CN 中文发行版基线** — Phases 19-20 (shipped 2026-04-24)
- ⏸ **v2.1 用户可见字符串本地化全量收口** — Phases 21-24 (paused; return after v2.2 planning)
- 🔄 **v2.2 发布前 npm/package 命名与安装体验收口** — Phases 25-28 (active)

## Phases

<details>
<summary>✅ v1.0 多语言本地化框架 MVP (Phases 1-5) — SHIPPED 2026-04-18</summary>

Full archive: `.planning/milestones/v1.0-ROADMAP.md`

</details>

<details>
<summary>✅ v1.1 上游同步与安装产物本地化深化 (Phases 6-12) — SHIPPED 2026-04-19</summary>

Full archive: `.planning/milestones/v1.1-ROADMAP.md`

</details>

<details>
<summary>✅ v1.2 债务清理与 Claude Skills 本地化 (Phases 13-15，含 14.1) — SHIPPED 2026-04-21</summary>

Full archive: `.planning/milestones/v1.2-ROADMAP.md`

</details>

<details>
<summary>⏸ v1.3 上游持续同步与本地化框架维护 (Phases 16-18) — SUPERSEDED AS ACTIVE MAINLINE</summary>

- Phase 16: 上游 v1.37-v1.38 受保护同步与保护验收 — completed 2026-04-21
- Phase 17: Sync 后本地化文件审计与 blocker suite 重验证 — completed 2026-04-21
- Phase 18: v1.3 证据链补齐与重新审计 — superseded by v2.0 active mainline on 2026-04-23

Notes:
- v1.3 交付成果继续保留为工程历史与复用基础
- v1.3 evidence-chain closure 不再作为当前主线目标

</details>

<details>
<summary>✅ v2.0 GSD-CN 中文发行版基线 (Phases 19-20) — SHIPPED 2026-04-24</summary>

- Phase 19: GSD-CN 产品定义与兼容边界锁定 — completed 2026-04-23; 178 focused tests pass
- Phase 20: GSD-CN install-brand E2E 闭环与 surface 残留清理 — completed 2026-04-24; 64 focused tests pass

Full archive: `.planning/milestones/v2.0-ROADMAP.md`
Requirements archive: `.planning/milestones/v2.0-REQUIREMENTS.md`
Audit archive: `.planning/milestones/v2.0-MILESTONE-AUDIT.md`

</details>

<details>
<summary>⏸ v2.1 用户可见字符串本地化全量收口 (Phases 21-24) — PAUSED</summary>

Paused because the user requested a release-prep milestone first. Return to this work after v2.2 planning/execution.

- Phase 21: 用户可见字符串 inventory 与分类基线
  - `21-01-PLAN.md` — scanner and surface map
  - `21-02-PLAN.md` — inventory triage
- Phase 22: installer/runtime 输出本地化补齐
  - `22-01-PLAN.md` — installer catalog closure
  - `22-02-PLAN.md` — runtime hooks closure
- Phase 23: commands/skills/agents/docs 文案本地化补齐
  - `23-01-PLAN.md` — command/skill metadata closure
  - `23-02-PLAN.md` — docs/templates closure
- Phase 24: 本地化治理 verifier 与默认路径验收
  - `24-01-PLAN.md` — localization verifier
  - `24-02-PLAN.md` — install-output acceptance gate

Current partial implementation evidence in working tree:
- Full `zh-CN` Claude skill display catalog coverage
- `zh-CN` runtime catalog residual English cleanup
- Claude localization governance upgraded from first-batch to full catalog coverage
- Focused validation: 33 tests passed / 0 failed

</details>

<details open>
<summary>🔄 v2.2 发布前 npm/package 命名与安装体验收口 (Phases 25-28) — ACTIVE</summary>

### Phase 25: npm/package identity 与命名策略锁定

**Goal:** 锁定 GSD-CN 发布包身份、bin/npx 命名、版本策略与文档口径，消除发布前命名歧义。

**Requirements:** PKG-01, PKG-02, PKG-03

**Plans:**
- `25-01-PLAN.md` — package metadata and naming audit
- `25-02-PLAN.md` — bin/npx command contract and docs alignment

**Success Criteria:**
- package identity 与 README/docs/install examples 一致
- official upstream 与 GSD-CN 中文发行版安装路径无歧义
- 版本策略与发布前检查规则明确可验证

### Phase 26: GSD-CN 安装体验与 official fallback 收口

**Goal:** 修正安装过程中的用户可见提示、错误路径、成功摘要、下一步指引与 official fallback 边界。

**Requirements:** PKG-04, PKG-05, PKG-06

**Plans:**
- `26-01-PLAN.md` — GSD-CN installer UX closure
- `26-02-PLAN.md` — official fallback and coexistence regression

**Success Criteria:**
- `--gsdcn` 默认路径呈现自然中文安装体验
- 无参 official 安装路径仍保持官方英文行为
- 错误/前置条件/冲突提示既中文可读又保留技术标识准确性

### Phase 27: npm pack artifact 与发布产物清单验收

**Goal:** 验证 npm 发布包内容完整且不夹带不应发布的规划、测试或临时产物。

**Requirements:** PKG-07

**Plans:**
- `27-01-PLAN.md` — npm pack artifact whitelist gate
- `27-02-PLAN.md` — packaged install smoke from tarball

**Success Criteria:**
- `npm pack --dry-run` 产物包含必要 runtime 文件
- 包内 bin 入口、locale catalogs、commands/agents/hooks/scripts/sdk 关键内容可用
- `.planning`、测试 fixture、临时文件不进入发布产物，除非显式需要

### Phase 28: 发布前 focused gate 与 checklist 固化

**Goal:** 建立发布前一键 focused gate，覆盖 metadata、pack、install smoke、coexistence 与 README drift。

**Requirements:** PKG-08

**Plans:**
- `28-01-PLAN.md` — pre-release focused gate
- `28-02-PLAN.md` — release checklist and evidence report

**Success Criteria:**
- 单一命令或清晰命令组可复现发布前验收
- gate 覆盖 GSD-CN 与 official 两条安装路径
- 发布前 evidence report 能支撑是否进入 tag/publish 决策

</details>

## Current Status

Active milestone: v2.2 发布前 npm/package 命名与安装体验收口. Start with `$gsd-plan-phase 25`.

v2.1 用户可见字符串本地化全量收口 is paused and should be resumed after v2.2 planning/execution as requested by the user.

## Progress

| Milestone | Phases | Plans | Status | Shipped |
|-----------|--------|-------|--------|---------|
| v1.0 多语言本地化框架 MVP | 1-5 | 18 | Shipped | 2026-04-18 |
| v1.1 上游同步与安装产物本地化深化 | 6-12 | 15 | Shipped | 2026-04-19 |
| v1.2 债务清理与 Claude Skills 本地化 | 13-15, 14.1 | 11 | Shipped | 2026-04-21 |
| v1.3 上游持续同步与本地化框架维护 | 16-18 | 5+ | Superseded | - |
| v2.0 GSD-CN 中文发行版基线 | 19-20 | 7 | Shipped | 2026-04-24 |
| v2.1 用户可见字符串本地化全量收口 | 21-24 | 8 | Paused | - |
| v2.2 发布前 npm/package 命名与安装体验收口 | 25-28 | 8 | Active | - |
