/**
 * Installer namespace coexistence contract tests (Phase 19 - Plan 02)
 *
 * Covers:
 * 1. Official GSD brand config: cmdPrefix='gsd', manifest='gsd-file-manifest.json',
 *    patches='gsd-local-patches', updateCacheDir='gsd'
 * 2. GSD-CN brand config: cmdPrefix='gsdcn', manifest='gsdcn-file-manifest.json',
 *    patches='gsdcn-local-patches', updateCacheDir='gsdcn'
 * 3. GSD_BRAND env var drives INSTALLER_BRAND at require time
 * 4. resolveInstallerBrand() falls back to 'official' for unknown values
 * 5. MANIFEST_NAME and PATCHES_DIR_NAME constants match active brand
 * 6. No mixed-prefix: gsdcn brand never uses 'gsd' namespace constants
 * 7. No mixed-prefix: official brand never uses 'gsdcn' namespace constants
 *
 * These tests lock the installer brand isolation contract so that
 * official GSD and GSD-CN can coexist on the same machine without
 * overwriting each other's manifests, patches, or update-cache state
 * (T-19-02-01, T-19-02-02 threat mitigations; CN-03, CN-04 requirements).
 */

'use strict';

const { describe, test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

// ─── Module path ──────────────────────────────────────────────────────────────

const INSTALL_PATH = path.join(__dirname, '..', 'bin', 'install.js');

// ─── Helper: load install module with env isolation ──────────────────────────

/**
 * Load bin/install.js in a fresh module context with the given env overrides.
 * Clears the module cache so GSD_BRAND env var changes take effect between tests.
 */
function loadInstallerWithEnv(envOverrides = {}) {
  // Clear cached module so re-require picks up new env vars
  delete require.cache[require.resolve(INSTALL_PATH)];
  const savedEnv = {};
  for (const [k, v] of Object.entries(envOverrides)) {
    savedEnv[k] = process.env[k];
    if (v === undefined) {
      delete process.env[k];
    } else {
      process.env[k] = String(v);
    }
  }
  // GSD_TEST_MODE prevents the installer from running main() on require
  const prevTestMode = process.env.GSD_TEST_MODE;
  process.env.GSD_TEST_MODE = '1';
  const mod = require(INSTALL_PATH);
  // Restore env
  if (prevTestMode === undefined) {
    delete process.env.GSD_TEST_MODE;
  } else {
    process.env.GSD_TEST_MODE = prevTestMode;
  }
  for (const [k, v] of Object.entries(savedEnv)) {
    if (v === undefined) {
      delete process.env[k];
    } else {
      process.env[k] = v;
    }
  }
  return mod;
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('Installer brand config — INSTALLER_BRAND_CONFIGS', () => {
  test('defines both official and gsdcn brand configs', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    const configs = mod.INSTALLER_BRAND_CONFIGS;
    assert.ok(configs, 'INSTALLER_BRAND_CONFIGS must be exported');
    assert.ok(configs.official, 'official brand config must exist');
    assert.ok(configs.gsdcn, 'gsdcn brand config must exist');
  });

  test('official brand has gsd cmdPrefix and gsd-* namespace', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    const cfg = mod.INSTALLER_BRAND_CONFIGS.official;
    assert.strictEqual(cfg.cmdPrefix, 'gsd', 'official cmdPrefix must be gsd');
    assert.strictEqual(cfg.manifestName, 'gsd-file-manifest.json');
    assert.strictEqual(cfg.patchesDirName, 'gsd-local-patches');
    assert.strictEqual(cfg.pristineDirName, 'gsd-pristine');
    assert.strictEqual(cfg.updateCacheDirName, 'gsd');
    assert.strictEqual(cfg.updateCacheFileName, 'gsd-update-check.json');
  });

  test('gsdcn brand has gsdcn cmdPrefix and gsdcn-* namespace', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    const cfg = mod.INSTALLER_BRAND_CONFIGS.gsdcn;
    assert.strictEqual(cfg.cmdPrefix, 'gsdcn', 'gsdcn cmdPrefix must be gsdcn');
    assert.strictEqual(cfg.manifestName, 'gsdcn-file-manifest.json');
    assert.strictEqual(cfg.patchesDirName, 'gsdcn-local-patches');
    assert.strictEqual(cfg.pristineDirName, 'gsdcn-pristine');
    assert.strictEqual(cfg.updateCacheDirName, 'gsdcn');
    assert.strictEqual(cfg.updateCacheFileName, 'gsdcn-update-check.json');
  });

  test('no official namespace value appears in gsdcn config', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    const cfg = mod.INSTALLER_BRAND_CONFIGS.gsdcn;
    const values = Object.values(cfg).filter(v => typeof v === 'string');
    for (const v of values) {
      assert.ok(
        !v.startsWith('gsd-') || v.startsWith('gsdcn-'),
        `gsdcn config value '${v}' must not use official gsd- namespace`,
      );
    }
  });

  test('no gsdcn namespace value appears in official config', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    const cfg = mod.INSTALLER_BRAND_CONFIGS.official;
    const values = Object.values(cfg).filter(v => typeof v === 'string');
    for (const v of values) {
      assert.ok(
        !v.includes('gsdcn'),
        `official config value '${v}' must not use gsdcn namespace`,
      );
    }
  });
});

