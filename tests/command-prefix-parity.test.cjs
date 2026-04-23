/**
 * Command prefix parity tests (Phase 19 - Plan 03)
 *
 * Covers:
 * 1. commands/gsd/*.md command files: user-visible /gsd- references updated to /gsdcn-
 * 2. docs/COMMANDS.md and commands/gsd/ source files are consistent on prefix rule
 * 3. Mixed-prefix detection: no file has both /gsd-xxx and /gsdcn-xxx in command contexts
 * 4. README.md and docs/COMMANDS.md agree on prefix narrative
 *
 * These tests lock the command source files and rendered docs to the same
 * prefix rule, preventing mixed-prefix drift after upstream syncs.
 * (T-19-03-02 threat mitigation; CN-03 requirement)
 */

'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');

// ─── File paths ───────────────────────────────────────────────────────────────

const ROOT = path.join(__dirname, '..');
const COMMANDS_DIR = path.join(ROOT, 'commands', 'gsd');
const README_PATH = path.join(ROOT, 'README.md');
const COMMANDS_DOC_PATH = path.join(ROOT, 'docs', 'COMMANDS.md');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

function getCommandFiles() {
  if (!fs.existsSync(COMMANDS_DIR)) return [];
  return fs.readdirSync(COMMANDS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => ({ name: f, path: path.join(COMMANDS_DIR, f) }));
}

/**
 * Returns all "bare /gsd-" occurrences in content — i.e., /gsd- NOT followed by 'c'
 * These are old-style command references that should have been updated to /gsdcn-
 *
 * Exclusions (not actual command invocations):
 *   - Lines containing URLs (http/https) — e.g., GitHub repo links like /gsd-build/
 *   - Lines that are intentional coexistence comparisons (both gsd- and gsdcn- present on same line)
 */
