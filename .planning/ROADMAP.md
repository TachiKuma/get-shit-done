# Roadmap: GSD-CN 中文发行版与上游兼容层

## Milestones

- ✅ **v1.0 多语言本地化框架 MVP** — Phases 1-5 (shipped 2026-04-18)
- ✅ **v1.1 上游同步与安装产物本地化深化** — Phases 6-12 (shipped 2026-04-19)
- ✅ **v1.2 债务清理与 Claude Skills 本地化** — Phases 13-15 (shipped 2026-04-21)
- ⏸ **v1.3 上游持续同步与本地化框架维护** — Phases 16-18 (superseded as active mainline on 2026-04-23)
- 🔄 **v2.0 GSD-CN 中文发行版基线** — starting at Phase 19

## Phases

<details>
<summary>✅ v1.0 多语言本地化框架 MVP (Phases 1-5) — SHIPPED 2026-04-18</summary>

- [x] Phase 1: 多语言本地化框架基线与差距审计 (3/3 plans) — completed 2026-04-16
- [x] Phase 2: Canonical 文档镜像与语言导航统一 (3/3 plans) — completed 2026-04-16
- [x] Phase 3: 运行时 locale 传播与固定文案体系落地 (4/4 plans) — completed 2026-04-17
- [x] Phase 4: 用户可见资产本地化策略落地 (3/3 plans) — completed 2026-04-17
- [x] Phase 5: 覆盖率检查、传播回归与治理机制 (5/5 plans) — completed 2026-04-18

Full archive: `.planning/milestones/v1.0-ROADMAP.md`

</details>

<details>
<summary>✅ v1.1 上游同步与安装产物本地化深化 (Phases 6-12) — SHIPPED 2026-04-19</summary>

- [x] Phase 6: Upstream sync 与本地化保护基线 (2/2 plans) — completed 2026-04-18
- [x] Phase 7: Installer locale contract 与 display-layer 基线 (2/2 plans) — completed 2026-04-18
- [x] Phase 8: Codex skill 入口本地化落地 (2/2 plans) — completed 2026-04-18
- [x] Phase 9: Docs、测试与治理收口 (2/2 plans) — completed 2026-04-18
- [x] Phase 10: Codex installer debt 收口 (2/2 plans) — completed 2026-04-18
- [x] Phase 11: Post-sync full-suite 测试债务清理 (2/2 plans) — completed 2026-04-18
- [x] Phase 12: v1.1 归档阻断项收口 (3/3 plans) — completed 2026-04-19

Full archive: `.planning/milestones/v1.1-ROADMAP.md`

</details>

<details>
<summary>✅ v1.2 债务清理与 Claude Skills 本地化 (Phases 13-15，含 14.1) — SHIPPED 2026-04-21</summary>

- [x] Phase 13: 受控债务修复 (2/2 plans) — completed 2026-04-20
- [x] Phase 14: Claude Skills Locale Catalog 架构 (3/3 plans) — completed 2026-04-20
- [x] Phase 14.1: 与上游最新源码完全对齐并保护现有多语言进度 (3/3 plans, INSERTED) — completed 2026-04-20
- [x] Phase 15: Claude Skills zh-CN 落地与验收收口 (3/3 plans) — completed 2026-04-21

Full archive: `.planning/milestones/v1.2-ROADMAP.md`

</details>

<details>
<summary>⏸ v1.3 上游持续同步与本地化框架维护 (Phases 16-18) — SUPERSEDED AS ACTIVE MAINLINE</summary>

- [x] Phase 16: 上游 v1.37-v1.38 受保护同步与保护验收 — completed 2026-04-21
- [x] Phase 17: Sync 后本地化文件审计与 blocker suite 重验证 — completed 2026-04-21
- [ ] Phase 18: v1.3 证据链补齐与重新审计 — superseded by v2.0 active mainline on 2026-04-23

Notes:
- v1.3 交付成果继续保留为工程历史与复用基础
- v1.3 evidence-chain closure 不再作为当前主线目标

</details>

### v2.0 GSD-CN 中文发行版基线

- [x] **Phase 19: GSD-CN 产品定义与兼容边界锁定** — completed 2026-04-23; 178 tests pass, execute gate declared

## Phase Details

### Phase 19: GSD-CN 产品定义与兼容边界锁定

