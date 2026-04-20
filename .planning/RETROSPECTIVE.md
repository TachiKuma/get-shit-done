# Retrospective

## Milestone: v1.0 — 多语言本地化框架 MVP

**Shipped:** 2026-04-18
**Phases:** 5 | **Plans:** 18 | **Tasks:** 37

### What Was Built

- Phase 01: pre-rewrite planning baseline + multilingual framing 纠偏，从"全面简中化"升级为"多语言本地化框架"
- Phase 02: 五语言 root README 矩阵统一，所有 locale docs index 采用 canonical/mirror/gap disclosure 模式
- Phase 03: 集中式 `locale.cjs` helper + `response_language` 规范化为 BCP 47 canonical locale，priority workflow 传播链路扩展
- Phase 04: `docs/<locale>/COMMANDS.md` 命令摘要层 + `assets` locale catalog + 模板 fixed-string 边界契约与自动回归
- Phase 05: manifest-backed locale governance（blocker/warning/deferred）、glossary、sync playbook、drift policy、unified verifier、config truth-source 自动检测

### What Worked

- **Classification before implementation**: 每个 phase 都先固定机器可读的分类文件（inventory JSON、manifest JSON）再动实现，避免了范围蔓延
- **Verification scripts 作为 first-class deliverable**: 每个 phase 都交付了可重复执行的 smoke verifier，使后续 phase 能直接复用而不重写
- **TDD gate on Phase 05**: RED → GREEN commit 对强制先写失败用例，有效防止了"测试只验证实现已有逻辑"的陷阱
- **Manifest-driven governance**: 把 blocker/warning/deferred 收敛进单一 JSON 后，tests 和 verifier 不再维护两套分类，极大减少了漂移风险

### What Was Inefficient

- **Phase 01-04 缺乏 VALIDATION.md**: 前四个 phase 的 Nyquist 合规性只有 PARTIAL 或 MISSING，技术债累积到 milestone audit 才被集中发现；下个 milestone 应该把 VALIDATION.md 作为 phase 完成的必须条件
- **commit_docs: false 与 .planning gitignore**: planning artifacts 不进入 git 历史，导致 phase 完成后的状态只能通过本地文件判断，增加了 milestone audit 的工作量
- **State.md 和 Roadmap.md 的手工 progress tracking**: plans/phases 进度在 STATE.md 中手工维护，容易与实际 SUMMARY 落盘状态不一致

### Patterns Established

- **Manifest-first governance**: 任何需要分类的治理表面（blocker/warning/deferred）先写 JSON manifest，再让测试和 verifier 读取，不能靠硬编码字符串
- **Smoke script composition**: 新 phase 的 verifier 应该组合已有 smoke scripts，而不是重写检查逻辑
- **Docs drift gets a test**: 配置文档的口径一致性必须由测试守住（`response-language-docs.test.cjs`），不能只靠 review
- **Fail-fast manifest preflight**: verifier 在启动阶段先校验 manifest 拓扑（如 mixed-disposition shared entry），再执行 subprocess

### Key Lessons

- 治理机制的范围必须提前明确锁死（首批 en + zh-CN 的 blocker boundary），否则每次 phase review 都会出现"应不应该把 X 升级为 blocker"的讨论
- `planning-config.md` 这类手工维护的文档需要 machine-readable truth-source + 自动漂移检测，而不是依赖维护者记忆
- v2 要考虑把 VALIDATION.md 作为 execute-phase 工作流的必须产出，而不是可选的 audit 触发项

### Cost Observations

- Phase 05: 80 min total (22+10+4+30+14 min across 5 plans)
- Phase 01-04: 各 phase 25-80 min 估计（基于 SUMMARY 记录）
- Notable: Phase 03-04 执行速度极快（3-17 min/plan），因为 Phase 01-02 已经把分类和边界锁死

---

## Milestone: v1.1 — 上游同步与安装产物本地化深化

**Shipped:** 2026-04-19
**Phases:** 7 (Phases 6-12) | **Plans:** 15

### What Was Built

