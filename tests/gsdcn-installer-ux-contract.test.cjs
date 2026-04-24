'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const INSTALL_PATH = path.join(ROOT, 'bin', 'install.js');
const GSDCN_BIN_PATH = path.join(ROOT, 'bin', 'gsdcn.js');
const README_PATH = path.join(ROOT, 'README.md');
const ZH_INSTALLER_PATH = path.join(ROOT, 'get-shit-done', 'locales', 'zh-CN', 'installer.json');
const EN_INSTALLER_PATH = path.join(ROOT, 'get-shit-done', 'locales', 'en', 'installer.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

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

describe('GSD-CN installer UX contract', () => {
  const zh = readJson(ZH_INSTALLER_PATH);
  const en = readJson(EN_INSTALLER_PATH);
  const installSource = fs.readFileSync(INSTALL_PATH, 'utf8');
  const gsdcnBin = fs.readFileSync(GSDCN_BIN_PATH, 'utf8');
  const readme = fs.readFileSync(README_PATH, 'utf8');

  test('zh-CN installer catalog contains natural GSD-CN precondition and failure text', () => {
    assert.match(zh['installer.wsl_windows_node_title'], /WSL/);
    assert.match(zh['installer.wsl_windows_node_title'], /Node\.js/);
    assert.match(zh['installer.wsl_windows_node_body'], /路径|安装/);
    assert.match(zh['installer.wsl_windows_node_rerun'], /重新运行/);
    assert.match(zh['installer.config_dir_requires_path'], /--config-dir/);
    assert.match(zh['installer.config_dir_requires_non_empty_path'], /--config-dir/);
    assert.match(zh['installer.installation_incomplete'], /安装/);
    assert.match(zh['installer.finish_open_blank_directory'], /运行/);
    assert.match(zh['installer.cannot_specify_both_sdk_no_sdk'], /--sdk/);
    assert.match(zh['installer.cannot_specify_both_sdk_no_sdk'], /--no-sdk/);
  });

  test('new installer locale keys remain present in English fallback catalog', () => {
    for (const key of [
      'installer.cannot_specify_both_sdk_no_sdk',
      'installer.finish_open_blank_directory',
      'installer.join_community',
    ]) {
      assert.equal(typeof en[key], 'string', `${key} must exist in en catalog`);
      assert.notEqual(en[key].trim(), '');
    }
  });

  test('GSD-CN wrapper activates gsdcn brand and default zh-CN installer locale', () => {
    assert.match(gsdcnBin, /GSD_BRAND\s*=\s*'gsdcn'/);
    const mod = loadInstallerWithEnv({ GSD_BRAND: 'gsdcn' });
    assert.strictEqual(mod.INSTALLER_BRAND.brandId, 'gsdcn');
    assert.strictEqual(mod.resolveInstallerLocale(path.join(ROOT, '__missing__')), 'zh-CN');
  });

  test('installer UX source uses localized text and brand-aware commands', () => {
    assert.match(installSource, /installerText\('wsl_windows_node_title'\)/);
    assert.match(installSource, /installerText\('installation_incomplete'/);
    assert.match(installSource, /installerText\('finish_open_blank_directory'/);
    assert.match(installSource, /INSTALLER_BRAND\.cmdPrefix/);
    assert.match(installSource, /npx gsdcn@latest/);
    assert.match(installSource, /npx get-shit-done-cc@latest/);
  });

  test('README primary install command remains dedicated GSD-CN package path', () => {
    assert.match(readme, /npx gsdcn@latest/);
    assert.doesNotMatch(readme, /npx get-shit-done-cc@latest --gsdcn/);
  });
});
