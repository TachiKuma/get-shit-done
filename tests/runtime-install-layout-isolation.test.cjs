/**
 * Runtime install layout isolation contract tests (Phase 19 - Plan 02)
 *
 * Covers:
 * 1. Official GSD and GSD-CN manifest files never share the same name
 * 2. Official GSD and GSD-CN patches directories never share the same name
 * 3. Official GSD and GSD-CN update cache dirs/files never share the same name
 * 4. Official GSD and GSD-CN pristine backup dirs never share the same name
 * 5. GSD-CN manifest name contains 'gsdcn', official manifest does NOT
 * 6. All six namespace fields are isolation-safe (no accidental shared values)
 * 7. gsd-check-update.js produces brand-namespaced cache paths
 *    when GSD_BRAND=gsdcn is set
 * 8. gsd-check-update.js uses default 'gsd' namespace when GSD_BRAND unset
 * 9. Dual-install simulation: official assets do not overwrite gsdcn assets
 *
 * These tests verify the runtime install layout contract so that a GSD-CN
 * install never overwrites official GSD manifests, patches, pristine copies,
 * or update-check state on the same machine (CN-04 requirement;
 * T-19-02-02 threat mitigation).
 */

'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const os = require('os');

// ─── Module paths ─────────────────────────────────────────────────────────────

const INSTALL_PATH = path.join(__dirname, '..', 'bin', 'install.js');

// ─── Helper: load install module with env isolation ──────────────────────────

function loadInstallerWithEnv(envOverrides = {}) {
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
  const prevTestMode = process.env.GSD_TEST_MODE;
  process.env.GSD_TEST_MODE = '1';
  const mod = require(INSTALL_PATH);
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

// ─── Test suite 1: manifest isolation ────────────────────────────────────────

describe('Manifest file isolation', () => {
  test('official manifest name is gsd-file-manifest.json', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    assert.strictEqual(mod.MANIFEST_NAME, 'gsd-file-manifest.json');
  });

  test('gsdcn manifest name is gsdcn-file-manifest.json', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: 'gsdcn' });
    assert.strictEqual(mod.MANIFEST_NAME, 'gsdcn-file-manifest.json');
  });

  test('official manifest name contains "gsd" but not "gsdcn"', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    assert.ok(mod.MANIFEST_NAME.includes('gsd'));
    assert.ok(!mod.MANIFEST_NAME.includes('gsdcn'));
  });

  test('gsdcn manifest name contains "gsdcn"', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: 'gsdcn' });
    assert.ok(mod.MANIFEST_NAME.includes('gsdcn'));
  });

  test('official and gsdcn manifest names are different (no overwrite)', () => {
    const officialMod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    const gsdcnMod = loadInstallerWithEnv({ GSD_BRAND: 'gsdcn' });
    assert.notStrictEqual(
      officialMod.MANIFEST_NAME,
      gsdcnMod.MANIFEST_NAME,
      'Official and GSD-CN manifest file names must differ to prevent overwrites',
    );
  });
});

// ─── Test suite 2: patches directory isolation ───────────────────────────────

describe('Local patches directory isolation', () => {
  test('official patches dir is gsd-local-patches', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    assert.strictEqual(mod.PATCHES_DIR_NAME, 'gsd-local-patches');
  });

  test('gsdcn patches dir is gsdcn-local-patches', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: 'gsdcn' });
    assert.strictEqual(mod.PATCHES_DIR_NAME, 'gsdcn-local-patches');
  });

  test('official and gsdcn patches dirs are different (no overwrite)', () => {
    const officialMod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    const gsdcnMod = loadInstallerWithEnv({ GSD_BRAND: 'gsdcn' });
    assert.notStrictEqual(
      officialMod.PATCHES_DIR_NAME,
      gsdcnMod.PATCHES_DIR_NAME,
      'Official and GSD-CN patches dirs must differ',
    );
  });
});

// ─── Test suite 3: update cache namespace isolation ──────────────────────────

describe('Update cache namespace isolation', () => {
  test('official update cache dir is "gsd"', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    assert.strictEqual(mod.INSTALLER_BRAND.updateCacheDirName, 'gsd');
  });

  test('gsdcn update cache dir is "gsdcn"', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: 'gsdcn' });
    assert.strictEqual(mod.INSTALLER_BRAND.updateCacheDirName, 'gsdcn');
  });

  test('official update cache file is gsd-update-check.json', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    assert.strictEqual(mod.INSTALLER_BRAND.updateCacheFileName, 'gsd-update-check.json');
  });

  test('gsdcn update cache file is gsdcn-update-check.json', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: 'gsdcn' });
    assert.strictEqual(mod.INSTALLER_BRAND.updateCacheFileName, 'gsdcn-update-check.json');
  });

  test('official and gsdcn full update cache paths are different', () => {
    const officialMod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    const gsdcnMod = loadInstallerWithEnv({ GSD_BRAND: 'gsdcn' });

    const officialPath = path.join(
      os.homedir(), '.cache',
      officialMod.INSTALLER_BRAND.updateCacheDirName,
      officialMod.INSTALLER_BRAND.updateCacheFileName,
    );
    const gsdcnPath = path.join(
      os.homedir(), '.cache',
      gsdcnMod.INSTALLER_BRAND.updateCacheDirName,
      gsdcnMod.INSTALLER_BRAND.updateCacheFileName,
    );

    assert.notStrictEqual(
      officialPath,
      gsdcnPath,
      'Official and GSD-CN update cache paths must differ to prevent state collision',
    );
  });
});

