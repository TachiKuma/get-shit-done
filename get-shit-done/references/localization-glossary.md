# Localization Governance Glossary

This glossary defines the minimum executable vocabulary for Phase 05 localization governance.
It is for maintainers, reviewers, and verifier authors.
It does not attempt to translate general product language or become a full glossary project.

## Scope

- Reuse these canonical terms in governance docs, tests, verifier output, and review comments.
- Keep public config wording aligned with `docs/CONFIGURATION.md`.
- Keep maintainer config wording aligned with `get-shit-done/references/planning-config.md`.
- Use this glossary to judge drift, not to localize every normal word in the repo.

## Canonical Terms

| Term | Canonical form | Use when | Avoid | Translation allowed |
|------|----------------|----------|-------|---------------------|
| Response language | `response_language` | Naming the config key and the runtime control that selects user-facing output language | `reply language`, `output language setting`, translated config-key variants | No for the key; explanatory prose around it may be localized |
| Canonical locale | `canonical locale` | Describing the normalized BCP 47 locale used internally after alias handling | `real locale`, `final locale`, `standard locale tag` when used as a substitute | Yes in prose, but keep the canonical English phrase visible in governance docs |
| English canonical | `English canonical` | Referring to the English source of truth for commands, workflows, docs, and maintainer references | `English original`, `source English copy`, `master translation` | Keep the phrase in English |
| Fallback | `fallback` | Explaining locale resolution when localized content is absent or incomplete | `downgrade`, `backup locale`, `default translation` | Yes in prose, but keep `fallback` in technical contracts |
| Mirror | `mirror` | Referring to a localized summary or documentation surface derived from an English canonical source | `copy`, `duplicate`, `translation parity` | Yes in prose, but keep `mirror` in governance labels |
| Summary-only locale | `summary-only locale` | Describing non-first-batch locales that only provide a minimal entry plus English canonical disclosure | `partial locale`, `light locale`, `preview locale` | Keep the canonical phrase visible |
| Catalog | `catalog` | Referring to locale JSON files that store reusable fixed strings such as runtime and assets entries | `dictionary`, `translation table`, `string dump` | Yes in prose, but keep `catalog` in file-layer contracts |
| Generated content | `generated content` | Referring to model-authored narrative output controlled by `response_language` | `dynamic translation`, `catalog text`, `templated output` | Yes |
| Fixed-string | `fixed-string` | Referring to stable reusable labels, headings, boilerplate, and UI/report copy that belongs in catalogs | `static translation`, `literal text` as a replacement term | Keep the hyphenated English term visible |
| Exempt | `exempt` | Marking surfaces that intentionally stay English-only and are outside locale mirror scope | `ignored`, `skipped forever`, `not supported` | Yes in prose, but keep `exempt` in governance classification |
| Drift | `drift` | Describing a mismatch between canonical wording, mirror wording, contracts, or coverage promises | `outdated translation`, `desync`, `inconsistency` when used as the governance term | Yes in prose, but keep `drift` in verifier output |
| First-batch | `first-batch` | Referring to the initial quality commitment surface and locales: `en + zh-CN` | `tier-1`, `primary release locale`, `fully supported locale` | Keep the hyphenated English term visible |
| Non-first-batch | `non-first-batch` | Referring to warning-only locales such as `ja-JP`, `ko-KR`, and `pt-BR` in this phase | `secondary locale`, `optional locale`, `lower tier` | Keep the hyphenated English term visible |

## Preferred Wording Rules

- Say `canonical locale` when describing normalized locale values after alias handling.
- Say `English canonical` when a file or workflow remains the source of truth in English.
- Say `mirror` for localized summary surfaces such as `docs/<locale>/COMMANDS.md`; do not call them full translations.
- Say `summary-only locale` for `ja-JP`, `ko-KR`, and `pt-BR` in the current governance contract.
- Say `catalog` for reusable locale JSON stores and `generated content` for model-authored narrative output.
- Say `fixed-string` when the content belongs in a locale catalog and `generated content` when it should remain model-authored.
- Say `exempt` only when a surface intentionally stays English-only by governance decision.
- Say `drift` when wording or coverage diverges from the canonical contract.

## Do Not Translate

Keep the following in English across locale docs, verifier output, config references, and governance reports:

- Commands and flags such as `/gsd-execute-phase`, `--auto`, and `--skip-research`
- Paths, file names, and directory names such as `docs/CONFIGURATION.md` and `.planning/config.json`
- Code, code snippets, identifiers, and locale keys
- Config keys such as `response_language`, `commit_docs`, and `workflow.use_worktrees`
- Frontmatter keys and XML or JSON field names
- Tool names and runtime names
- Core governance labels: `English canonical`, `canonical locale`, `fallback`, `mirror`, `catalog`, `generated content`, `fixed-string`, `exempt`, `drift`, `first-batch`, `non-first-batch`

## Alignment Notes

- Public config docs must reuse the same `canonical locale`, `fallback`, and English retention wording defined here.
- Maintainer references must describe `response_language` and English retention with the same canonical wording.
- When wording changes here, update `docs/CONFIGURATION.md`, `get-shit-done/references/planning-config.md`, and related verifier assertions in the same change.
