const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('check command', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsync-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should detect missing variables', () => {
    fs.writeFileSync(path.join(tmpDir, '.env'), 'FOO=bar\n');
    fs.writeFileSync(path.join(tmpDir, '.env.example'), 'FOO=\nBAR=\nBAZ=\n');

    // We test the parser logic directly since check() calls process.exit
    const { parseEnvFile } = require('../src/parser');
    const env = parseEnvFile(path.join(tmpDir, '.env'));
    const example = parseEnvFile(path.join(tmpDir, '.env.example'));

    const missing = [];
    for (const [key] of example) {
      if (!env.has(key)) missing.push(key);
    }

    assert.deepStrictEqual(missing, ['BAR', 'BAZ']);
  });

  it('should detect empty variables', () => {
    fs.writeFileSync(path.join(tmpDir, '.env'), 'FOO=bar\nBAR=\n');
    fs.writeFileSync(path.join(tmpDir, '.env.example'), 'FOO=\nBAR=\n');

    const { parseEnvFile } = require('../src/parser');
    const env = parseEnvFile(path.join(tmpDir, '.env'));
    const example = parseEnvFile(path.join(tmpDir, '.env.example'));

    const empty = [];
    for (const [key] of example) {
      if (env.has(key) && env.get(key).value === '') empty.push(key);
    }

    assert.deepStrictEqual(empty, ['BAR']);
  });

  it('should detect extra variables', () => {
    fs.writeFileSync(path.join(tmpDir, '.env'), 'FOO=bar\nEXTRA=val\n');
    fs.writeFileSync(path.join(tmpDir, '.env.example'), 'FOO=\n');

    const { parseEnvFile } = require('../src/parser');
    const env = parseEnvFile(path.join(tmpDir, '.env'));
    const example = parseEnvFile(path.join(tmpDir, '.env.example'));

    const extra = [];
    for (const [key] of env) {
      if (!example.has(key)) extra.push(key);
    }

    assert.deepStrictEqual(extra, ['EXTRA']);
  });
});
