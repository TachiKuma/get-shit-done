# Localization Sync Playbook

This playbook defines how maintainers respond when an English canonical change touches localization governance surfaces.
Use it together with:

- `get-shit-done/references/localization-governance-surfaces.json`
- `get-shit-done/references/localization-glossary.md`
- `docs/CONFIGURATION.md`
- `get-shit-done/references/planning-config.md`

## Trigger

Run this playbook when an English canonical file changes and the change affects a surface listed in `localization-governance-surfaces.json`.
The `trigger` is the combination of an English canonical edit and a manifest-listed governance surface.

| Trigger type | Surface disposition | What it means |
|--------------|---------------------|---------------|
| English canonical update on a blocker surface | `blocker` | First-batch locale governance may be broken and verification must pass before the change is considered complete |
| English canonical update on a warning surface | `warning` | Summary-only or non-first-batch content may need follow-up, but local verification does not block on it |
| English canonical update on a deferred surface | `deferred` | Track the change for later governance work without promoting it to the first-batch gate |

## owner

| Surface group | owner | Default responsibility |
|---------------|-------|------------------------|
| `priority-workflows` | `workflow-maintainers` | Keep `response_language`, canonical locale, and English retention wording aligned with runtime behavior |
| `config-and-public-contract` | `docs-maintainers` | Keep public and maintainer docs aligned with glossary wording and fallback disclosure |
| `runtime-catalogs` | `locale-maintainers` | Preserve first-batch runtime catalog parity for `en + zh-CN` |
| `asset-catalogs` | `asset-localization-maintainers` | Preserve first-batch fixed-string catalog parity for `en + zh-CN` |
| `command-summary-first-batch` | `docs-maintainers` | Keep the zh-CN mirror accurate at the summary layer and preserve the English canonical path |
| `command-summary-warning-locales` | `docs-maintainers` | Keep summary-only skeletons and explicit fallback disclosure visible |

If a change spans multiple groups, the author of the English canonical change remains the coordinating owner until all required checks are green or the warning/deferred follow-up is recorded.

## Required Checks

Run these checks after updating impacted mirrors, catalogs, or docs:

1. `node scripts/verify-localization-governance.cjs`
2. `node --test tests/localization-governance-coverage.test.cjs`
3. Run the surface-specific verifier named in `localization-governance-surfaces.json` when the changed surface lists one

## Blocker Workflow

1. Identify the impacted surface in `localization-governance-surfaces.json`.
2. Update the English canonical source first.
3. If wording changed, update `get-shit-done/references/localization-glossary.md` before editing mirrors or config docs.
4. Update all first-batch mirrors, catalogs, or config docs touched by the blocker surface.
5. Recheck `docs/CONFIGURATION.md` and `get-shit-done/references/planning-config.md` so they still use the same `canonical locale`, `English canonical`, and `fallback` wording.
6. Run the required checks.
7. Do not close the change while blocker verification is failing.

## Warning Workflow

Warning handling is allowed only when all of the following stay true:

- The change is limited to a `warning` surface from `localization-governance-surfaces.json`.
- The locale remains a `summary-only locale` or another explicitly warning-only surface.
- The English canonical path remains visible.
- Fallback disclosure remains explicit.
- A deferred remediation entry is recorded if the warning is not fixed in the same change.

Allowed warning handling:

- Update the English canonical source and the affected warning mirror if the edit is trivial.
- Ship the English canonical change with a visible warning result from `node scripts/verify-localization-governance.cjs`.
- Record a follow-up owner and remediation path when the warning surface is intentionally deferred.

Not allowed:

- Reclassifying a blocker surface as warning-only in prose
- Removing fallback disclosure from summary-only locales
- Hiding a warning by skipping the governance verifier

## Deferred Remediation Entry

Use this format in the relevant summary, issue tracker, or follow-up plan:

- surface: `<surface id or path>`
- disposition: `warning` or `deferred`
- owner: `<team or maintainer>`
- reason: `<why the change is not completed now>`
- remediation: `<next concrete action>`

## Drift Review Checklist

- Does the changed wording still match the glossary canonical form?
- Did a blocker surface change without updating the corresponding first-batch mirror or catalog?
- Did a summary-only locale keep explicit fallback disclosure to the English canonical source?
- Did public config docs and maintainer config docs keep the same `response_language` contract wording?
- Does the governance verifier still report blocker, warning, and deferred surfaces correctly?
