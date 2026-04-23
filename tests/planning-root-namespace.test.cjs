/**
 * Planning root namespace contract tests (Phase 19 - Plan 01)
 *
 * Covers:
 * 1. Official GSD default still routes to `.planning`
 * 2. GSD-CN explicit brand routes to `.planning-gsdcn`
 * 3. GSD_BRAND env var routes correctly for both brands
 * 4. workstream composition works under both brands without cross-root leakage
 * 5. project + workstream stacked routing under both brands
 * 6. SDK helper (relPlanningPath / resolvePlanningRootName) returns the same
 *    logical root as the CLI helper (resolvePlanningRootName / planningDir)
 * 7. BRAND_ROOT_MAP constants are consistent between CLI and SDK
 *
 * These tests lock the planning-root contract so future upstream syncs
 * cannot silently break the GSD-CN state root isolation (T-19-01-01 through
 * T-19-01-03).
 */

'use strict';

const { describe, test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const os = require('os');

// ─── Module paths ─────────────────────────────────────────────────────────────

const CORE_PATH = path.join(__dirname, '..', 'get-shit-done', 'bin', 'lib', 'core.cjs');
const SDK_WORKSTREAM_UTILS_PATH = path.join(__dirname, '..', 'sdk', 'src', 'workstream-utils.ts');

// We load the compiled SDK output (dist/workstream-utils.js) when available.
// If the build hasn't run we fall back to dynamic import of the TS source via
// ts-node — but in CI and after `npm --prefix sdk run build` the dist file is
// always present.
const SDK_DIST_UTILS_PATH = path.join(__dirname, '..', 'sdk', 'dist', 'workstream-utils.js');

// ─── Helper: load SDK workstream-utils (either dist or error) ─────────────────

function loadSdkUtils() {
  if (fs.existsSync(SDK_DIST_UTILS_PATH)) {
    return require(SDK_DIST_UTILS_PATH);
  }
  // SDK not built yet — return null so tests that depend on it are skipped
  return null;
}

// ─── Helper: fresh core module (env-var isolation) ────────────────────────────

/**
 * Load core.cjs in a fresh module context with the given env overrides.
 * Clears the module cache for core.cjs so GSD_BRAND env var changes take effect.
 */
function loadCoreWithEnv(envOverrides = {}) {
  // Delete cached module so re-require picks up new env vars
  delete require.cache[require.resolve(CORE_PATH)];
  const origEnv = {};
  for (const [k, v] of Object.entries(envOverrides)) {
    origEnv[k] = process.env[k];
    if (v === undefined) {
      delete process.env[k];
    } else {
      process.env[k] = v;
    }
  }
  const mod = require(CORE_PATH);
  // Restore env
  for (const [k, v] of Object.entries(origEnv)) {
    if (v === undefined) {
      delete process.env[k];
    } else {
      process.env[k] = v;
    }
  }
  return mod;
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('Planning root namespace — CLI (core.cjs)', () => {

  // Ensure GSD_BRAND is clean before each test (unless the test sets it explicitly)
  beforeEach(() => {
    delete process.env.GSD_BRAND;
    delete require.cache[require.resolve(CORE_PATH)];
  });

  afterEach(() => {
    delete process.env.GSD_BRAND;
    delete require.cache[require.resolve(CORE_PATH)];
  });

  // ── BRAND_ROOT_MAP contract ────────────────────────────────────────────────

  test('BRAND_ROOT_MAP is exported and contains official and gsdcn entries', () => {
    const core = require(CORE_PATH);
    assert.ok(core.BRAND_ROOT_MAP, 'BRAND_ROOT_MAP must be exported');
    assert.strictEqual(core.BRAND_ROOT_MAP.official, '.planning', 'official brand maps to .planning');
    assert.strictEqual(core.BRAND_ROOT_MAP.gsdcn, '.planning-gsdcn', 'gsdcn brand maps to .planning-gsdcn');
  });

  test('resolvePlanningRootName is exported', () => {
    const core = require(CORE_PATH);
    assert.strictEqual(typeof core.resolvePlanningRootName, 'function');
  });

  // ── Default behavior (no brand set) ───────────────────────────────────────

  test('resolvePlanningRootName() with no argument returns .planning (official default)', () => {
    const core = require(CORE_PATH);
    assert.strictEqual(core.resolvePlanningRootName(), '.planning');
  });

  test('resolvePlanningRootName("official") returns .planning', () => {
    const core = require(CORE_PATH);
    assert.strictEqual(core.resolvePlanningRootName('official'), '.planning');
  });

  test('planningDir() without brand returns path ending in .planning', () => {
    const core = require(CORE_PATH);
    const result = core.planningDir('/project/root');
    assert.ok(
      result.endsWith(path.join('', '.planning')),
      `Expected .planning suffix, got: ${result}`
    );
  });

  test('planningRoot() without brand returns path ending in .planning', () => {
    const core = require(CORE_PATH);
    const result = core.planningRoot('/project/root');
    assert.ok(
      result.endsWith(path.join('', '.planning')),
      `Expected .planning suffix, got: ${result}`
    );
  });

  // ── GSD-CN brand explicit ─────────────────────────────────────────────────

  test('resolvePlanningRootName("gsdcn") returns .planning-gsdcn', () => {
    const core = require(CORE_PATH);
    assert.strictEqual(core.resolvePlanningRootName('gsdcn'), '.planning-gsdcn');
  });

  test('planningDir() with brand="gsdcn" returns path ending in .planning-gsdcn', () => {
    const core = require(CORE_PATH);
    const result = core.planningDir('/project/root', null, null, 'gsdcn');
    assert.ok(
      result.includes('.planning-gsdcn'),
      `Expected .planning-gsdcn in path, got: ${result}`
    );
    assert.ok(
      !result.includes(path.join('.planning-gsdcn', 'gsdcn')),
      'brand name must not appear twice in path'
    );
  });

  test('planningRoot() with brand="gsdcn" returns path ending in .planning-gsdcn', () => {
    const core = require(CORE_PATH);
    const result = core.planningRoot('/project/root', 'gsdcn');
    assert.ok(
      result.includes('.planning-gsdcn'),
      `Expected .planning-gsdcn in path, got: ${result}`
    );
  });

  // ── GSD_BRAND env var ─────────────────────────────────────────────────────

  test('GSD_BRAND=gsdcn makes planningDir() route to .planning-gsdcn', () => {
    const core = loadCoreWithEnv({ GSD_BRAND: 'gsdcn' });
    // env already set before require, so we need fresh require after setting
    process.env.GSD_BRAND = 'gsdcn';
    delete require.cache[require.resolve(CORE_PATH)];
    const freshCore = require(CORE_PATH);
    const result = freshCore.planningDir('/project/root');
    assert.ok(result.includes('.planning-gsdcn'), `Expected .planning-gsdcn, got: ${result}`);
    delete process.env.GSD_BRAND;
    delete require.cache[require.resolve(CORE_PATH)];
  });

  test('GSD_BRAND=official makes planningDir() route to .planning', () => {
    process.env.GSD_BRAND = 'official';
    delete require.cache[require.resolve(CORE_PATH)];
    const freshCore = require(CORE_PATH);
    const result = freshCore.planningDir('/project/root');
    assert.ok(result.endsWith(path.join('', '.planning')), `Expected .planning, got: ${result}`);
    delete process.env.GSD_BRAND;
    delete require.cache[require.resolve(CORE_PATH)];
  });

  test('unset GSD_BRAND falls back to official (.planning)', () => {
    delete process.env.GSD_BRAND;
    delete require.cache[require.resolve(CORE_PATH)];
    const freshCore = require(CORE_PATH);
    const result = freshCore.planningDir('/project/root');
    assert.ok(result.endsWith(path.join('', '.planning')), `Expected .planning, got: ${result}`);
  });

  // ── Workstream composition ────────────────────────────────────────────────

  test('workstream composition under official brand: .planning/workstreams/<name>', () => {
    const core = require(CORE_PATH);
    const result = core.planningDir('/project/root', 'my-ws');
    const expected = path.join('/project/root', '.planning', 'workstreams', 'my-ws');
    assert.strictEqual(result, expected);
  });

  test('workstream composition under gsdcn brand: .planning-gsdcn/workstreams/<name>', () => {
    const core = require(CORE_PATH);
    const result = core.planningDir('/project/root', 'my-ws', null, 'gsdcn');
    const expected = path.join('/project/root', '.planning-gsdcn', 'workstreams', 'my-ws');
    assert.strictEqual(result, expected);
  });

  test('official workstream path does NOT contain .planning-gsdcn', () => {
    const core = require(CORE_PATH);
    const result = core.planningDir('/project/root', 'my-ws');
    assert.ok(!result.includes('.planning-gsdcn'), `Official path must not include .planning-gsdcn: ${result}`);
  });

  test('gsdcn workstream path does NOT contain bare .planning/ segment', () => {
    const core = require(CORE_PATH);
    const result = core.planningDir('/project/root', 'my-ws', null, 'gsdcn');
    // The path must not include a bare '.planning/' component (without -gsdcn suffix)
    const normalized = result.replace(/\\/g, '/');
    assert.ok(
      !normalized.match(/\/\.planning\//),
      `GSD-CN path must not contain bare .planning/ segment: ${result}`
    );
  });

  // ── Project + workstream stacking ─────────────────────────────────────────

  test('project + workstream stacking under official brand', () => {
    const core = require(CORE_PATH);
    const result = core.planningDir('/project/root', 'ws1', 'proj1');
    const expected = path.join('/project/root', '.planning', 'proj1', 'workstreams', 'ws1');
    assert.strictEqual(result, expected);
  });

  test('project + workstream stacking under gsdcn brand', () => {
    const core = require(CORE_PATH);
    const result = core.planningDir('/project/root', 'ws1', 'proj1', 'gsdcn');
    const expected = path.join('/project/root', '.planning-gsdcn', 'proj1', 'workstreams', 'ws1');
    assert.strictEqual(result, expected);
  });

  test('project + workstream stacking under gsdcn does NOT mix roots', () => {
    const core = require(CORE_PATH);
    const officialResult = core.planningDir('/project/root', 'ws1', 'proj1');
    const gsdcnResult = core.planningDir('/project/root', 'ws1', 'proj1', 'gsdcn');
    assert.notStrictEqual(officialResult, gsdcnResult, 'Official and GSD-CN paths must differ');
    assert.ok(!officialResult.includes('.planning-gsdcn'));
    assert.ok(gsdcnResult.includes('.planning-gsdcn'));
  });

  // ── planningPaths consistency ─────────────────────────────────────────────

  test('planningPaths() default returns paths rooted at .planning', () => {
    const core = require(CORE_PATH);
    const paths = core.planningPaths('/project/root');
    assert.ok(paths.planning.endsWith(path.join('', '.planning')));
    assert.ok(paths.state.includes('.planning'));
    assert.ok(!paths.state.includes('.planning-gsdcn'));
  });

  // ── Invalid brand falls back gracefully ──────────────────────────────────

  test('unknown brand string falls back to official (.planning)', () => {
    const core = require(CORE_PATH);
    const result = core.resolvePlanningRootName('nonexistent-brand');
    assert.strictEqual(result, '.planning');
  });

});

// ─── SDK workstream-utils tests ────────────────────────────────────────────────

describe('Planning root namespace — SDK (workstream-utils)', () => {
  const sdkUtils = loadSdkUtils();

  test('SDK dist is available (npm --prefix sdk run build must have run)', () => {
    assert.ok(
      fs.existsSync(SDK_DIST_UTILS_PATH),
      `SDK dist not found at ${SDK_DIST_UTILS_PATH} — run: npm --prefix sdk run build`
    );
  });

  test('BRAND_ROOT_MAP is exported from SDK', () => {
    if (!sdkUtils) return;
    assert.ok(sdkUtils.BRAND_ROOT_MAP, 'BRAND_ROOT_MAP must be exported from SDK');
    assert.strictEqual(sdkUtils.BRAND_ROOT_MAP.official, '.planning');
    assert.strictEqual(sdkUtils.BRAND_ROOT_MAP.gsdcn, '.planning-gsdcn');
  });

  test('resolvePlanningRootName is exported from SDK', () => {
    if (!sdkUtils) return;
    assert.strictEqual(typeof sdkUtils.resolvePlanningRootName, 'function');
  });

  test('SDK resolvePlanningRootName() default returns .planning', () => {
    if (!sdkUtils) return;
    assert.strictEqual(sdkUtils.resolvePlanningRootName(), '.planning');
  });

  test('SDK resolvePlanningRootName("official") returns .planning', () => {
    if (!sdkUtils) return;
    assert.strictEqual(sdkUtils.resolvePlanningRootName('official'), '.planning');
  });

  test('SDK resolvePlanningRootName("gsdcn") returns .planning-gsdcn', () => {
    if (!sdkUtils) return;
    assert.strictEqual(sdkUtils.resolvePlanningRootName('gsdcn'), '.planning-gsdcn');
  });

  test('SDK relPlanningPath() default returns .planning', () => {
    if (!sdkUtils) return;
    assert.strictEqual(sdkUtils.relPlanningPath(), '.planning');
  });

  test('SDK relPlanningPath(undefined, "gsdcn") returns .planning-gsdcn', () => {
    if (!sdkUtils) return;
    assert.strictEqual(sdkUtils.relPlanningPath(undefined, 'gsdcn'), '.planning-gsdcn');
  });

  test('SDK relPlanningPath("ws1") routes workstream under .planning', () => {
    if (!sdkUtils) return;
    assert.strictEqual(sdkUtils.relPlanningPath('ws1'), '.planning/workstreams/ws1');
  });

  test('SDK relPlanningPath("ws1", "gsdcn") routes workstream under .planning-gsdcn', () => {
    if (!sdkUtils) return;
    assert.strictEqual(sdkUtils.relPlanningPath('ws1', 'gsdcn'), '.planning-gsdcn/workstreams/ws1');
  });

  // ── Unknown brand fallback ────────────────────────────────────────────────

  test('SDK resolvePlanningRootName with unknown brand falls back to .planning', () => {
    if (!sdkUtils) return;
    assert.strictEqual(sdkUtils.resolvePlanningRootName('nonexistent-brand'), '.planning');
  });

});

// ─── CLI vs SDK consistency ────────────────────────────────────────────────────

describe('CLI and SDK planning root consistency', () => {
  const sdkUtils = loadSdkUtils();

  test('CLI and SDK BRAND_ROOT_MAP have the same keys and values', () => {
    if (!sdkUtils) return;
    delete require.cache[require.resolve(CORE_PATH)];
    const core = require(CORE_PATH);
    const cliMap = core.BRAND_ROOT_MAP;
    const sdkMap = sdkUtils.BRAND_ROOT_MAP;
    assert.deepStrictEqual(cliMap, sdkMap, 'CLI and SDK BRAND_ROOT_MAP must be identical');
  });

  test('CLI and SDK return the same root for official brand', () => {
    if (!sdkUtils) return;
    delete require.cache[require.resolve(CORE_PATH)];
    const core = require(CORE_PATH);
    assert.strictEqual(
      core.resolvePlanningRootName('official'),
      sdkUtils.resolvePlanningRootName('official'),
      'CLI and SDK official brand must resolve to the same directory name'
    );
  });

  test('CLI and SDK return the same root for gsdcn brand', () => {
    if (!sdkUtils) return;
    delete require.cache[require.resolve(CORE_PATH)];
    const core = require(CORE_PATH);
    assert.strictEqual(
      core.resolvePlanningRootName('gsdcn'),
      sdkUtils.resolvePlanningRootName('gsdcn'),
      'CLI and SDK gsdcn brand must resolve to the same directory name'
    );
  });

  test('CLI planningDir and SDK relPlanningPath agree on official root + workstream', () => {
    if (!sdkUtils) return;
    delete require.cache[require.resolve(CORE_PATH)];
    const core = require(CORE_PATH);
    // SDK uses POSIX paths; normalize CLI result to POSIX for comparison
    const cliResult = core.planningDir('/project', 'my-ws').replace(/\\/g, '/').replace(/^.*?\.planning/, '.planning');
    const sdkResult = sdkUtils.relPlanningPath('my-ws', 'official');
    assert.strictEqual(sdkResult, '.planning/workstreams/my-ws');
    assert.ok(
      cliResult.endsWith('.planning/workstreams/my-ws'),
      `CLI result "${cliResult}" must end with .planning/workstreams/my-ws`
    );
  });

  test('CLI planningDir and SDK relPlanningPath agree on gsdcn root + workstream', () => {
    if (!sdkUtils) return;
    delete require.cache[require.resolve(CORE_PATH)];
    const core = require(CORE_PATH);
    // SDK uses POSIX paths; normalize CLI result to POSIX for comparison
    const cliResult = core.planningDir('/project', 'my-ws', null, 'gsdcn').replace(/\\/g, '/').replace(/^.*?\.planning/, '.planning');
    const sdkResult = sdkUtils.relPlanningPath('my-ws', 'gsdcn');
    assert.strictEqual(sdkResult, '.planning-gsdcn/workstreams/my-ws');
    assert.ok(
      cliResult.endsWith('.planning-gsdcn/workstreams/my-ws'),
      `CLI result "${cliResult}" must end with .planning-gsdcn/workstreams/my-ws`
    );
  });

  // ── Cross-brand non-overlap ────────────────────────────────────────────────

  test('official and gsdcn paths never overlap (CLI)', () => {
    delete require.cache[require.resolve(CORE_PATH)];
    const core = require(CORE_PATH);
    const officialPath = core.planningDir('/project', 'ws').replace(/\\/g, '/');
    const gsdcnPath = core.planningDir('/project', 'ws', null, 'gsdcn').replace(/\\/g, '/');
    assert.notStrictEqual(officialPath, gsdcnPath, 'Official and GSD-CN paths must be different');
    assert.ok(!officialPath.includes('.planning-gsdcn'), `Official path must not include .planning-gsdcn: ${officialPath}`);
    assert.ok(gsdcnPath.includes('.planning-gsdcn'), `GSD-CN path must include .planning-gsdcn: ${gsdcnPath}`);
  });

  test('official and gsdcn paths never overlap (SDK)', () => {
    if (!sdkUtils) return;
    const officialPath = sdkUtils.relPlanningPath('ws');
    const gsdcnPath = sdkUtils.relPlanningPath('ws', 'gsdcn');
    assert.notStrictEqual(officialPath, gsdcnPath);
    assert.ok(!officialPath.includes('.planning-gsdcn'));
    assert.ok(gsdcnPath.includes('.planning-gsdcn'));
  });

});
