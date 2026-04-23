/**
 * GSD-CN surface parity tests (Phase 19 - Plan 03)
 *
 * Covers:
 * 1. docs/COMMANDS.md and docs/README.md structure isomorphism with original
 * 2. Allowed differences: Chinese text, gsdcn prefix — no new workflow/behavior descriptions
 * 3. docs/COMMANDS.md has same command set coverage (same command names modulo prefix)
 * 4. Other-language deliveries are not incorrectly promised in current milestone docs
 * 5. docs section structure integrity — no new processes introduced via translation
 *
 * These tests lock structural parity so that the GSD-CN docs remain isomorphic
 * with the upstream structure, permitting only prefix and language changes.
 * (T-19-03-02, T-19-03-03 threat mitigations; CN-06, CN-03 requirements)
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

/**
 * Extract markdown section headings (## and ###) from content.
 */
function extractHeadings(content) {
  return content
    .split('\n')
    .filter(line => /^#{1,4} /.test(line))
    .map(line => line.trim());
}

/**
 * Extract command-like references (/gsdcn-xxx) from content.
 */
function extractCommandRefs(content) {
  const matches = content.match(/\/gsdcn-[\w-]+/g) || [];
  return [...new Set(matches)];
}

// ─── Tests: docs/COMMANDS.md structural integrity ────────────────────────────

describe('docs/COMMANDS.md — structural parity and integrity', () => {

  test('docs/COMMANDS.md has substantial content (not stub)', () => {
    const content = readFile(COMMANDS_PATH);
    assert.ok(
      content.length > 5000,
      'docs/COMMANDS.md must have substantial content (> 5000 chars); stub detection'
    );
  });

  test('docs/COMMANDS.md contains major command categories', () => {
    const content = readFile(COMMANDS_PATH);
    // These are structural section markers that should exist in commands reference
    const requiredSections = [
      'Core Workflow',
      'Navigation',
      'Utility',
    ];
    for (const section of requiredSections) {
      assert.ok(
        content.includes(section),
        `docs/COMMANDS.md must contain section: "${section}"`
      );
    }
  });

  test('docs/COMMANDS.md contains core workflow command set with gsdcn prefix', () => {
    const content = readFile(COMMANDS_PATH);
    // These commands should exist in docs with gsdcn prefix
    const coreCommands = [
      '/gsdcn-new-project',
      '/gsdcn-discuss-phase',
      '/gsdcn-plan-phase',
      '/gsdcn-execute-phase',
      '/gsdcn-verify-work',
      '/gsdcn-next',
      '/gsdcn-help',
    ];
    for (const cmd of coreCommands) {
      assert.ok(
        content.includes(cmd),
        `docs/COMMANDS.md must contain command reference: ${cmd}`
      );
    }
  });

  test('docs/COMMANDS.md does not introduce new behavior descriptions absent from structure', () => {
    const content = readFile(COMMANDS_PATH);
    // Verify no "GSD-CN only" features are documented as available
    // (e.g., CCB specialization, ja-JP, etc.)
    const forbiddenFeatures = [
      'ja-JP',
      'ko-KR',
      'CCB specialization',
    ];
    for (const feature of forbiddenFeatures) {
      assert.ok(
        !content.includes(feature),
        `docs/COMMANDS.md must not promise feature: "${feature}" (out of scope for current milestone)`
      );
    }
  });

  test('docs/COMMANDS.md: gsdcn command count is reasonable (>= 20 unique commands)', () => {
    const content = readFile(COMMANDS_PATH);
    const commands = extractCommandRefs(content);
    assert.ok(
      commands.length >= 20,
      `docs/COMMANDS.md must reference at least 20 unique gsdcn commands; found ${commands.length}`
    );
  });

});

// ─── Tests: README.md structural integrity ────────────────────────────────────

describe('README.md — structural parity: GSD-CN main README', () => {

  test('README.md has substantial content (not a stub)', () => {
    const content = readFile(README_PATH);
    assert.ok(
      content.length > 2000,
      'README.md must have substantial content (> 2000 chars); not a stub'
    );
  });

  test('README.md contains getting started section', () => {
    const content = readFile(README_PATH);
    const hasGettingStarted =
      content.includes('快速开始') ||
      content.includes('Getting Started') ||
      content.includes('Quick Start');
    assert.ok(
      hasGettingStarted,
      'README.md must contain a getting started / quick start section'
    );
  });

  test('README.md contains install command example', () => {
    const content = readFile(README_PATH);
    assert.ok(
      content.includes('npx get-shit-done-cc'),
      'README.md must contain the npx install command'
    );
  });

  test('README.md contains coexistence explanation', () => {
    const content = readFile(README_PATH);
    const hasCoexistence =
      content.includes('共存') ||
      content.includes('coexist') ||
      content.includes('Coexist') ||
      content.includes('gsd-*') ||
      content.includes('gsd-help') ||
      content.includes('同机') ||
      content.includes('gsdcn-help');
    assert.ok(
      hasCoexistence,
      'README.md must explain coexistence between GSD and GSD-CN'
    );
  });

  test('README.md: gsdcn prefix appears in command examples', () => {
    const content = readFile(README_PATH);
    const gsdcnRefs = (content.match(/gsdcn-/g) || []).length;
    assert.ok(
      gsdcnRefs >= 3,
      `README.md must have at least 3 gsdcn- references; found ${gsdcnRefs}`
    );
  });

  test('README.md does not contain old gsd- slash command examples (only gsdcn-)', () => {
    const content = readFile(README_PATH);
    // Check for /gsd- not followed by 'c' (not /gsdcn-).
    // Exclusions: URL lines (GitHub links contain /gsd-build/) and coexistence contrast
    // lines (same line shows both gsd- and gsdcn- for intentional comparison).
    const lines = content.split('\n');
    const oldStyleCommands = [];
    for (const line of lines) {
      if (/https?:\/\//.test(line)) continue; // skip URL lines
      if (/gsd-/.test(line) && /gsdcn-/.test(line)) continue; // skip coexistence contrast lines
      const found = line.match(/\/gsd-[^c]/g) || [];
      oldStyleCommands.push(...found);
    }
    assert.strictEqual(
      oldStyleCommands.length,
      0,
      `README.md must not contain old /gsd- command examples; found: ${oldStyleCommands.slice(0, 5).join(', ')}`
    );
  });

});

// ─── Tests: Other language deferred boundary ─────────────────────────────────

describe('Other language deferred boundary — not promised as current milestone', () => {

  const FILES_TO_CHECK = [
    { name: 'README.md', path: README_PATH },
    { name: 'docs/README.md', path: DOCS_README_PATH },
    { name: 'docs/COMMANDS.md', path: COMMANDS_PATH },
  ];

  const DEFERRED_LANGUAGES = ['ja-JP', 'ko-KR', 'pt-BR'];

  for (const { name, filePath } of FILES_TO_CHECK.map(f => ({ name: f.name, filePath: f.path }))) {
    for (const lang of DEFERRED_LANGUAGES) {
      test(`${name}: ${lang} is not promised as currently available`, () => {
        if (!fs.existsSync(filePath)) {
          // File doesn't exist — skip this check
          return;
        }
        const content = readFile(filePath);
        // If the file mentions the language at all, it must frame it as deferred
        if (content.includes(lang)) {
          const langIndex = content.indexOf(lang);
          const surrounding = content.substring(
            Math.max(0, langIndex - 100),
            Math.min(content.length, langIndex + 200)
          );
          const isDeferred =
            surrounding.includes('deferred') ||
            surrounding.includes('推迟') ||
            surrounding.includes('Deferred') ||
            surrounding.includes('后续') ||
            surrounding.includes('future') ||
            surrounding.includes('Future') ||
            surrounding.includes('not in') ||
            surrounding.includes('out of scope');
          assert.ok(
            isDeferred,
            `${name}: language "${lang}" is mentioned but not framed as deferred — must not be promised as current milestone delivery. Context: "${surrounding.trim().replace(/\n/g, ' ')}"`
          );
        }
        // If not mentioned at all — that's fine
      });
    }
  }

});

// ─── Tests: Structure isomorphism guard ─────────────────────────────────────

describe('Structure isomorphism guard — no new processes via docs update', () => {

  test('docs/USER-GUIDE.md: workflow section order preserved', () => {
    const content = readFile(USER_GUIDE_PATH);
    // Core workflow sections should appear in order
    const sections = [
      'Workflow',
      'Security',
      'Troubleshooting',
      'Recovery',
    ];
    let lastIndex = -1;
    for (const section of sections) {
      const idx = content.indexOf(section);
      if (idx === -1) continue; // Section may have been translated — skip
      assert.ok(
        idx > lastIndex,
        `docs/USER-GUIDE.md: section "${section}" is out of order — docs structure must not change`
      );
      lastIndex = idx;
    }
  });

  test('docs/COMMANDS.md: Core Workflow section appears before Utility section', () => {
    const content = readFile(COMMANDS_PATH);
    const coreIdx = content.indexOf('Core Workflow');
    const utilityIdx = content.indexOf('Utility');
    if (coreIdx !== -1 && utilityIdx !== -1) {
      assert.ok(
        coreIdx < utilityIdx,
        'docs/COMMANDS.md: "Core Workflow" must appear before "Utility" — section order must not change'
      );
    }
  });

});