function findBareGsdRefs(content) {
  const lines = content.split('\n');
  const matches = [];
  for (const line of lines) {
    if (/https?:\/\//.test(line)) continue; // skip URL lines (GitHub links, etc.)
    if (/gsd-/.test(line) && /gsdcn-/.test(line)) continue; // skip coexistence contrast lines
    const found = line.match(/\/gsd-[^c\n]/g) || [];
    matches.push(...found);
  }
  return matches;
}

/**
 * Find command files that have bare /gsd- command references (user-visible contexts only).
 * We look for /gsd- in lines that contain command usage patterns.
 */
function findFilesWithBareGsdCommandRefs(files) {
  const problematic = [];
  for (const { name, path: filePath } of files) {
    const content = readFile(filePath);
    const lines = content.split('\n');
    const badLines = lines.filter(line => {
      // Only check "user-visible" command reference lines
      // (code blocks, process instructions, etc.)
      const hasOldRef = /\/gsd-[^c]/.test(line);
      const isCommandContext =
        line.includes('/gsd-') ||
        line.includes('`/') ||
        line.startsWith('Run') ||
        line.startsWith('Use') ||
        line.includes('command') ||
        line.match(/^\s*\//) ||
        line.match(/^\s*\$/) ||
        line.match(/^```/);
      return hasOldRef && isCommandContext;
    });
    if (badLines.length > 0) {
      problematic.push({ name, badLines: badLines.slice(0, 3) });
    }
  }
  return problematic;
}

// ─── Tests: commands/gsd/*.md ─────────────────────────────────────────────────

describe('commands/gsd/*.md — user-visible prefix consistency', () => {

  test('commands/gsd/ directory exists', () => {
    assert.ok(
      fs.existsSync(COMMANDS_DIR),
      'commands/gsd/ directory must exist'
    );
  });

  test('commands/gsd/ contains command files', () => {
    const files = getCommandFiles();
    assert.ok(
      files.length > 0,
      'commands/gsd/ must contain .md command files'
    );
  });

  test('commands/gsd/*.md: files with user-visible /gsd- command refs have been updated', () => {
    const files = getCommandFiles();
    if (files.length === 0) return;

    const problematic = findFilesWithBareGsdCommandRefs(files);

    // Build a detailed failure message
    let detail = '';
    if (problematic.length > 0) {
      detail = problematic.map(({ name, badLines }) =>
        `  ${name}:\n${badLines.map(l => `    "${l.trim()}"`).join('\n')}`
      ).join('\n');
    }

    assert.strictEqual(
      problematic.length,
      0,
      `Found ${problematic.length} command file(s) with bare /gsd- user-visible refs (should be /gsdcn-):\n${detail}`
    );
  });

  test('commands/gsd/*.md: at least some files reference /gsdcn- prefix', () => {
    const files = getCommandFiles();
    const filesWithGsdcn = files.filter(({ path: filePath }) => {
      const content = readFile(filePath);
      return content.includes('/gsdcn-');
    });
    assert.ok(
      filesWithGsdcn.length > 0,
      'At least some commands/gsd/*.md files must contain /gsdcn- prefix references'
    );
  });

});

// ─── Tests: docs/COMMANDS.md vs commands/gsd/*.md consistency ─────────────────

describe('docs/COMMANDS.md vs commands/gsd/ consistency', () => {

  test('docs/COMMANDS.md prefix rule is consistent with commands/gsd/ prefix rule', () => {
    const docsContent = readFile(COMMANDS_DOC_PATH);

    // Both should use gsdcn- as the primary prefix
    const docsBareGsd = findBareGsdRefs(docsContent).length;

    assert.strictEqual(
      docsBareGsd,
      0,
      `docs/COMMANDS.md must not have bare /gsd- refs; found ${docsBareGsd}. ` +
        'Both docs and source command files must follow the same gsdcn- prefix rule.'
    );
  });

  test('README.md and docs/COMMANDS.md agree: both use gsdcn- as primary command prefix', () => {
    const readmeContent = readFile(README_PATH);
    const docsContent = readFile(COMMANDS_DOC_PATH);

    const readmeHasGsdcn = readmeContent.includes('/gsdcn-');
    const docsHasGsdcn = docsContent.includes('/gsdcn-');

    assert.ok(
      readmeHasGsdcn,
      'README.md must use /gsdcn- command prefix'
    );
    assert.ok(
      docsHasGsdcn,
      'docs/COMMANDS.md must use /gsdcn- command prefix'
    );
  });

  test('README.md: no bare /gsd- command examples that conflict with gsdcn- brand', () => {
    const content = readFile(README_PATH);
    const bareGsdRefs = findBareGsdRefs(content);
    // Allow zero bare /gsd- refs in README
    assert.strictEqual(
      bareGsdRefs.length,
      0,
      `README.md must not have bare /gsd- command examples; found: ${bareGsdRefs.slice(0, 5).join(', ')}`
    );
  });

});

// ─── Tests: Mixed prefix detection across key surfaces ────────────────────────

describe('Mixed prefix detection — command surfaces must not mix gsd- and gsdcn-', () => {

  const KEY_SURFACES = [
    { name: 'README.md', path: README_PATH },
    { name: 'docs/COMMANDS.md', path: COMMANDS_DOC_PATH },
  ];

  for (const { name, path: filePath } of KEY_SURFACES) {
    test(`${name}: no mixed /gsd-xxx and /gsdcn-xxx in same command section`, () => {
      const content = readFile(filePath);
      const lines = content.split('\n');

      // Look for consecutive blocks (within 5 lines) that mix both prefixes.
      // Exclusions: skip windows where the /gsd- occurrence is a URL or a
      // coexistence contrast line (both gsd- and gsdcn- on the same line).
      const mixedBlocks = [];
      for (let i = 0; i < lines.length; i++) {
        const window = lines.slice(i, i + 5).join('\n');
        const hasNew = /\/gsdcn-/.test(window);
        if (!hasNew) continue;
        // Filter out URL lines and coexistence contrast lines before checking for old refs
        const filteredWindow = lines.slice(i, i + 5)
          .filter(l => !/https?:\/\//.test(l))          // exclude URL lines
          .filter(l => !(/gsd-/.test(l) && /gsdcn-/.test(l))) // exclude contrast lines
          .join('\n');
        const hasOld = /\/gsd-[^c]/.test(filteredWindow);
        if (hasOld && hasNew) {
          mixedBlocks.push(`Line ${i + 1}: "${lines[i].trim()}"`);
        }
      }

      // Filter deduplicate (overlapping windows)
      const unique = [...new Set(mixedBlocks)];

      assert.strictEqual(
        unique.length,
        0,
        `${name}: found mixed /gsd- and /gsdcn- prefixes in ${unique.length} location(s):\n` +
        unique.slice(0, 5).map(l => `  ${l}`).join('\n')
      );
    });
  }

});

// ─── Tests: Command file frontmatter description quality ──────────────────────

describe('commands/gsd/*.md — frontmatter description quality', () => {

  test('command files have non-empty description fields', () => {
    const files = getCommandFiles();
    const emptyDescriptions = files.filter(({ path: filePath }) => {
      const content = readFile(filePath);
      const match = content.match(/^description:\s*(.+)$/m);
      return !match || !match[1].trim();
    });
    // Allow up to 5 files to not have descriptions (some may be internal-only)
    assert.ok(
      emptyDescriptions.length <= 5,
      `Too many command files missing descriptions: ${emptyDescriptions.map(f => f.name).join(', ')}`
    );
  });

  test('command files that have description fields do not reference old gsd- prefix in descriptions', () => {
    const files = getCommandFiles();
    const problemFiles = [];
    for (const { name, path: filePath } of files) {
      const content = readFile(filePath);
      // Extract description lines only
      const descMatch = content.match(/^description:\s*(.+)$/m);
      if (descMatch) {
        const desc = descMatch[1];
        if (/\/gsd-[^c]/.test(desc)) {
          problemFiles.push({ name, desc });
        }
      }
    }
    assert.strictEqual(
      problemFiles.length,
      0,
      `${problemFiles.length} command file(s) have old /gsd- in description field:\n` +
      problemFiles.map(f => `  ${f.name}: "${f.desc}"`).join('\n')
    );
  });

});
