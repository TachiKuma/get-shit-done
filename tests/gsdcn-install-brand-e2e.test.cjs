'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const INSTALL_PATH = path.join(ROOT, 'bin', 'install.js');
const README_PATH = path.join(ROOT, 'README.md');

function loadInstallerWithArgs(args = [], env = {}) {
  delete require.cache[require.resolve(INSTALL_PATH)];
  const savedArgv = process.argv;
  const savedEnv = { ...process.env };
  process.argv = ['node', INSTALL_PATH, ...args];
  process.env = { ...savedEnv, ...env, GSD_TEST_MODE: '1' };
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) delete process.env[key];
  }
  const mod = require(INSTALL_PATH);
  process.argv = savedArgv;
  process.env = savedEnv;
  return mod;
}

describe('GSD-CN install brand activation E2E contract', () => {
  test('--gsdcn activates gsdcn installer brand', () => {
    const mod = loadInstallerWithArgs(['--gsdcn']);
    assert.strictEqual(mod.INSTALLER_BRAND.brandId, 'gsdcn');
    assert.strictEqual(mod.INSTALLER_BRAND.cmdPrefix, 'gsdcn');
    assert.strictEqual(mod.MANIFEST_NAME, 'gsdcn-file-manifest.json');
  });

  test('--brand gsdcn activates gsdcn installer brand', () => {
    const mod = loadInstallerWithArgs(['--brand', 'gsdcn']);
    assert.strictEqual(mod.INSTALLER_BRAND.brandId, 'gsdcn');
    assert.strictEqual(mod.INSTALLER_BRAND.updateCacheDirName, 'gsdcn');
  });

  test('default install path remains official brand', () => {
    const mod = loadInstallerWithArgs([], { GSD_BRAND: undefined });
    assert.strictEqual(mod.INSTALLER_BRAND.brandId, 'official');
    assert.strictEqual(mod.INSTALLER_BRAND.cmdPrefix, 'gsd');
    assert.strictEqual(mod.MANIFEST_NAME, 'gsd-file-manifest.json');
  });

  test('README quick start documents explicit --gsdcn activation', () => {
    const readme = fs.readFileSync(README_PATH, 'utf8');
    assert.match(readme, /npx get-shit-done-cc@latest --gsdcn/);
    assert.match(readme, /gsdcn-file-manifest\.json/);
    assert.match(readme, /\.planning-gsdcn\//);
  });
});
