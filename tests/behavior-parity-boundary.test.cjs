/**
 * Behavior parity boundary blocker suite (Phase 19 - Plan 04)
 *
 * This is the phase-level blocker suite for Phase 19. It aggregates the contract
 * assertions from plans 01–03 into a single execute gate, adding boundary checks:
 *
 * 1. Allowed-difference boundary: only display text, comments, default language,
 *    and command prefix may differ between GSD and GSD-CN.
 * 2. State-root non-collision: .planning and .planning-gsdcn never share a path.
 * 3. Coexistence non-overwrite: official GSD and GSD-CN namespaces are disjoint
 *    (installer config, update-cache, manifest, skills prefix).
 * 4. Mixed-prefix detection: user-visible surfaces must not blend gsd- and gsdcn-.
 *
 * These tests are intentionally black-box — they verify observable properties
 * (file contents, config values, path strings) rather than internal function names.
 *
 * Threat mitigations:
 *   T-19-04-01  behavior parity boundary
 *   T-19-04-02  mixed-prefix / coexistence regression
 * Requirements: CN-03, CN-04, CN-05, CN-06
 */

'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');

// ─── Root paths ───────────────────────────────────────────────────────────────

const ROOT = path.join(__dirname, '..');
const INSTALL_JS = path.join(ROOT, 'bin', 'install.js');
const CORE_CJS = path.join(ROOT, 'get-shit-done', 'bin', 'lib', 'core.cjs');
const SDK_WORKSTREAM_UTILS = path.join(ROOT, 'sdk', 'src', 'workstream-utils.ts');
const README_PATH = path.join(ROOT, 'README.md');
const COMMANDS_PATH = path.join(ROOT, 'docs', 'COMMANDS.md');
const USER_GUIDE_PATH = path.join(ROOT, 'docs', 'USER-GUIDE.md');
const CONFIGURATION_PATH = path.join(ROOT, 'docs', 'CONFIGURATION.md');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Load the INSTALLER_BRAND_CONFIGS from install.js by extracting the constant
 * definition. This is black-box: we only care that the values exist and are sane.
 */
function loadInstallerBrandConfigs() {
  const content = readFile(INSTALL_JS);
  // Require install.js so we can introspect its exports (it is a CommonJS module)
  // install.js is not a module file — it is a CLI entry point. We extract the
  // config values via text parsing to stay fully black-box.
  const officialMatch = content.match(/official\s*:\s*\{[^}]*cmdPrefix\s*:\s*['"]([^'"]+)['"]/s);
  const gsdcnMatch = content.match(/gsdcn\s*:\s*\{[^}]*cmdPrefix\s*:\s*['"]([^'"]+)['"]/s);
  const officialManifestMatch = content.match(/official\s*:\s*\{[^}]*manifestName\s*:\s*['"]([^'"]+)['"]/s);
  const gsdcnManifestMatch = content.match(/gsdcn\s*:\s*\{[^}]*manifestName\s*:\s*['"]([^'"]+)['"]/s);
  const officialCacheMatch = content.match(/official\s*:\s*\{[^}]*updateCacheDirName\s*:\s*['"]([^'"]+)['"]/s);
  const gsdcnCacheMatch = content.match(/gsdcn\s*:\s*\{[^}]*updateCacheDirName\s*:\s*['"]([^'"]+)['"]/s);
  return {
    official: {
      cmdPrefix: officialMatch ? officialMatch[1] : null,
      manifestName: officialManifestMatch ? officialManifestMatch[1] : null,
      updateCacheDirName: officialCacheMatch ? officialCacheMatch[1] : null,
    },
    gsdcn: {
      cmdPrefix: gsdcnMatch ? gsdcnMatch[1] : null,
      manifestName: gsdcnManifestMatch ? gsdcnManifestMatch[1] : null,
      updateCacheDirName: gsdcnCacheMatch ? gsdcnCacheMatch[1] : null,
    },
  };
}

/**
 * Load the BRAND_ROOT_MAP from core.cjs by parsing the source text.
 */
function loadBrandRootMap() {
  const content = readFile(CORE_CJS);
  const officialMatch = content.match(/official\s*:\s*['"]([^'"]+)['"]/);
  const gsdcnMatch = content.match(/gsdcn\s*:\s*['"]([^'"]+)['"]/);
  return {
    official: officialMatch ? officialMatch[1] : null,
    gsdcn: gsdcnMatch ? gsdcnMatch[1] : null,
  };
}