describe('resolveInstallerBrand() — via INSTALLER_BRAND module constant', () => {
  // INSTALLER_BRAND is computed once at module load time from the env var.
  // We verify it by loading the module under different GSD_BRAND env values.
  // The resolveInstallerBrand() export is also tested as a pure-config lookup.

  test('returns official brand when GSD_BRAND is unset', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    // INSTALLER_BRAND is fixed at require time with the env var we set
    assert.strictEqual(mod.INSTALLER_BRAND.brandId, 'official');
    assert.strictEqual(mod.INSTALLER_BRAND.cmdPrefix, 'gsd');
  });

  test('returns official brand when GSD_BRAND is empty string', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: '' });
    assert.strictEqual(mod.INSTALLER_BRAND.brandId, 'official');
  });

  test('returns gsdcn brand when GSD_BRAND=gsdcn (checked via INSTALLER_BRAND)', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: 'gsdcn' });
    // INSTALLER_BRAND is resolved during require() while GSD_BRAND=gsdcn is in effect
    assert.strictEqual(mod.INSTALLER_BRAND.brandId, 'gsdcn');
    assert.strictEqual(mod.INSTALLER_BRAND.cmdPrefix, 'gsdcn');
  });

  test('GSD_BRAND matching is case-insensitive (checked via INSTALLER_BRAND)', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: 'GSDCN' });
    assert.strictEqual(mod.INSTALLER_BRAND.brandId, 'gsdcn');
  });

  test('falls back to official for unknown GSD_BRAND values', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: 'unknown-brand' });
    assert.strictEqual(mod.INSTALLER_BRAND.brandId, 'official',
      'Unknown brand should fall back to official to preserve backward compat');
  });

  test('falls back to official for GSD_BRAND=official', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: 'official' });
    assert.strictEqual(mod.INSTALLER_BRAND.brandId, 'official');
  });

  test('resolveInstallerBrand() function is a consistent lookup against BRAND_CONFIGS', () => {
    // resolveInstallerBrand() reads process.env.GSD_BRAND at call time.
    // When called with no env manipulation, it should return official.
    const mod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    // Call it from this process's env context (GSD_BRAND is unset in our test process)
    const result = mod.resolveInstallerBrand();
    assert.ok(result.brandId === 'official' || result.brandId === 'gsdcn',
      'resolveInstallerBrand() must return a valid brand config');
    assert.ok(result.cmdPrefix, 'brand config must have cmdPrefix');
  });
});

describe('INSTALLER_BRAND runtime constant (env-var driven)', () => {
  test('is official when GSD_BRAND unset', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    assert.strictEqual(mod.INSTALLER_BRAND.brandId, 'official');
    assert.strictEqual(mod.INSTALLER_BRAND.cmdPrefix, 'gsd');
  });

  test('is gsdcn when GSD_BRAND=gsdcn', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: 'gsdcn' });
    assert.strictEqual(mod.INSTALLER_BRAND.brandId, 'gsdcn');
    assert.strictEqual(mod.INSTALLER_BRAND.cmdPrefix, 'gsdcn');
  });
});

