const { describe, it } = require('node:test');
const assert = require('node:assert');
const { parseEnvContent } = require('../src/parser');

describe('diff logic', () => {
  it('should find keys only in first file', () => {
    const entries1 = parseEnvContent('FOO=bar\nUNIQUE=val');
    const entries2 = parseEnvContent('FOO=bar');

    const onlyIn1 = [];
    for (const [key] of entries1) {
      if (!entries2.has(key)) onlyIn1.push(key);
    }

    assert.deepStrictEqual(onlyIn1, ['UNIQUE']);
  });

  it('should find keys only in second file', () => {
    const entries1 = parseEnvContent('FOO=bar');
    const entries2 = parseEnvContent('FOO=bar\nNEW=val');

    const onlyIn2 = [];
    for (const [key] of entries2) {
      if (!entries1.has(key)) onlyIn2.push(key);
    }

    assert.deepStrictEqual(onlyIn2, ['NEW']);
  });

  it('should find different values', () => {
    const entries1 = parseEnvContent('FOO=local\nBAR=same');
    const entries2 = parseEnvContent('FOO=staging\nBAR=same');

    const different = [];
    for (const [key, entry] of entries1) {
      if (entries2.has(key) && entries2.get(key).value !== entry.value) {
        different.push(key);
      }
    }

    assert.deepStrictEqual(different, ['FOO']);
  });

  it('should find matching values', () => {
    const entries1 = parseEnvContent('FOO=same\nBAR=same');
    const entries2 = parseEnvContent('FOO=same\nBAR=same');

    const same = [];
    for (const [key, entry] of entries1) {
      if (entries2.has(key) && entries2.get(key).value === entry.value) {
        same.push(key);
      }
    }

    assert.deepStrictEqual(same, ['FOO', 'BAR']);
  });
});
