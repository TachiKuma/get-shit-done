/**
 * Docs/help/install GSD-CN prefix contract tests (Phase 19 - Plan 03)
 *
 * Covers:
 * 1. Root README.md presents GSD-CN as the main narrative (CN-01)
 * 2. Root README.md includes upstream source / compatibility / unofficial notice (CN-07)
 * 3. Root README.md explicitly defers other languages (CN-02)
 * 4. docs/README.md is updated for GSD-CN (CN-01)
 * 5. docs/COMMANDS.md uses gsdcn-* prefix in command examples (CN-03)
 * 6. No mixed-prefix in README or docs (CN-03)
 * 7. Other languages not promised as current milestone deliveries (CN-02)
 *
 * These tests lock the docs/help narrative contract so that:
 * - Root README stays the GSD-CN Chinese distribution main README
 * - Mixed /gsd- and /gsdcn- prefixes in user-visible docs cause test failure
 * - Other languages (ja-JP, ko-KR, pt-BR) are not incorrectly promised
 * (T-19-03-01 threat mitigation; CN-01, CN-02, CN-07 requirements)
 */

'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');

// ─── File paths ───────────────────────────────────────────────────────────────

const ROOT = path.join(__dirname, '..');
const README_PATH = path.join(ROOT, 'README.md');
const DOCS_README_PATH = path.join(ROOT, 'docs', 'README.md');
const COMMANDS_PATH = path.join(ROOT, 'docs', 'COMMANDS.md');
const USER_GUIDE_PATH = path.join(ROOT, 'docs', 'USER-GUIDE.md');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// ─── Tests: Root README.md ────────────────────────────────────────────────────

describe('Root README.md — GSD-CN narrative contract', () => {

  test('README.md exists', () => {
    assert.ok(fileExists(README_PATH), 'README.md must exist');
  });

  test('README.md contains GSD-CN in title or main heading', () => {
    const content = readFile(README_PATH);
    assert.ok(
      content.includes('GSD-CN'),
      'README.md must prominently feature "GSD-CN" as the main brand'
    );
  });

  test('README.md includes upstream source disclosure', () => {
    const content = readFile(README_PATH);
    const hasUpstream = content.includes('get-shit-done') ||
                        content.includes('上游') ||
                        content.includes('upstream');
    assert.ok(
      hasUpstream,
      'README.md must disclose the upstream source (get-shit-done)'
    );
  });

  test('README.md includes non-official / unofficial notice', () => {
    const content = readFile(README_PATH);
    const hasUnofficial = content.includes('非官方') ||
                          content.includes('unofficial') ||
                          content.includes('Unofficial');
    assert.ok(
      hasUnofficial,
      'README.md must include a non-official notice'
    );
  });

  test('README.md declares first phase is zh-CN only', () => {
    const content = readFile(README_PATH);
    const hasZhCnOnlyDeclaration =
      content.includes('zh-CN') &&
      (content.includes('第一阶段') || content.includes('first phase') || content.includes('only'));
    assert.ok(
      hasZhCnOnlyDeclaration,
      'README.md must declare that the first phase only promises zh-CN'
    );
  });

  test('README.md defers other languages explicitly', () => {
    const content = readFile(README_PATH);
    // Must either say deferred/推迟 for other langs, or indicate they are not in current scope
    const hasDeferredOtherLanguages =
      content.includes('deferred') ||
      content.includes('推迟') ||
      content.includes('Deferred') ||
      content.includes('后续') ||
      content.includes('ja-JP') ||  // listed as deferred
      content.includes('ko-KR');
    assert.ok(
      hasDeferredOtherLanguages,
      'README.md must explicitly defer other language support'
    );
  });

  test('README.md uses gsdcn-* prefix in command examples', () => {
    const content = readFile(README_PATH);
    assert.ok(
      content.includes('gsdcn'),
      'README.md must reference gsdcn commands or prefix'
    );
  });

  test('README.md does not present other languages as current milestone deliveries', () => {
    const content = readFile(README_PATH);
    // Must not contain phrases that promise ja-JP/ko-KR/pt-BR as currently delivered
    // Languages may appear in "deferred" sections — we check the surrounding context
    const lines = content.split('\n');
    for (const lang of ['ja-JP', 'ko-KR', 'pt-BR']) {
      const langLineIndices = lines
        .map((l, i) => ({ l, i }))
        .filter(({ l }) => l.includes(lang))
        .map(({ i }) => i);

      for (const idx of langLineIndices) {
        // Look at surrounding context (20 lines before the lang mention)
        const contextStart = Math.max(0, idx - 20);
        const contextWindow = lines.slice(contextStart, idx + 5).join('\n');

        const isInDeferredContext =
          contextWindow.includes('deferred') || contextWindow.includes('推迟') ||
          contextWindow.includes('后续') || contextWindow.includes('future') ||
          contextWindow.includes('Deferred') || contextWindow.includes('路线图') ||
          contextWindow.includes('roadmap') || contextWindow.includes('不在') ||
          contextWindow.includes('Deferred') || contextWindow.includes('延后') ||
          // The NOTE block header explicitly says deferred
          contextWindow.includes('未来语言支持') || contextWindow.includes('Future') ||
          contextWindow.includes('out of scope') || contextWindow.includes('第一阶段');

        assert.ok(
          isInDeferredContext,
          `README.md: language "${lang}" on line ${idx + 1} appears outside a deferred context: "${lines[idx].trim()}"`
        );
      }
    }
  });

});

// ─── Tests: docs/README.md ────────────────────────────────────────────────────

