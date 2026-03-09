const { describe, it } = require('node:test');
const assert = require('node:assert');
const { parseEnvContent } = require('../src/parser');

describe('lint logic', () => {
  it('should detect invalid key names', () => {
    const keys = ['VALID_KEY', '123INVALID', 'has-dash', 'has space', '_OK'];
    const validPattern = /^[A-Za-z_][A-Za-z0-9_]*$/;

    const invalid = keys.filter((k) => !validPattern.test(k));
    assert.deepStrictEqual(invalid, ['123INVALID', 'has-dash', 'has space']);
  });

  it('should detect duplicate keys', () => {
    const content = 'FOO=bar\nBAZ=qux\nFOO=override';
    const lines = content.split('\n');
    const seen = new Map();
    const duplicates = [];

    for (let i = 0; i < lines.length; i++) {
      const eq = lines[i].indexOf('=');
      if (eq === -1) continue;
      const key = lines[i].substring(0, eq).trim();
      if (seen.has(key)) duplicates.push(key);
      seen.set(key, i + 1);
    }

    assert.deepStrictEqual(duplicates, ['FOO']);
  });

  it('should detect empty values', () => {
    const entries = parseEnvContent('FOO=bar\nEMPTY=\nALSO_EMPTY=');
    const empty = [];
    for (const [key, entry] of entries) {
      if (entry.value === '') empty.push(key);
    }
    assert.deepStrictEqual(empty, ['EMPTY', 'ALSO_EMPTY']);
  });

  it('should validate URL format', () => {
    const urls = [
      'https://example.com',
      'not-a-url',
      'postgres://localhost:5432/db',
    ];

    const valid = urls.filter((u) => {
      try { new URL(u); return true; } catch { return false; }
    });

    assert.deepStrictEqual(valid, ['https://example.com', 'postgres://localhost:5432/db']);
  });
});