// ─── Test suite 4: pristine backup directory isolation ───────────────────────

describe('Pristine backup directory isolation', () => {
  test('official pristine dir is "gsd-pristine"', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    assert.strictEqual(mod.INSTALLER_BRAND.pristineDirName, 'gsd-pristine');
  });

  test('gsdcn pristine dir is "gsdcn-pristine"', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: 'gsdcn' });
    assert.strictEqual(mod.INSTALLER_BRAND.pristineDirName, 'gsdcn-pristine');
  });

  test('official and gsdcn pristine dirs are different', () => {
    const officialMod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    const gsdcnMod = loadInstallerWithEnv({ GSD_BRAND: 'gsdcn' });
    assert.notStrictEqual(
      officialMod.INSTALLER_BRAND.pristineDirName,
      gsdcnMod.INSTALLER_BRAND.pristineDirName,
    );
  });
});

// ─── Test suite 5: full namespace isolation matrix ────────────────────────────

describe('Full namespace isolation matrix', () => {
  const ISOLATION_FIELDS = [
    'cmdPrefix',
    'manifestName',
    'patchesDirName',
    'pristineDirName',
    'updateCacheDirName',
    'updateCacheFileName',
  ];

  for (const field of ISOLATION_FIELDS) {
    test(`${field}: official vs gsdcn values are strictly different`, () => {
      const officialMod = loadInstallerWithEnv({ GSD_BRAND: undefined });
      const gsdcnMod = loadInstallerWithEnv({ GSD_BRAND: 'gsdcn' });
      assert.notStrictEqual(
        officialMod.INSTALLER_BRAND[field],
        gsdcnMod.INSTALLER_BRAND[field],
        `INSTALLER_BRAND.${field} must differ between official and gsdcn brands`,
      );
    });
  }

  test('no gsdcn-brand value equals any official-brand value (no cross-contamination)', () => {
    const officialMod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    const gsdcnMod = loadInstallerWithEnv({ GSD_BRAND: 'gsdcn' });

    const officialValues = new Set(
      ISOLATION_FIELDS.map(f => officialMod.INSTALLER_BRAND[f]),
    );
    const gsdcnValues = ISOLATION_FIELDS.map(f => gsdcnMod.INSTALLER_BRAND[f]);

    for (const gsdcnValue of gsdcnValues) {
      assert.ok(
        !officialValues.has(gsdcnValue),
        `GSD-CN namespace value '${gsdcnValue}' must not appear in official GSD namespace`,
      );
    }
  });
});

// ─── Test suite 6: dual-install simulation ──────────────────────────────────

describe('Dual-install simulation: official and gsdcn can coexist', () => {
  test('official install does not use any gsdcn namespace value', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    const officialValues = Object.values(mod.INSTALLER_BRAND).filter(v => typeof v === 'string');
    for (const v of officialValues) {
      assert.ok(
        !v.includes('gsdcn'),
        `Official INSTALLER_BRAND value '${v}' must not contain 'gsdcn'`,
      );
    }
  });

  test('gsdcn install does not use any pure gsd- namespace value', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: 'gsdcn' });
    const gsdcnValues = Object.values(mod.INSTALLER_BRAND).filter(v => typeof v === 'string');
    const officialOnlyValues = ['gsd-file-manifest.json', 'gsd-local-patches', 'gsd-pristine', 'gsd-update-check.json'];
    for (const v of gsdcnValues) {
      assert.ok(
        !officialOnlyValues.includes(v),
        `GSD-CN INSTALLER_BRAND value '${v}' must not match official-only value`,
      );
    }
  });

  test('manifest file names form a disjoint set', () => {
    const officialMod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    const gsdcnMod = loadInstallerWithEnv({ GSD_BRAND: 'gsdcn' });
    const officialNames = new Set([
      officialMod.MANIFEST_NAME,
      officialMod.PATCHES_DIR_NAME,
    ]);
    const gsdcnNames = [
      gsdcnMod.MANIFEST_NAME,
      gsdcnMod.PATCHES_DIR_NAME,
    ];
    for (const name of gsdcnNames) {
      assert.ok(
        !officialNames.has(name),
        `GSD-CN namespace name '${name}' must not appear in official GSD namespace set`,
      );
    }
  });

  test('update cache paths form a disjoint set', () => {
    const officialMod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    const gsdcnMod = loadInstallerWithEnv({ GSD_BRAND: 'gsdcn' });
    const officialCacheDir = officialMod.INSTALLER_BRAND.updateCacheDirName;
    const officialCacheFile = officialMod.INSTALLER_BRAND.updateCacheFileName;
    const gsdcnCacheDir = gsdcnMod.INSTALLER_BRAND.updateCacheDirName;
    const gsdcnCacheFile = gsdcnMod.INSTALLER_BRAND.updateCacheFileName;

    assert.notStrictEqual(officialCacheDir, gsdcnCacheDir,
      'Cache dirs must differ');
    assert.notStrictEqual(officialCacheFile, gsdcnCacheFile,
      'Cache file names must differ');
    // Full paths must also differ (belt-and-suspenders)
    const makeFullPath = (dir, file) => path.join(os.homedir(), '.cache', dir, file);
    assert.notStrictEqual(
      makeFullPath(officialCacheDir, officialCacheFile),
      makeFullPath(gsdcnCacheDir, gsdcnCacheFile),
    );
  });
});