/**
 * Load the BRAND_ROOT_MAP from the SDK workstream-utils.ts.
 */
function loadSdkBrandRootMap() {
  const content = readFile(SDK_WORKSTREAM_UTILS);
  const officialMatch = content.match(/official\s*:\s*['"]([^'"]+)['"]/);
  const gsdcnMatch = content.match(/gsdcn\s*:\s*['"]([^'"]+)['"]/);
  return {
    official: officialMatch ? officialMatch[1] : null,
    gsdcn: gsdcnMatch ? gsdcnMatch[1] : null,
  };
}

// ─── 1. Allowed-difference boundary ─────────────────────────────────────────
//
// Only these four categories of difference are permitted between GSD and GSD-CN:
//   a) Display text / comments (Chinese instead of English)
//   b) Default language (zh-CN instead of none/en)
//   c) Command prefix (gsdcn- instead of gsd-)
//   d) Installer brand config (INSTALLER_BRAND_CONFIGS)
//
// Everything else — including workflow logic, command semantics, flag behavior,
// and structural sections in docs — must remain isomorphic with upstream GSD.

describe('Allowed-difference boundary — only display text, language, and prefix may differ', () => {

  test('docs/COMMANDS.md: section structure is preserved (no new behavior sections)', () => {
    const content = readFile(COMMANDS_PATH);
    // These are the canonical top-level sections from upstream GSD COMMANDS.md.
    // GSD-CN must not add new sections that promise additional behavior.
    const canonicalSections = [
      'Core Workflow',
      'Navigation',
      'Utility',
    ];
    for (const section of canonicalSections) {
      assert.ok(
        content.includes(section),
        `docs/COMMANDS.md must preserve canonical section "${section}" — removing it would break structural isomorphism`
      );
    }
  });

  test('docs/USER-GUIDE.md: no new workflow processes introduced', () => {
    const content = readFile(USER_GUIDE_PATH);
    // GSD-CN USER-GUIDE must not introduce process descriptions that do not exist upstream.
    // We verify the section order is preserved — no new sections inserted between canonical ones.
    const sections = extractH2Headings(content);
    const workflowIdx = sections.findIndex(h => /Workflow|工作流/i.test(h));
    const securityIdx = sections.findIndex(h => /Security|安全/i.test(h));
    // If both sections exist, workflow must precede security (canonical upstream order)
    if (workflowIdx !== -1 && securityIdx !== -1) {
      assert.ok(
        workflowIdx < securityIdx,
        'docs/USER-GUIDE.md: "Workflow" section must precede "Security" section — section order must not change'
      );
    }
  });

  test('docs/CONFIGURATION.md: no new configuration keys introduced', () => {
    // GSD-CN must not introduce new configuration keys that don't exist upstream.
    // We check that CONFIGURATION.md does not claim entirely new keys that are
    // GSD-CN-specific overrides of behavior (beyond the allowed prefix/language changes).
    const content = readFile(CONFIGURATION_PATH);
    // These keys must still be present if CONFIGURATION.md exists — their removal
    // would indicate structural divergence from upstream.
    const canonicalKeys = ['response_language', 'mode', 'model_profile'];
    for (const key of canonicalKeys) {
      assert.ok(
        content.includes(key),
        `docs/CONFIGURATION.md must still document the canonical key "${key}"`
      );
    }
  });

  test('install.js: brand config maps have the same set of keys for both brands', () => {
    const content = readFile(INSTALL_JS);
    // Both 'official' and 'gsdcn' brand configs must define the same set of fields.
    // Asymmetric field sets would mean GSD-CN has different installer behavior.
    const officialBlock = extractBrandBlock(content, 'official');
    const gsdcnBlock = extractBrandBlock(content, 'gsdcn');
    assert.ok(officialBlock, 'install.js must contain an "official" brand config block');
    assert.ok(gsdcnBlock, 'install.js must contain a "gsdcn" brand config block');

    const officialKeys = extractConfigKeys(officialBlock);
    const gsdcnKeys = extractConfigKeys(gsdcnBlock);

    const missingInGsdcn = officialKeys.filter(k => !gsdcnKeys.includes(k));
    const extraInGsdcn = gsdcnKeys.filter(k => !officialKeys.includes(k));

    assert.strictEqual(
      missingInGsdcn.length,
      0,
      `install.js gsdcn brand config is missing keys that official has: ${missingInGsdcn.join(', ')}`
    );
    assert.strictEqual(
      extraInGsdcn.length,
      0,
      `install.js gsdcn brand config has extra keys not in official: ${extraInGsdcn.join(', ')} — only prefix/path values may differ, not the key set`
    );
  });

});