**Goal**: 将项目正式重定义为 `GSD-CN` 中文发行版，锁定第一阶段范围、`gsdcn` 用户可见入口命名规则、上游行为兼容边界与官方 GSD 共存约束，为后续 discuss/planning 提供稳定规格基线

**Depends on**: Phase 15 delivered localization foundation; superseded v1.3 sync context remains reusable background

**Requirements**: CN-01, CN-02, CN-03, CN-04, CN-05, CN-06, CN-07

**Success Criteria** (what must be TRUE):
  1. `.planning` 活跃文档明确以 `GSD-CN` 中文发行版作为唯一主线，不再将“多语言本地化框架”视为当前目标
  2. 第一阶段范围被锁定为 `zh-CN` 中文发行版，其他语言与 CCB 特化被明确标记为 deferred / out of scope
  3. 所有用户可见入口的 `gsdcn` 前缀要求被明文化，覆盖命令、skills、workflows、tools、安装入口、文档示例与生成产物引用
  4. 官方 `GSD` 与 `GSD-CN` 的同机共存、同工作区切换与互不覆盖约束被写成硬 requirement
  5. 行为一致性边界被写成硬 requirement：仅允许显示文案、注释、默认语言、命令前缀变化
  6. `19-SPEC.md` 已存在，并足够支持 `/gsd-discuss-phase 19` 继续讨论“如何实现”

**Plans**:
- [x] `19-01-PLAN.md` — planning-root substrate：为 `GSD-CN` 建立 `.planning-gsdcn` 状态根，并让 CLI / SDK / workstream / project 路由保持一致
- [x] `19-02-PLAN.md` — installer/runtime namespace：落地 `gsdcn` 前缀、安装级命名空间隔离与同机共存
- [x] `19-03-PLAN.md` — README/docs/help surfaces：切换中文主叙事、`gsdcn` 用户入口与第一阶段 `zh-CN` 边界说明
- [x] `19-04-PLAN.md` — parity/coexistence regression gate：建立 focused blocker suite（28 tests），并刷新 inventory/manifests；focused full suite 178 tests pass

**UI hint**: no

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. 多语言本地化框架基线与差距审计 | v1.0 | 3/3 | Complete | 2026-04-16 |
| 2. Canonical 文档镜像与语言导航统一 | v1.0 | 3/3 | Complete | 2026-04-16 |
| 3. 运行时 locale 传播与固定文案体系落地 | v1.0 | 4/4 | Complete | 2026-04-17 |
| 4. 用户可见资产本地化策略落地 | v1.0 | 3/3 | Complete | 2026-04-17 |
| 5. 覆盖率检查、传播回归与治理机制 | v1.0 | 5/5 | Complete | 2026-04-18 |
| 6. Upstream sync 与本地化保护基线 | v1.1 | 2/2 | Complete | 2026-04-18 |
| 7. Installer locale contract 与 display-layer 基线 | v1.1 | 2/2 | Complete | 2026-04-18 |
| 8. Codex skill 入口本地化落地 | v1.1 | 2/2 | Complete | 2026-04-18 |
| 9. Docs、测试与治理收口 | v1.1 | 2/2 | Complete | 2026-04-18 |
| 10. Codex installer debt 收口 | v1.1 | 2/2 | Complete | 2026-04-18 |
| 11. Post-sync full-suite 测试债务清理 | v1.1 | 2/2 | Complete | 2026-04-18 |
| 12. v1.1 归档阻断项收口 | v1.1 | 3/3 | Complete | 2026-04-19 |
| 13. 受控债务修复 | v1.2 | 2/2 | Complete | 2026-04-20 |
| 14. Claude Skills Locale Catalog 架构 | v1.2 | 3/3 | Complete | 2026-04-20 |
| 14.1 与上游最新源码完全对齐并保护现有多语言进度 | v1.2 | 3/3 | Complete | 2026-04-20 |
| 15. Claude Skills zh-CN 落地与验收收口 | v1.2 | 3/3 | Complete | 2026-04-21 |
| 16. 上游 v1.37-v1.38 受保护同步与保护验收 | v1.3 | 3/3 | Complete | 2026-04-21 |
| 17. Sync 后本地化文件审计与 blocker suite 重验证 | v1.3 | 2/2 | Complete | 2026-04-21 |
| 18. v1.3 证据链补齐与重新审计 | v1.3 | 0/TBD | Superseded | - |
| 19. GSD-CN 产品定义与兼容边界锁定 | v2.0 | 4/4 | Complete | 2026-04-23 |
