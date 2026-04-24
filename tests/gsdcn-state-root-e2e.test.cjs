'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const CORE_PATH = path.join(__dirname, '..', 'get-shit-done', 'bin', 'lib', 'core.cjs');

function withCoreBrand(brand, callback) {
  delete require.cache[require.resolve(CORE_PATH)];
  const previous = process.env.GSD_BRAND;
  if (brand === undefined) delete process.env.GSD_BRAND;
  else process.env.GSD_BRAND = brand;
  const core = require(CORE_PATH);
  try {
    return callback(core);
  } finally {
    if (previous === undefined) delete process.env.GSD_BRAND;
    else process.env.GSD_BRAND = previous;
  }
}

describe('GSD-CN state-root E2E contract', () => {
  test('GSD_BRAND=gsdcn command-facing paths write under .planning-gsdcn', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gsdcn-state-root-'));
    withCoreBrand('gsdcn', (core) => {
      const planningDir = core.planningDir(tmp);
      const statePath = path.join(planningDir, 'STATE.md');
      fs.mkdirSync(planningDir, { recursive: true });
      fs.writeFileSync(statePath, 'status: fixture\n');

      assert.ok(planningDir.endsWith('.planning-gsdcn'), planningDir);
      assert.ok(fs.existsSync(path.join(tmp, '.planning-gsdcn', 'STATE.md')));
      assert.ok(!fs.existsSync(path.join(tmp, '.planning', 'STATE.md')));
    });
  });

  test('official default command-facing paths remain under .planning', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gsd-state-root-'));
    withCoreBrand(undefined, (core) => {
      const planningDir = core.planningDir(tmp);

      assert.ok(planningDir.endsWith('.planning'), planningDir);
      assert.ok(!planningDir.includes('.planning-gsdcn'));
    });
  });
});