- Phase 06: 通过隔离 integration worktree 安全合并 upstream/main，三阶段 blocker 验证通过，首批 en+zh-CN 无 regression
- Phase 07: 独立 `codex-skills` locale namespace + English canonical catalog + install-time locale resolution + focused contract tests
- Phase 08: 首批 6 个 Codex skills 的 `zh-CN` display-layer 落地（`locales/zh-CN/codex-skills.json`），真实安装 spot-check 确认中文 frontmatter 生效
- Phase 09: 正式文档区分双本地化链路（runtime `response_language` vs installer display-layer），Codex blocker surfaces 接入 governance manifest
- Phase 10: `GSD_TEST_MODE` installer banner 静默、误导性 `.claude` path warning 消除，6-skill scope boundary 固化为可测试 contract
- Phase 11: post-sync 全套测试债务分类完成（baseline → classify → fix → route residuals），7 项确定性修复，6 个残余路由 v1.2
- Phase 12: Phase 10/11 VALIDATION.md 补齐、Phase 11 VERIFICATION.md 新建、roadmap/state bookkeeping 回写，re-audit 通过

### What Worked

- **Isolated worktree for upstream merge**: Phase 06 的三阶段验证协议（pre-sync / integration worktree / post-landing）有效防止了本地化 regression 静默通过
- **Independent namespace for install-time locale**: `codex-skills` 与 `runtime` catalog 分离，避免了两个链路相互污染，也让 Phase 07-09 的 scope 非常清晰
- **Baseline-first debt cleanup**: Phase 11 先建立 FULL-SUITE-BASELINE.md 再分类处置，让 residual 路由决策有据可查，而不是凭印象判断
- **Phase 12 gap-closure pattern**: 以 dated refresh section 扩充旧文档而非覆盖，为跨 phase 的证据追溯提供了清晰的时间线

### What Was Inefficient

- **Two-audit cycle cost**: v1.1 需要两轮 `$gsd-audit-milestone`（Phase 11 VERIFICATION 缺失 + Phase 12 收口），这是因为 Phase 11 完成时没有同步创建 VERIFICATION.md；下个 milestone 应该把 VERIFICATION.md 作为 phase 执行的必须出口条件
- **Phase 12 的后置补偿成本**: Phase 10/11 的 VALIDATION.md 需要在 Phase 12 追溯补建，说明这两个 phase 的完成标准执行不够严格；Nyquist 要求应该在 execute-phase 时就作为 gate
- **STATE.md 手工进度追踪**: `stopped_at` 字段多次漂移，需要在每个 plan 完成时就手动更新，容易遗忘

### Patterns Established

- **Guarded upstream merge protocol**: pre-sync protection checklist → isolated integration worktree → blocker suite → ff-only landing；这个协议可以作为后续所有 upstream sync 的标准模板
- **Installer display-layer separation**: locale catalog（`codex-skills.json`）和 English canonical command source 彻底分离，任何 runtime 都可以复用这一模式
- **Baseline evidence refresh pattern**: 当 phase 完成后证据发生变化，用 dated section 扩充（不替换）原始 baseline；这样可以同时保持追溯性和时效性

### Key Lessons

- VERIFICATION.md 必须成为 execute-phase 工作流的必须产物，不能是可选的 audit 触发项；Phase 12 的补偿成本是最直接的证据
- upstream sync 的 scope 很容易被低估——Phase 06 暴露的 post-sync 全套测试债务直接增加了 Phase 11-12 两个额外阶段
- 受控 residual debt 的路由决策（哪些留 v1.1、哪些路由 v1.2）必须在 Phase 11 时就明确记录，而不是在 audit 时才去追溯

### Cost Observations

- Phase 11: 18 min total (测试债务分类 + 定向修复)
- Phase 09: 15 min total
- Phase 10: 15 min total
- Notable: Phase 07-08 执行速度快，因为 Phase 06 已明确划清上游 surface 边界和 installer 入口

---

## Milestone: v1.2 — 债务清理与 Claude Skills 本地化

**Shipped:** 2026-04-21
**Phases:** 4 | **Plans:** 11 | **Tasks:** 25

### What Was Built

