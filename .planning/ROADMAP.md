# Roadmap: GSD 多语言本地化框架（首批 en + zh-CN）

## Milestones

- ✅ **v1.0 多语言本地化框架 MVP** — Phases 1-5 (shipped 2026-04-18)
- ✅ **v1.1 上游同步与安装产物本地化深化** — Phases 6-12 (shipped 2026-04-19)
- ✅ **v1.2 债务清理与 Claude Skills 本地化** — Phases 13-15 (shipped 2026-04-21)
- 🔄 **v1.3 上游持续同步与本地化框架维护** — Phases 16-17 (in progress)

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

### v1.3 上游持续同步与本地化框架维护 (Phases 16-17)

- [x] **Phase 16: 上游 v1.37-v1.38 受保护同步与保护验收** ✅ 2026-04-21
- [ ] **Phase 17: Sync 后本地化文件审计与 blocker suite 重验证**

## Phase Details

### Phase 16: 上游 v1.37-v1.38 受保护同步与保护验收

**Goal**: 将上游 v1.37-v1.38 的全部变更通过 clean-base integration worktree + WIP replay 安全合并到主工作树，并确认本地化成果无 regression

**Depends on**: Phase 15 (v1.2 完成态)

**Requirements**: SYNC-07, SYNC-08

**Success Criteria** (what must be TRUE):
  1. integration worktree 已成功拉取并应用上游 v1.37-v1.38 变更，主工作树未出现未审核的直接 merge commit
  2. WIP replay 完成后，`get-shit-done/locales/en/` 与 `get-shit-done/locales/zh-CN/` 两个 catalog 文件内容与 replay 前保持一致（受保护文件无意外覆盖）
  3. replay 完成后 `tests/` 目录结构与本地化回归测试文件内容与 replay 前保持一致
  4. `get-shit-done/references/localization-governance-surfaces.json` 在 WIP replay 后未被上游变更覆盖或截断
  5. `node scripts/verify-localization-governance.cjs` 输出 `blocker_failures=0`，post-sync 治理门控通过

**Plans**: 3 plans

Plans:
- [x] 16-01-PLAN.md — 冻结受保护文件 SHA 快照、生成 WIP 保护基线与 sync playbook ✅ 2026-04-21
- [x] 16-02-PLAN.md — 在 isolation worktree 执行 clean guarded upstream sync（68 commits）✅ 2026-04-21
- [x] 16-03-PLAN.md — WIP replay 推入主工作树，SHA 核查与 governance 验收（PARTIAL PASS）✅ 2026-04-21

**UI hint**: no

---

### Phase 17: Sync 后本地化文件审计与 blocker suite 重验证

**Goal**: 审计 sync 引入的上游变更对现有本地化覆盖文件的影响，按需刷新，并重新运行完整 blocker suite 确认 `blocker_failures=0, warning_failures=0`

**Depends on**: Phase 16

**Requirements**: LOC-01, LOC-02

**Success Criteria** (what must be TRUE):
  1. 已完成对 sync 后变更文件的审计，locale catalog 键漂移（新增/删除的 key）、governance manifest surface 增减与 workflow 模板格式变化均有明确记录（"无变化"也是有效结论）
  2. 若审计发现 catalog 键漂移或 surface 变化，已对受影响的 `en` / `zh-CN` catalog 文件与 governance manifest 执行刷新，且刷新后内容符合现有 pair-level fallback contract
  3. `node scripts/verify-localization-governance.cjs` 在刷新后输出 `blocker_failures=0, warning_failures=0`
  4. 首批 6-skill zh-CN + English fallback boundary regression suite（`72 passed / 0 failed` 基线）在刷新后重新运行，结果为 0 失败

**Plans**: TBD

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
| 17. Sync 后本地化文件审计与 blocker suite 重验证 | v1.3 | 0/TBD | Not started | - |