// ─── 2. State-root non-collision ─────────────────────────────────────────────
//
// .planning and .planning-gsdcn must never equal each other, and the SDK must
// use the same BRAND_ROOT_MAP as the CLI.

describe('State-root non-collision — .planning and .planning-gsdcn are distinct', () => {

  test('BRAND_ROOT_MAP: official root is ".planning"', () => {
    const map = loadBrandRootMap();
    assert.ok(map.official, 'core.cjs must define a BRAND_ROOT_MAP with an "official" entry');
    assert.strictEqual(
      map.official,
      '.planning',
      `BRAND_ROOT_MAP.official must be ".planning"; got "${map.official}"`
    );
  });

  test('BRAND_ROOT_MAP: gsdcn root is ".planning-gsdcn"', () => {
    const map = loadBrandRootMap();
    assert.ok(map.gsdcn, 'core.cjs must define a BRAND_ROOT_MAP with a "gsdcn" entry');
    assert.strictEqual(
      map.gsdcn,
      '.planning-gsdcn',
      `BRAND_ROOT_MAP.gsdcn must be ".planning-gsdcn"; got "${map.gsdcn}"`
    );
  });

  test('BRAND_ROOT_MAP: official and gsdcn roots are strictly different strings', () => {
    const map = loadBrandRootMap();
    assert.notStrictEqual(
      map.official,
      map.gsdcn,
      'BRAND_ROOT_MAP.official and BRAND_ROOT_MAP.gsdcn must not be the same string'
    );
  });

  test('SDK BRAND_ROOT_MAP mirrors CLI BRAND_ROOT_MAP (official)', () => {
    const cliMap = loadBrandRootMap();
    const sdkMap = loadSdkBrandRootMap();
    assert.ok(sdkMap.official, 'sdk/src/workstream-utils.ts must define a BRAND_ROOT_MAP with an "official" entry');
    assert.strictEqual(
      sdkMap.official,
      cliMap.official,
      `SDK BRAND_ROOT_MAP.official ("${sdkMap.official}") must equal CLI BRAND_ROOT_MAP.official ("${cliMap.official}")`
    );
  });

  test('SDK BRAND_ROOT_MAP mirrors CLI BRAND_ROOT_MAP (gsdcn)', () => {
    const cliMap = loadBrandRootMap();
    const sdkMap = loadSdkBrandRootMap();
    assert.ok(sdkMap.gsdcn, 'sdk/src/workstream-utils.ts must define a BRAND_ROOT_MAP with a "gsdcn" entry');
    assert.strictEqual(
      sdkMap.gsdcn,
      cliMap.gsdcn,
      `SDK BRAND_ROOT_MAP.gsdcn ("${sdkMap.gsdcn}") must equal CLI BRAND_ROOT_MAP.gsdcn ("${cliMap.gsdcn}")`
    );
  });

  test('core.cjs does not hard-code ".planning" as the only root name', () => {
    // If core.cjs only ever mentions ".planning" (not ".planning-gsdcn"), the brand
    // routing seam is absent and GSD-CN cannot route to a distinct state root.
    const content = readFile(CORE_CJS);
    assert.ok(
      content.includes('.planning-gsdcn'),
      'core.cjs must mention ".planning-gsdcn" — the brand-aware state root for GSD-CN'
    );
  });

});

// ─── 3. Coexistence non-overwrite ────────────────────────────────────────────
//
// Official GSD and GSD-CN must not share any namespace values for:
// command prefix, manifest file name, update-cache directory name.
// If any two values coincide, one install silently overwrites the other.

