# Localization Drift Policy

This policy defines how maintainers handle localization drift after an English canonical change.
It is the execution policy behind `get-shit-done/references/localization-governance-surfaces.json`,
`get-shit-done/references/localization-glossary.md`, and
`get-shit-done/references/localization-sync-playbook.md`.

## Scope

- Treat the governance manifest as the single source of truth for `blocker`, `warning`, and `deferred` surfaces.
- Treat `en + zh-CN` as the only `first-batch` quality commitment in this phase.
- Treat `ja-JP`, `ko-KR`, and `pt-BR` as `non-first-batch` and therefore warning-only unless the manifest is intentionally changed.
- Reuse glossary terms such as `English canonical`, `canonical locale`, `fallback`, `mirror`, `fixed-string`, and `drift`.
- Preserve English retention for commands, paths, config keys, identifiers, and other glossary-listed `Do Not Translate` items.

## What Counts As Drift

`drift` exists when a changed English canonical source no longer matches the promised localization behavior for the impacted surface.
Examples:

- A `blocker` workflow or config doc changes `response_language`, `canonical locale`, or `fallback` wording without keeping the same contract in linked docs or checks.
- A first-batch `mirror` such as `docs/zh-CN/COMMANDS.md` no longer reflects the current English canonical summary layer.
- A first-batch `fixed-string` `catalog` loses key parity between `en` and `zh-CN`.
- A summary-only locale removes explicit English canonical disclosure even if it is still warning-only.

Drift is a governance mismatch, not just a translation delta. If the contract, coverage promise, or fallback behavior changes, the verifier must see it.

## Disposition Inheritance

Every change inherits its handling level from `localization-governance-surfaces.json`.

| Disposition | Meaning | Exit-code impact |
|-------------|---------|------------------|
| `blocker` | First-batch or priority contract surface. Missing sync evidence or failed verification is not shippable. | Fails `node scripts/verify-localization-governance.cjs` |
| `warning` | Visible governance debt for `non-first-batch` or summary-only surfaces. | Report only |
| `deferred` | Explicitly tracked future scope outside the current hard gate. | Report only |

Do not create a parallel severity scheme in prose, tests, or review comments. If a surface is not reclassified in the manifest, its governance level does not change.

## Blocker Handling

When an English canonical change hits a `blocker` surface, maintainers must provide sync evidence in the same change:

1. Update the English canonical source first.
2. Update any impacted first-batch `mirror`, `catalog`, or linked contract doc.
3. If the canonical wording changed, update the glossary-first terms before or with the dependent mirror updates.
4. Run `node scripts/verify-localization-governance.cjs`.
5. Run any focused test or smoke verifier referenced by the manifest entry.

Accepted sync evidence includes:

- Passing blocker output from `verify-localization-governance.cjs`
- Passing focused tests such as `tests/localization-governance-coverage.test.cjs`
- Matching first-batch `catalog` key sets and valid localized resolution
- Updated first-batch `mirror` content that still exposes the English canonical source

If blocker evidence is missing, the change is incomplete. Blocker drift cannot be waived by adding a note to the summary.

## Warning Handling

`warning` applies when the changed surface is intentionally outside the first-batch hard gate, including `summary-only locale` mirrors for `ja-JP`, `ko-KR`, and `pt-BR`.

Warning-only handling is valid only when all of the following remain true:

- The surface is classified as `warning` in the manifest.
- The English canonical path remains visible.
- The locale keeps explicit `fallback` disclosure.
- The change does not weaken a first-batch contract by proxy.

Warnings must remain visible in governance output. They are not a reason to return zero evidence; they are a reason to return a non-blocking report.

## Deferred Handling

`deferred` is reserved for explicitly out-of-scope governance surfaces such as broader workflow coverage, wider docs mirrors, or future locale expansion.

Use `deferred` when:

- The surface is already listed as `deferred` in the manifest.
- The work would expand the hard gate beyond the current first-batch commitment.
- The correct action is to preserve visibility and queue remediation instead of silently ignoring the gap.

Deferred items must stay documented in summaries or follow-up plans. They must not be described as passing coverage.

## Summary-Only Locales And English Retention

`summary-only locale` surfaces are not full mirrors. They provide a minimal localized entry plus explicit routing to the `English canonical` source.
Because of that contract:

- Missing deep parity in `ja-JP`, `ko-KR`, or `pt-BR` is a `warning`, not a `blocker`.
- Removing the English canonical disclosure is still drift and must appear in governance output.
- Commands, flags, paths, config keys, and other English-retained terms remain English even inside localized summaries.

## Required Command

Use `node scripts/verify-localization-governance.cjs` as the single governance entry point.
It must report `blocker`, `warning`, and `deferred` results together, while only `blocker` failures control the exit code.

If the policy, manifest, glossary, playbook, or public feature docs disagree, update them in the same change.