describe('MANIFEST_NAME constant (brand-derived)', () => {
  test('is gsd-file-manifest.json for official brand', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    assert.strictEqual(mod.MANIFEST_NAME, 'gsd-file-manifest.json');
  });

  test('is gsdcn-file-manifest.json for gsdcn brand', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: 'gsdcn' });
    assert.strictEqual(mod.MANIFEST_NAME, 'gsdcn-file-manifest.json');
  });

  test('gsdcn manifest name does not match official manifest name', () => {
    const officialMod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    const gsdcnMod = loadInstallerWithEnv({ GSD_BRAND: 'gsdcn' });
    assert.notStrictEqual(
      officialMod.MANIFEST_NAME,
      gsdcnMod.MANIFEST_NAME,
      'official and gsdcn manifest names must differ (coexistence)',
    );
  });
});

describe('PATCHES_DIR_NAME constant (brand-derived)', () => {
  test('is gsd-local-patches for official brand', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    assert.strictEqual(mod.PATCHES_DIR_NAME, 'gsd-local-patches');
  });

  test('is gsdcn-local-patches for gsdcn brand', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: 'gsdcn' });
    assert.strictEqual(mod.PATCHES_DIR_NAME, 'gsdcn-local-patches');
  });

  test('gsdcn patches dir name does not match official patches dir name', () => {
    const officialMod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    const gsdcnMod = loadInstallerWithEnv({ GSD_BRAND: 'gsdcn' });
    assert.notStrictEqual(
      officialMod.PATCHES_DIR_NAME,
      gsdcnMod.PATCHES_DIR_NAME,
      'official and gsdcn patches dir names must differ (coexistence)',
    );
  });
});

describe('Mixed-prefix detection: coexistence regression', () => {
  test('gsdcn cmdPrefix is not equal to official cmdPrefix', () => {
    const officialMod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    const gsdcnMod = loadInstallerWithEnv({ GSD_BRAND: 'gsdcn' });
    assert.notStrictEqual(
      officialMod.INSTALLER_BRAND.cmdPrefix,
      gsdcnMod.INSTALLER_BRAND.cmdPrefix,
      'official and gsdcn cmdPrefix must differ to prevent mixed-prefix installs',
    );
  });

  test('gsdcn updateCacheDirName differs from official', () => {
    const officialMod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    const gsdcnMod = loadInstallerWithEnv({ GSD_BRAND: 'gsdcn' });
    assert.notStrictEqual(
      officialMod.INSTALLER_BRAND.updateCacheDirName,
      gsdcnMod.INSTALLER_BRAND.updateCacheDirName,
      'update cache dirs must differ so caches do not overwrite each other',
    );
  });

  test('gsdcn updateCacheFileName differs from official', () => {
    const officialMod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    const gsdcnMod = loadInstallerWithEnv({ GSD_BRAND: 'gsdcn' });
    assert.notStrictEqual(
      officialMod.INSTALLER_BRAND.updateCacheFileName,
      gsdcnMod.INSTALLER_BRAND.updateCacheFileName,
      'update cache file names must differ so caches do not overwrite each other',
    );
  });

  test('all six namespace fields differ between official and gsdcn', () => {
    const officialMod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    const gsdcnMod = loadInstallerWithEnv({ GSD_BRAND: 'gsdcn' });
    const fields = [
      'cmdPrefix', 'manifestName', 'patchesDirName',
      'pristineDirName', 'updateCacheDirName', 'updateCacheFileName',
    ];
    for (const field of fields) {
      assert.notStrictEqual(
        officialMod.INSTALLER_BRAND[field],
        gsdcnMod.INSTALLER_BRAND[field],
        `INSTALLER_BRAND.${field} must differ between official and gsdcn brands`,
      );
    }
  });
});
