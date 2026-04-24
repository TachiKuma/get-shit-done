'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const INSTALL_PATH = path.join(ROOT, 'bin', 'install.js');

function loadInstallerWithEnv(env = {}) {
  delete require.cache[require.resolve(INSTALL_PATH)];
  const savedArgv = process.argv;
  const savedEnv = { ...process.env };
  process.argv = ['node', INSTALL_PATH];
  process.env = { ...savedEnv, ...env, GSD_TEST_MODE: '1' };
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) delete process.env[key];
  }
  const mod = require(INSTALL_PATH);
  process.argv = savedArgv;
  process.env = savedEnv;
  return mod;
}

describe('GSD-CN official fallback boundary', () => {
  const installSource = fs.readFileSync(INSTALL_PATH, 'utf8');

  test('no-brand installer load remains official', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    assert.strictEqual(mod.INSTALLER_BRAND.brandId, 'official');
    assert.strictEqual(mod.INSTALLER_BRAND.cmdPrefix, 'gsd');
    assert.strictEqual(mod.MANIFEST_NAME, 'gsd-file-manifest.json');
  });

  test('official namespace values do not contain gsdcn', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    const official = mod.INSTALLER_BRAND_CONFIGS.official;
    assert.deepStrictEqual(official, {
      brandId: 'official',
      cmdPrefix: 'gsd',
      manifestName: 'gsd-file-manifest.json',
      patchesDirName: 'gsd-local-patches',
      pristineDirName: 'gsd-pristine',
      updateCacheDirName: 'gsd',
      updateCacheFileName: 'gsd-update-check.json',
    });
    assert.ok(Object.values(official).every(value => !String(value).includes('gsdcn')));
  });

  test('official missing-config locale fallback remains default English', () => {
    const mod = loadInstallerWithEnv({ GSD_BRAND: undefined });
    assert.strictEqual(mod.resolveInstallerLocale(path.join(ROOT, '__missing__')), 'en');
  });

  test('help command branch keeps separate official and GSD-CN package commands', () => {
    assert.match(installSource, /brandId === 'gsdcn' \? 'gsdcn' : 'get-shit-done-cc'/);
    assert.match(installSource, /npx \$\{packageCommand\}/);
  });
});
