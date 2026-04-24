'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PACKAGE_PATH = path.join(ROOT, 'package.json');
const README_PATH = path.join(ROOT, 'README.md');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

describe('GSD-CN package identity contract', () => {
  const pkg = readJson(PACKAGE_PATH);
  const readme = fs.readFileSync(README_PATH, 'utf8');

  test('package name and bin expose dedicated gsdcn identity', () => {
    assert.strictEqual(pkg.name, 'gsdcn');
    assert.deepStrictEqual(pkg.bin, { gsdcn: 'bin/gsdcn.js' });
  });

  test('package description identifies GSD-CN as unofficial Chinese distribution', () => {
    assert.match(pkg.description, /GSD-CN/);
    assert.match(pkg.description, /Simplified Chinese|Chinese/i);
    assert.match(pkg.description, /unofficial/i);
    assert.doesNotMatch(pkg.description, /\bofficial Simplified Chinese distribution/i);
  });

  test('README primary install command matches package identity', () => {
    assert.match(readme, /npx gsdcn@latest/);
    assert.doesNotMatch(readme, /npx get-shit-done-cc@latest --gsdcn/);
  });

  test('README preserves upstream and non-official attribution', () => {
    assert.match(readme, /get-shit-done/);
    assert.ok(
      readme.includes('非官方') || readme.includes('unofficial') || readme.includes('Unofficial'),
      'README must preserve a non-official notice'
    );
  });
});
