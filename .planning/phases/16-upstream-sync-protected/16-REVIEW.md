---
phase: 16-upstream-sync-protected
reviewed: 2026-04-21T00:00:00Z
depth: quick
files_reviewed: 5
files_reviewed_list:
  - get-shit-done/locales/en/assets.json
  - get-shit-done/locales/en/claude-skills.json
  - get-shit-done/locales/en/codex-skills.json
  - get-shit-done/locales/en/installer.json
  - get-shit-done/locales/en/runtime.json
findings:
  critical: 0
  warning: 1
  info: 2
  total: 3
status: issues_found
---

# Phase 16: Code Review Report

**Reviewed:** 2026-04-21T00:00:00Z
**Depth:** quick
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Five English canonical locale JSON files were reviewed at quick depth after the Phase 16 upstream sync (68 commits). All files parse as valid JSON with no syntax errors. No null or empty-string values were found. No hardcoded secrets, dangerous functions, debug artifacts, or XSS/injection patterns were detected in any string values. `{{placeholder}}` tokens in `installer.json` are all well-formed.

One warning-level inconsistency was found: a single skill key in `claude-skills.json` uses an underscore in the skill name segment (`gsd-extract_learnings`) while every other skill key in the same file uses hyphens (`gsd-extract-learnings` would be the consistent form). This breaks the key naming convention and could cause lookup mismatches if callers construct the key programmatically from the command name.

Two info-level items note underscore usage in sub-key segments (which is acceptable within namespace segments but worth flagging for awareness) and a camelCase word in one value string.

---

## Warnings

### WR-01: Inconsistent key naming — underscore in skill name segment (`gsd-extract_learnings`)

**File:** `get-shit-done/locales/en/claude-skills.json:46-47`
**Issue:** The skill name segment uses an underscore: `claude-skills.gsd-extract_learnings.description` and `claude-skills.gsd-extract_learnings.short-description`. Every other key in this file uses hyphens as the separator within the skill name (e.g., `gsd-add-backlog`, `gsd-code-review-fix`). The corresponding CLI command is `/gsd-extract-learnings` (hyphenated). If any runtime code derives the locale key from the command name by replacing spaces or slashes with hyphens, the lookup will fail to find this key and fall back silently or raise a missing-key error.
**Fix:** Rename both keys to use a hyphen:
```json
"claude-skills.gsd-extract-learnings.description": "Extract decisions, lessons, patterns, and surprises from completed phase artifacts",
"claude-skills.gsd-extract-learnings.short-description": "Extract decisions, lessons, patterns, and surprises from completed phase artifacts"
```
Update the corresponding `zh-CN` catalog entry at the same key path.

---

## Info

### IN-01: camelCase word `statusLine` inside a value string in `installer.json`

**File:** `get-shit-done/locales/en/installer.json:91`
**Issue:** The value for `installer.skipping_statusline_local` contains the word `statusLine` (camelCase). All other references to the same concept in this file use the lowercase form `statusline` (e.g., keys `installer.configured_statusline`, `installer.skipping_statusline_existing`, value text "statusline"). This is a cosmetic inconsistency in the user-facing string.
**Fix:** Normalize to lowercase:
```json
"installer.skipping_statusline_local": "Skipping statusline for local install (avoids overriding profile-level settings; use --force-statusline to override)"
```

### IN-02: `installer.help_config_dir_priority` value is 323 characters — consider splitting or truncating for narrow terminals

**File:** `get-shit-done/locales/en/installer.json:138`
**Issue:** This value lists 14 environment variable names in a single sentence (323 chars). It is the longest string in the entire locale catalog. While not a bug, it may wrap poorly in narrow terminal help output. Worth noting for future maintenance when new runtimes are added.
**Fix:** No immediate action required. If terminal display issues are reported, consider splitting into a multi-line help hint or abbreviating with an "etc." form.

---

_Reviewed: 2026-04-21T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: quick_