describe('docs/README.md — GSD-CN docs index contract', () => {

  test('docs/README.md exists', () => {
    assert.ok(fileExists(DOCS_README_PATH), 'docs/README.md must exist');
  });

  test('docs/README.md references GSD-CN', () => {
    const content = readFile(DOCS_README_PATH);
    assert.ok(
      content.includes('GSD-CN'),
      'docs/README.md must reference GSD-CN'
    );
  });

  test('docs/README.md includes language deferred notice', () => {
    const content = readFile(DOCS_README_PATH);
    const hasNotice = content.includes('deferred') ||
                      content.includes('推迟') ||
                      content.includes('zh-CN');
    assert.ok(
      hasNotice,
      'docs/README.md must include zh-CN only / deferred language notice'
    );
  });

});

// ─── Tests: docs/COMMANDS.md ──────────────────────────────────────────────────

describe('docs/COMMANDS.md — gsdcn prefix coverage', () => {

  test('docs/COMMANDS.md exists', () => {
    assert.ok(fileExists(COMMANDS_PATH), 'docs/COMMANDS.md must exist');
  });

  test('docs/COMMANDS.md contains gsdcn- prefix in command examples', () => {
    const content = readFile(COMMANDS_PATH);
    assert.ok(
      content.includes('/gsdcn-'),
      'docs/COMMANDS.md must contain /gsdcn- command examples'
    );
  });

  test('docs/COMMANDS.md has no bare /gsd- command references (only /gsdcn-)', () => {
    const content = readFile(COMMANDS_PATH);
    // Matches /gsd- followed by a character that is NOT 'c'
    // This catches /gsd-help but not /gsdcn-help
    const bareGsdMatches = content.match(/\/gsd-[^c]/g) || [];
    assert.strictEqual(
      bareGsdMatches.length,
      0,
      `docs/COMMANDS.md must not contain bare /gsd- command references; found: ${bareGsdMatches.slice(0, 5).join(', ')}`
    );
  });

  test('docs/COMMANDS.md syntax section uses gsdcn-command-name format', () => {
    const content = readFile(COMMANDS_PATH);
    assert.ok(
      content.includes('gsdcn-command-name') || content.includes('/gsdcn-'),
      'docs/COMMANDS.md syntax section must use gsdcn- prefix format'
    );
  });

  test('docs/COMMANDS.md does not contain mixed prefix in command tables', () => {
    const content = readFile(COMMANDS_PATH);
    // Command table entries should not mix /gsd- and /gsdcn- in the same context
    const lines = content.split('\n');
    const mixedLines = lines.filter(line => {
      const hasOldPrefix = /\/gsd-[^c]/.test(line);
      const hasNewPrefix = /\/gsdcn-/.test(line);
      return hasOldPrefix && hasNewPrefix;
    });
    assert.strictEqual(
      mixedLines.length,
      0,
      `docs/COMMANDS.md must not have lines mixing /gsd- and /gsdcn- prefixes: ${mixedLines.slice(0, 3).join('; ')}`
    );
  });

});

// ─── Tests: docs/USER-GUIDE.md ────────────────────────────────────────────────

describe('docs/USER-GUIDE.md — GSD-CN narrative', () => {

  test('docs/USER-GUIDE.md exists', () => {
    assert.ok(fileExists(USER_GUIDE_PATH), 'docs/USER-GUIDE.md must exist');
  });

  test('docs/USER-GUIDE.md title references GSD-CN', () => {
    const content = readFile(USER_GUIDE_PATH);
    assert.ok(
      content.includes('GSD-CN'),
      'docs/USER-GUIDE.md must reference GSD-CN in its header'
    );
  });

});

// ─── Tests: Mixed prefix detection ────────────────────────────────────────────

describe('Mixed prefix detection — README/docs must not mix gsd- and gsdcn-', () => {

  const DOC_FILES = [
    { name: 'README.md', path: README_PATH },
    { name: 'docs/COMMANDS.md', path: COMMANDS_PATH },
  ];

  for (const { name, path: filePath } of DOC_FILES) {
    test(`${name}: no command-context lines mixing /gsd-xxx and /gsdcn-xxx`, () => {
      const content = readFile(filePath);
      const lines = content.split('\n');
      // A "command-context line" is one that contains a slash command pattern
      // Exclude lines that are explicitly comparing two brands (coexistence explanation)
      // e.g. "skills/gsd-* vs skills/gsdcn-*" or "gsd-help vs gsdcn-help"
      const commandLines = lines.filter(line =>
        /\/(gsd|gsdcn)-/.test(line)
      );
      const mixedLines = commandLines.filter(line => {
        const hasOld = /\/gsd-[^c]/.test(line);
        const hasNew = /\/gsdcn-/.test(line);
        if (!hasOld || !hasNew) return false;
        // Skip lines that are explicitly coexistence comparisons
        // (lines containing "与" / "and" / "vs" alongside both prefixes)
        const isComparisonLine =
          line.includes(' 与 ') || line.includes(' and ') ||
          line.includes(' vs ') || line.includes(' vs. ') ||
          line.includes('隔离') || // isolation explanation
          (line.includes('gsd-*') && line.includes('gsdcn-*')); // glob comparison
        return !isComparisonLine;
      });
      assert.strictEqual(
        mixedLines.length,
        0,
        `${name} must not have lines mixing /gsd-xxx and /gsdcn-xxx (except explicit coexistence comparisons): ${mixedLines.slice(0, 3).join('; ')}`
      );
    });
  }

});
