# Roadmap: GSD 多语言本地化框架（首批 en + zh-CN）

## Milestones

- ✅ **v1.0 多语言本地化框架 MVP** — Phases 1-5 (shipped 2026-04-18)
- ✅ **v1.1 上游同步与安装产物本地化深化** — Phases 6-12 (shipped 2026-04-19)
- 🚧 **v1.2 债务清理与 Claude Skills 本地化** — Phases 13-15 (in progress)

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

### 🚧 v1.2 债务清理与 Claude Skills 本地化 (In Progress)

**Milestone Goal:** 修复 v1.1 遗留的受控测试失败，并以首批重要 Claude skills 的 zh-CN display-layer 扩展本地化覆盖，建立 Claude skills locale catalog 架构与完整回归门控

- [ ] **Phase 13: 受控债务修复** — 修复 v1.1 路由的三类测试失败（Windows EPERM、hook regex 漂移、help text 漂移）
- [ ] **Phase 14: Claude Skills Locale Catalog 架构** — 建立 claude-skills locale catalog 文件结构、installer 接入与 fallback 合约
- [ ] **Phase 15: Claude Skills zh-CN 落地与验收收口** — 首批 zh-CN display copy、governance blocker 接入与回归测试门控

## Phase Details

### Phase 13: 受控债务修复
**Goal**: v1.1 遗留的三类受控测试失败全部消除，`npm test` 零失败（除已知 skip）
**Depends on**: Nothing (debt work, self-contained)
**Requirements**: FIX-01, FIX-02, FIX-03
**Success Criteria** (what must be TRUE):
  1. 在 Windows 环境下运行 `npm test`，afterEach teardown 不再抛出 EPERM 错误，临时目录清理路径干净退出
  2. aggregate hook guard 相关测试通过，hook regex 与 Phase 06 后的 i18n template 变更保持同步
  3. kilo-install help text 断言与上游 sync 后字符串一致，相关测试通过
  4. `npm test` 总失败数从 6 降至 0（skip 保持不变），无新增 regression
**Plans**: 2 plans

Plans:
- [ ] 13-01-PLAN.md — FIX-01：修复测试文件 afterEach fs.rmSync EPERM（bug-1736, bug-2248, helpers）
- [ ] 13-02-PLAN.md — FIX-02 + FIX-03：修复 install.js hook 警告 regex 漂移与 kilo help text 字面量

### Phase 14: Claude Skills Locale Catalog 架构
**Goal**: Claude skills locale catalog 文件结构就位，installer 接入 locale-aware display metadata 解析，fallback 合约经测试锁定
**Depends on**: Phase 13
**Requirements**: CLD-01, CLD-02, CLD-05
**Success Criteria** (what must be TRUE):
  1. `get-shit-done/locales/en/claude-skills.json` 与 `get-shit-done/locales/zh-CN/claude-skills.json` 文件存在，结构与 codex-skills catalog 对称
  2. `bin/install.js` 通过 `resolveClaudeSkillDisplayMetadata()` 解析 Claude skill display 文案，zh-CN locale 下安装的 Claude skill frontmatter 显示中文摘要
  3. 当 zh-CN catalog 缺少某 skill 条目时，installer 整对 fallback 到 English canonical，安装产物不出现中文 description + 英文 short-description（或反向）的混合 frontmatter
  4. fallback 合约有自动化测试锁定，混合 frontmatter 场景作为测试失败用例可被回归测试捕获
**Plans**: TBD
**UI hint**: no

### Phase 15: Claude Skills zh-CN 落地与验收收口
**Goal**: 首批重要 Claude skills 的 zh-CN display copy 完整落地，governance verifier 接入 Claude skills 承诺面，en + zh-CN install output 有自动化回归门控
**Depends on**: Phase 14
**Requirements**: CLD-03, CLD-04, QA-05
**Success Criteria** (what must be TRUE):
  1. 首批若干（体量类似 Codex 首批 6 个）最常用 GSD Claude skills 在 zh-CN locale 下安装后，frontmatter 的 description 与 short-description 均显示中文，skill body 与 adapter 保持英文
  2. governance verifier 针对 Claude skills zh-CN 承诺面运行时，缺失 zh-CN copy 的首批 skill 触发 verifier 非零退出码，对标 QA-04 的 Codex blocker 模式
  3. 自动化回归测试覆盖 en 与 zh-CN 两种 locale 下 Claude skills install output 的关键文案，installer fallback 到英文-only 时测试失败
  4. English fallback 路径在 en locale 下正常工作，en locale 安装产物全英文，无空白或乱码 frontmatter
**Plans**: TBD

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
| 13. 受控债务修复 | v1.2 | 0/2 | Not started | - |
| 14. Claude Skills Locale Catalog 架构 | v1.2 | 0/TBD | Not started | - |
| 15. Claude Skills zh-CN 落地与验收收口 | v1.2 | 0/TBD | Not started | - |
