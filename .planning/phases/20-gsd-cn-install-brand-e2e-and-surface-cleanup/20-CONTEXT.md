---
phase: 20-gsd-cn-install-brand-e2e-and-surface-cleanup
source: .planning/v2.0-MILESTONE-AUDIT.md
created: 2026-04-24
mode: gap-closure
requirements: [CN-03, CN-04, CN-05, CN-07]
gaps:
  - GAP-19-INSTALL-BRAND-ACTIVATION
  - GAP-19-STATE-ROOT-E2E
  - GAP-19-CLINE-SURFACE
---

# Phase 20 Context: GSD-CN install-brand E2E 闭环与 surface 残留清理

## Why This Phase Exists

`$gsd-audit-milestone` for v2.0 produced `.planning/v2.0-MILESTONE-AUDIT.md` with `status: gaps_found`.

Phase 19 delivered the GSD-CN product boundary, planning-root substrate, installer namespace substrate, docs/help surfaces, and parity/coexistence gate. The remaining blocker is not the existence of those pieces, but the E2E wiring that proves a real GSD-CN user path activates them together.

## Audit Gaps To Close

| Gap | Affects | Required Closure |
|-----|---------|------------------|
| `GAP-19-INSTALL-BRAND-ACTIVATION` | CN-03, CN-04, CN-05, CN-07 | README/install entry must activate `GSD_BRAND=gsdcn` or equivalent dedicated GSD-CN brand mechanism |
| `GAP-19-STATE-ROOT-E2E` | CN-05 | A fixture must prove GSD-CN command execution writes to `.planning-gsdcn`, not `.planning` |
| `GAP-19-CLINE-SURFACE` | CN-03, CN-05 | Runtime generated Cline/user-visible content must not expose unintended `/gsd-*` or `.planning` residuals |

## Existing Evidence From Phase 19

- `tests/planning-root-namespace.test.cjs` proves `GSD_BRAND=gsdcn` maps planning helpers to `.planning-gsdcn`.
- `tests/runtime-install-layout-isolation.test.cjs` proves installer namespace values differ when `GSD_BRAND=gsdcn` is explicitly set.
- `tests/command-prefix-parity.test.cjs`, `tests/docs-gsdcn-prefix-contract.test.cjs`, and `tests/gsdcn-surface-parity.test.cjs` prove README/docs/help surfaces use `gsdcn` in targeted places.
- `tests/behavior-parity-boundary.test.cjs` proves many allowed-difference and coexistence invariants.

## Known Weak Link

`bin/install.js` resolves brand from `GSD_BRAND` and defaults to `official`. README currently documents an install command path that does not explicitly prove `GSD_BRAND=gsdcn` activation. Therefore a user can plausibly follow the GSD-CN docs and still get official-brand install behavior.

## Design Constraints

- Keep the fix minimal and explicit; do not introduce a broad product fork.
- Preserve official GSD default behavior unless an explicit GSD-CN entry/brand is used.
- Keep non-user-visible internals stable unless needed for E2E brand propagation.
- Tests must prove observable outcomes, not just implementation names.
- Do not remove intentional coexistence comparisons between official GSD and GSD-CN.

## Plan Split

1. `20-01-PLAN.md` — implement/document the brand activation entry.
2. `20-02-PLAN.md` — add E2E regression coverage for install, state root, and runtime surface residuals.
3. `20-03-PLAN.md` — produce verification artifacts and prepare milestone re-audit.