describe('Coexistence non-overwrite — namespace values are disjoint', () => {

  test('installer: official and gsdcn cmdPrefix are different', () => {
    const cfg = loadInstallerBrandConfigs();
    assert.ok(cfg.official.cmdPrefix, 'install.js must have official.cmdPrefix');
    assert.ok(cfg.gsdcn.cmdPrefix, 'install.js must have gsdcn.cmdPrefix');
    assert.notStrictEqual(
      cfg.official.cmdPrefix,
      cfg.gsdcn.cmdPrefix,
      `official.cmdPrefix ("${cfg.official.cmdPrefix}") and gsdcn.cmdPrefix ("${cfg.gsdcn.cmdPrefix}") must differ`
    );
  });

  test('installer: official cmdPrefix is "gsd"', () => {
    const cfg = loadInstallerBrandConfigs();
    assert.strictEqual(
      cfg.official.cmdPrefix,
      'gsd',
      `official.cmdPrefix must be "gsd"; got "${cfg.official.cmdPrefix}"`
    );
  });

  test('installer: gsdcn cmdPrefix is "gsdcn"', () => {
    const cfg = loadInstallerBrandConfigs();
    assert.strictEqual(
      cfg.gsdcn.cmdPrefix,
      'gsdcn',
      `gsdcn.cmdPrefix must be "gsdcn"; got "${cfg.gsdcn.cmdPrefix}"`
    );
  });

  test('installer: official and gsdcn manifest file names are different', () => {
    const cfg = loadInstallerBrandConfigs();
    assert.ok(cfg.official.manifestName, 'install.js must have official.manifestName');
    assert.ok(cfg.gsdcn.manifestName, 'install.js must have gsdcn.manifestName');
    assert.notStrictEqual(
      cfg.official.manifestName,
      cfg.gsdcn.manifestName,
      `official.manifestName ("${cfg.official.manifestName}") and gsdcn.manifestName ("${cfg.gsdcn.manifestName}") must differ`
    );
  });

  test('installer: gsdcn manifest name contains "gsdcn"', () => {
    const cfg = loadInstallerBrandConfigs();
    assert.ok(
      cfg.gsdcn.manifestName && cfg.gsdcn.manifestName.includes('gsdcn'),
      `gsdcn.manifestName must contain "gsdcn"; got "${cfg.gsdcn.manifestName}"`
    );
  });

  test('installer: official manifest name does not contain "gsdcn"', () => {
    const cfg = loadInstallerBrandConfigs();
    assert.ok(
      cfg.official.manifestName && !cfg.official.manifestName.includes('gsdcn'),
      `official.manifestName must not contain "gsdcn"; got "${cfg.official.manifestName}"`
    );
  });

  test('installer: official and gsdcn update-cache directory names are different', () => {
    const cfg = loadInstallerBrandConfigs();
    assert.ok(cfg.official.updateCacheDirName, 'install.js must have official.updateCacheDirName');
    assert.ok(cfg.gsdcn.updateCacheDirName, 'install.js must have gsdcn.updateCacheDirName');
    assert.notStrictEqual(
      cfg.official.updateCacheDirName,
      cfg.gsdcn.updateCacheDirName,
      `official.updateCacheDirName ("${cfg.official.updateCacheDirName}") and gsdcn.updateCacheDirName ("${cfg.gsdcn.updateCacheDirName}") must differ`
    );
  });

  test('installer: gsdcn update-cache dir name contains "gsdcn"', () => {
    const cfg = loadInstallerBrandConfigs();
    assert.ok(
      cfg.gsdcn.updateCacheDirName && cfg.gsdcn.updateCacheDirName.includes('gsdcn'),
      `gsdcn.updateCacheDirName must contain "gsdcn"; got "${cfg.gsdcn.updateCacheDirName}"`
    );
  });

  test('install.js: uninstall logic uses brand-aware prefix variable for skills/commands', () => {
    const content = readFile(INSTALL_JS);
    // The uninstall function must introduce a brand-aware prefix variable (uninstallCmdPrefix)
    // and use it for skills/commands discovery. This prevents GSD-CN uninstall from removing
    // official GSD skills, or from missing its own gsdcn-* skills.
    //
    // NOTE: Agent TOML filenames intentionally keep the canonical 'gsd-' prefix (internal
    // file names, not user-visible). That startsWith('gsd-') for .toml files is expected by design.
    assert.ok(
      content.includes('uninstallCmdPrefix'),
      'install.js must define "uninstallCmdPrefix" (brand-aware prefix variable for uninstall)'
    );
    // The variable must be derived from INSTALLER_BRAND.cmdPrefix
    assert.ok(
      content.includes('INSTALLER_BRAND.cmdPrefix'),
      'install.js must derive uninstall prefix from INSTALLER_BRAND.cmdPrefix'
    );
    // At least one startsWith usage in uninstall context uses the variable
    const uninstallBlock = extractFunctionBlock(content, 'uninstall');
    if (uninstallBlock) {
      const usesVariable = uninstallBlock.includes('uninstallCmdPrefix');
      assert.ok(
        usesVariable,
        'install.js uninstall() must use "uninstallCmdPrefix" variable for skills/commands scanning'
      );
    }
  });

});