- Phase 13: 修复 Windows 本地安装回归测试 teardown 的 EPERM 路径，并收口 hook regex / Kilo help text 的源码字符串漂移
- Phase 14: 建立 `claude-skills` English baseline、首批 6-skill `zh-CN` skeleton、pair-level fallback seam 与真实 install-output regression
- Phase 14.1: 在 isolated integration worktree 中完成受保护的 latest-upstream sync，并把多语言 WIP 回放到 synced source surface
- Phase 15: 把 Claude first-batch zh-CN promised subset 接入 governance blocker，补齐 install-output gate 与 synced remainder English fallback boundary regression

### What Worked

- **Debt-first sequencing**: 先关闭 v1.1 残余失败，再扩展 Claude locale contract，避免旧失败污染新里程碑证据
- **Pair-level fallback contract**: `description` / `short-description` 作为同一语言对回退，直接消除了 mixed-language frontmatter 的歧义
- **Clean-base then replay sync**: 把 clean sync 与本地 WIP replay 拆开后，Phase 14.1 的对齐路径和最终完成态都清晰可审计
- **Blocker vs boundary layering**: first-batch promised subset 用 blocker，wider inventory 用 boundary regression，既守住承诺面又不误扩大硬门

### What Was Inefficient

- **Phase 14.1 插入导致重做成本**: 因必须前置 latest-upstream sync，Phase 15 的 discuss/plan/execution 全部需要在 sync 后重开，说明同步时机在阶段设计里被低估
- **Milestone audit 需要二次通过**: Phase 13 初次缺少 `13-VALIDATION.md`，导致 v1.2 审计先落在 `tech_debt`，后续又补了一轮 `$gsd-validate-phase 13`
- **Git 统计不可用**: 当前工作树长期脏且用户未授权 commit，导致 milestone close 不能依赖 commit range，只能回到 roadmap/summary/verification 事实源

### Patterns Established

- **Promised subset before wider inventory**: 对安装产物本地化，先锁正式承诺子集，再用非 blocker 回归保护 broader baseline
- **Clean sync artifact split**: `integration report`、`post-sync report`、`updated surfaces`、`refresh inputs` 分档保存，比单份 merge notes 更可复查
- **Focused milestone suite as closure evidence**: 在 milestone audit 里使用跨 phase 的 focused suite，比单 phase 自证更能说明集成闭环
- **Architecture-phase testing for fallback semantics**: fallback contract 必须在架构阶段就锁死，不要拖到内容 copy 阶段才补

### Key Lessons

- latest-upstream sync 如果是硬前提，就应在 milestone 初始 requirements 中显式建模，而不是到执行中段再插 Phase 14.1
- `VALIDATION.md` 缺失即使不影响实现正确性，也会直接影响 milestone audit 收敛速度；Nyquist 证据必须随 phase 完成同步产出
- 对多语言 installer 表面，English baseline、promised subset、fallback boundary 这三层责任必须拆开，否则测试和治理都会混在一起

### Cost Observations

- Phase 13: 30 min total
- Phase 14: 40 min total
- Phase 14.1: 55 min total
- Phase 15: 12 min total
- Notable: 最新 upstream 对齐（Phase 14.1）是本里程碑最重的成本中心，但也显著降低了 Phase 15 在过时代码面上落地的风险

---

## Cross-Milestone Trends

| Metric | v1.0 | v1.1 | v1.2 |
|--------|------|------|------|
| Phases | 5 | 7 | 4 |
| Plans | 18 | 15 | 11 |
| Tasks | 37 | — | 25 |
| Git commits | 19 | 1 (upstream merge) | — |
| Timeline | 3 days (2026-04-16 → 2026-04-18) | 2 days (2026-04-18 → 2026-04-19) | 2 days (2026-04-20 → 2026-04-21) |
| Nyquist compliance | PARTIAL (1/5 compliant) | PARTIAL (6/7 compliant, Phase 12 draft) | COMPLIANT (4/4 compliant) |
| Requirements hit rate | 100% (10/10) | 100% (10/10) | 100% (12/12) |
| Residual test failures | 0 | 6 (controlled, routed to v1.2) | 0 |
| Audit cycles needed | 1 | 2 (Phase 12 gap-closure required re-audit) | 2 (Phase 13 VALIDATION gap closed before re-audit passed) |
