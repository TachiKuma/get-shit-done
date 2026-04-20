# Milestones

## v1.2 债务清理与 Claude Skills 本地化 (Shipped: 2026-04-21)

**Phases completed:** 4 phases (Phases 13-15，含 14.1), 11 plans

**Key accomplishments:**

1. 修复 Windows 本地安装回归测试清理路径，关闭 `bug-1736` / `bug-2248` 的 EPERM teardown 问题
2. 修复 installer hook guard regex 与 Kilo help text 的源码字符串漂移，关闭 `bug-1754` / `kilo-install`
3. 建立 `claude-skills` locale catalog 的 English baseline、首批 6-skill `zh-CN` skeleton 与 pair-level fallback contract
4. 为 Claude/Qwen shared converter 与真实安装产物补齐 locale-aware regression coverage，锁定 `zh-CN` 命中、English fallback、partial locale 不混语与 stale overwrite
5. 通过受保护的 clean-base sync + WIP replay 与 `upstream/main` 最新源码对齐，并刷新 Phase 15 输入面
6. 将 Claude 首批 6-skill `zh-CN` 承诺面接入 governance blocker 与 install-output gates，同时为 synced remainder 锁定 English fallback boundary

**Archive:** `.planning/milestones/v1.2-ROADMAP.md`

---

## v1.1 上游同步与安装产物本地化深化 (Shipped: 2026-04-19)

**Phases completed:** 7 phases (Phases 6-12), 15 plans

**Key accomplishments:**

1. 通过隔离 integration worktree 安全合并 upstream/main，三阶段 blocker 验证全部通过，首批 en+zh-CN 本地化成果无 regression（Phase 06）
2. 建立 `codex-skills` 独立 locale namespace、English canonical catalog 与 strict English fallback 规则，明确 installer display-layer contract（Phase 07）
3. 首批 6 个 Codex skills（new-milestone, progress, discuss-phase, plan-phase, execute-phase, next）的 zh-CN display-layer 落地，真实安装验证通过（Phase 08）
4. 正式文档区分运行时 `response_language` 与安装产物 display-layer 两条本地化链路，Codex 承诺面接入 governance blocker（Phase 09）
5. 清除 installer banner 噪音与误导性 `.claude` path warning，首批 6 技能 scope boundary 固化为可测试 contract（Phase 10）
6. 全套 post-sync 测试债务完成分类，7 项确定性修复完成，6 个残余失败全部受控路由 v1.2 backlog（Phase 11-12）

**Known deferred items at close:** 4 (see STATE.md Deferred Items)
- `residual-environment`: bug-1736, bug-2248 → v1.2 Windows install cleanup
- `residual-test-drift`: bug-1754, kilo-install → v1.2 installer test drift cleanup

**Archive:** `.planning/milestones/v1.1-ROADMAP.md`

---

## v1.0 多语言本地化框架 MVP (Shipped: 2026-04-17)

**Phases completed:** 5 phases, 18 plans, 37 tasks

**Key accomplishments:**

- 为 Phase 01 建立了 pre-rewrite planning baseline，并把 `.planning` 核心 canon 统一纠偏为多语言本地化框架口径。
- 完成了用户可见本地化表面盘点，并把 planning/code drift 锚定到 preserved baseline，而不是活体文档。
- 把 Phase 01 的研究与审计收束成了可执行的本地化架构 contract、风险表和 Phase 02-05 路线图。
- 把 docs 覆盖矩阵、高价值入口优先级和 canonical/mirror 导航规则固定成了 Phase 02 的唯一事实基线。
- 统一了五个 root README 的语言矩阵，并把 `docs/zh-CN/README.md` 重建为承认英文 canonical 与中文 fallback 边界的 docs index 镜像页。
- 把 `ja-JP`、`ko-KR`、`pt-BR` docs index 统一到同一套 canonical/fallback 规则下，并留下可复查的链接与 mirror 验证记录。
- 把 runtime locale 覆盖缺口、fixed-string 热点和 canonical locale/fallback contract 固定成了 Phase 03 后续实现的唯一事实源。
- 把 `response_language` 从自由文本透传收束为 canonical locale，并让主闭环与 `progress` 入口共享同一套 runtime propagation 规则。
- 建立了 `runtime` locale catalog baseline，并把 `response_language` 的用户文档与内部 reference 收束到同一套 canonical locale contract。
- 把 Phase 03 的 locale runtime 回归检查收束成了单一 smoke 命令，并生成了区分 automated 结果与人工待检项的 regression report。
- Established the Phase 04 fact base for command-summary localization and template/report asset governance without expanding into command source translation.
- Shipped a localized docs command-summary layer: `zh-CN` now has first-batch command guidance, and `ja-JP` / `ko-KR` / `pt-BR` all converge on the same minimal fallback skeleton.
- Established first-batch locale asset catalogs, documented the fixed-string vs generated-content boundary in canonical templates/workflows, and added automated regression coverage for command summaries and template assets.
- Manifest-backed locale governance with first-batch blocker boundaries, warning-only summary locales, and a unified verification command
- Minimal localization governance glossary and mirror update playbook tied to config contracts and smoke verification
- Localization drift policy plus a unified governance gate that reuses runtime and asset smoke checks while enforcing blocker-only exit semantics for first-batch surfaces
- Manifest-driven governance verification with real process-level regression coverage, explicit warning disclosure checks, and synchronized Phase 05 validation metadata
- Fail-fast governance verifier topology, split command-summary blocker or warning routing, and automated planning-config truth-source drift protection

---