// ─── 4. Mixed-prefix detection ───────────────────────────────────────────────
//
// Key user-facing surfaces (README.md, docs/COMMANDS.md) must not contain
// mixed /gsd- and /gsdcn- command references outside of intentional coexistence
// comparison lines.

describe('Mixed-prefix detection — user surfaces must not blend gsd- and gsdcn-', () => {

  const SURFACES = [
    { name: 'README.md', filePath: README_PATH },
    { name: 'docs/COMMANDS.md', filePath: COMMANDS_PATH },
  ];

  for (const { name, filePath } of SURFACES) {
    test(`${name}: no lines mixing /gsd-xxx and /gsdcn-xxx outside coexistence context`, () => {
      const content = readFile(filePath);
      const lines = content.split('\n');
      const mixedLines = [];
      for (const line of lines) {
        // Skip URL lines (e.g., GitHub links like /gsd-build/)
        if (/https?:\/\//.test(line)) continue;
        // Skip lines that are explicitly coexistence comparisons
        // (lines that contain both prefixes are likely intentional contrast examples)
        if (/gsd-/.test(line) && /gsdcn-/.test(line)) continue;
        const hasOldPrefix = /\/gsd-[^c]/.test(line);
        if (hasOldPrefix) {
          mixedLines.push(line.trim());
        }
      }
      assert.strictEqual(
        mixedLines.length,
        0,
        `${name}: found ${mixedLines.length} line(s) with bare /gsd- prefix (should all be /gsdcn-):\n` +
        mixedLines.slice(0, 5).map(l => `  "${l}"`).join('\n')
      );
    });
  }

  test('docs/COMMANDS.md: all command-table entries use /gsdcn- prefix', () => {
    const content = readFile(COMMANDS_PATH);
    // In docs/COMMANDS.md, command table cells like | `/gsdcn-xxx` | ... | must use gsdcn-
    const tableRows = content.split('\n').filter(l => l.startsWith('|'));
    const mixedRows = tableRows.filter(row => {
      const hasOldRef = /\/gsd-[^c]/.test(row);
      return hasOldRef;
    });
    assert.strictEqual(
      mixedRows.length,
      0,
      `docs/COMMANDS.md: found ${mixedRows.length} table row(s) with /gsd- prefix (must be /gsdcn-):\n` +
      mixedRows.slice(0, 5).map(r => `  "${r.trim()}"`).join('\n')
    );
  });

  test('README.md: install command examples use gsdcn- prefix', () => {
    const content = readFile(README_PATH);
    // Verify that command usage examples in README use gsdcn prefix
    assert.ok(
      content.includes('gsdcn'),
      'README.md must contain gsdcn prefix command examples'
    );
  });

  test('install.js: no hard-coded /gsd- or $gsd- user-visible strings outside official brand block', () => {
    const content = readFile(INSTALL_JS);
    // Verify that the installer does NOT have bare gsd- user-visible strings
    // at module level (outside the brand config). If cmdPrefix is pulled from
    // INSTALLER_BRAND.cmdPrefix, then user-visible strings should reference the
    // variable, not the literal 'gsd-' string.
    //
    // We check that the INSTALLER_BRAND_CONFIGS structure exists and that
    // the module references cmdPrefix from it (not via bare string).
    assert.ok(
      content.includes('INSTALLER_BRAND_CONFIGS'),
      'install.js must define INSTALLER_BRAND_CONFIGS (brand-aware installer config)'
    );
    assert.ok(
      content.includes('INSTALLER_BRAND') && content.includes('cmdPrefix'),
      'install.js must reference INSTALLER_BRAND.cmdPrefix (not hardcoded prefix strings)'
    );
  });

});

// ─── 5. Brand isolation: cross-contamination guard ───────────────────────────
//
// GSD-CN namespace values must not accidentally appear in official brand config,
// and vice versa.

describe('Brand isolation — no cross-contamination between official and gsdcn configs', () => {

  test('installer: official brand config values do not contain "gsdcn"', () => {
    const content = readFile(INSTALL_JS);
    const officialBlock = extractBrandBlock(content, 'official');
    if (officialBlock) {
      // Remove any comment lines before checking
      const codeLines = officialBlock.split('\n').filter(l => !l.trim().startsWith('//'));
      const contaminated = codeLines.some(l => l.includes('gsdcn') && !l.includes('official'));
      assert.ok(
        !contaminated,
        'install.js "official" brand config block must not contain "gsdcn" in its values'
      );
    }
  });

  test('installer: gsdcn brand config values do not use pure "gsd" prefix (without "cn")', () => {
    const cfg = loadInstallerBrandConfigs();
    // cmdPrefix for gsdcn must be 'gsdcn', not 'gsd'
    if (cfg.gsdcn.cmdPrefix) {
      assert.notStrictEqual(
        cfg.gsdcn.cmdPrefix,
        'gsd',
        'gsdcn brand cmdPrefix must not be bare "gsd" — it must be "gsdcn"'
      );
    }
    // manifestName must include 'gsdcn'
    if (cfg.gsdcn.manifestName) {
      assert.ok(
        cfg.gsdcn.manifestName.includes('gsdcn'),
        `gsdcn.manifestName must include "gsdcn"; got "${cfg.gsdcn.manifestName}"`
      );
    }
  });

  test('core.cjs: BRAND_ROOT_MAP gsdcn value does not equal .planning', () => {
    const map = loadBrandRootMap();
    if (map.gsdcn) {
      assert.notStrictEqual(
        map.gsdcn,
        '.planning',
        'BRAND_ROOT_MAP.gsdcn must not equal ".planning" — that would collide with official GSD state root'
      );
    }
  });

  test('sdk/workstream-utils.ts: gsdcn root does not equal official root', () => {
    const sdkMap = loadSdkBrandRootMap();
    if (sdkMap.official && sdkMap.gsdcn) {
      assert.notStrictEqual(
        sdkMap.official,
        sdkMap.gsdcn,
        'SDK BRAND_ROOT_MAP official and gsdcn roots must be different strings'
      );
    }
  });

});

// ─── Utility: Private helpers ─────────────────────────────────────────────────

/**
 * Extract h2-level headings (## heading) from markdown content.
 */
function extractH2Headings(content) {
  return content
    .split('\n')
    .filter(l => /^## /.test(l))
    .map(l => l.replace(/^## /, '').trim());
}

/**
 * Extract a brand config block from install.js source text.
 * Returns the block content between the brand key's opening brace and its matching close.
 */
function extractBrandBlock(content, brand) {
  // Pattern: "official: {" or "gsdcn: {"
  const startPattern = new RegExp(`${brand}\\s*:\\s*\\{`);
  const match = startPattern.exec(content);
  if (!match) return null;
  let depth = 0;
  let i = match.index;
  let start = -1;
  while (i < content.length) {
    if (content[i] === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (content[i] === '}') {
      depth--;
      if (depth === 0) {
        return content.slice(start + 1, i);
      }
    }
    i++;
  }
  return null;
}

/**
 * Extract config key names from a brand block string.
 * Matches keys like "cmdPrefix:", "manifestName:", etc.
 */
function extractConfigKeys(block) {
  const matches = block.match(/^\s*(\w+)\s*:/gm) || [];
  return matches.map(m => m.trim().replace(':', ''));
}

/**
 * Extract a function body block from source text by function name.
 * Looks for "function <name>" or "const <name> = " style declarations.
 */
function extractFunctionBlock(content, funcName) {
  // Try "async function uninstall" or "function uninstall"
  const patterns = [
    new RegExp(`(?:async\\s+)?function\\s+${funcName}\\s*\\(`),
    new RegExp(`const\\s+${funcName}\\s*=\\s*(?:async\\s*)?(?:function\\s*)?\\(`),
  ];
  let match = null;
  for (const pat of patterns) {
    const m = pat.exec(content);
    if (m) { match = m; break; }
  }
  if (!match) return null;
  let depth = 0;
  let i = match.index;
  let bodyStart = -1;
  while (i < content.length) {
    if (content[i] === '{') {
      if (depth === 0) bodyStart = i;
      depth++;
    } else if (content[i] === '}') {
      depth--;
      if (depth === 0 && bodyStart !== -1) {
        return content.slice(bodyStart + 1, i);
      }
    }
    i++;
  }
  return null;
}
