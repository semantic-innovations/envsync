const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('template logic', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsync-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should strip real values but keep structure', () => {
    const envContent = '# Database\nDB_HOST=localhost\nDB_PORT=5432\n\n# API\nAPI_KEY=sk_live_abc123';
    fs.writeFileSync(path.join(tmpDir, '.env'), envContent);

    const content = fs.readFileSync(path.join(tmpDir, '.env'), 'utf-8');
    const lines = content.split('\n');
    const output = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        output.push(line);
        continue;
      }
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) {
        output.push(line);
        continue;
      }
      const key = trimmed.substring(0, eqIndex).trim();
      output.push(`${key}=`);
    }

    assert.ok(output.includes('# Database'));
    assert.ok(output.includes('# API'));
    assert.ok(output.includes('DB_HOST='));
    assert.ok(output.includes('API_KEY='));
    assert.ok(!output.some((l) => l.includes('localhost')));
    assert.ok(!output.some((l) => l.includes('sk_live')));
  });
});
