const { describe, it } = require('node:test');
const assert = require('node:assert');
const { parseEnvContent } = require('../src/parser');

describe('parseEnvContent', () => {
  it('should parse simple key=value pairs', () => {
    const result = parseEnvContent('FOO=bar\nBAZ=qux');
    assert.strictEqual(result.get('FOO').value, 'bar');
    assert.strictEqual(result.get('BAZ').value, 'qux');
  });

  it('should skip comments and empty lines', () => {
    const result = parseEnvContent('# comment\n\nFOO=bar\n# another');
    assert.strictEqual(result.size, 1);
    assert.strictEqual(result.get('FOO').value, 'bar');
  });

  it('should handle quoted values', () => {
    const result = parseEnvContent('FOO="hello world"\nBAR=\'single quotes\'');
    assert.strictEqual(result.get('FOO').value, 'hello world');
    assert.strictEqual(result.get('BAR').value, 'single quotes');
  });

  it('should handle empty values', () => {
    const result = parseEnvContent('FOO=\nBAR=');
    assert.strictEqual(result.get('FOO').value, '');
    assert.strictEqual(result.get('BAR').value, '');
  });

  it('should handle values with = signs', () => {
    const result = parseEnvContent('URL=postgres://host:5432/db?opt=val');
    assert.strictEqual(result.get('URL').value, 'postgres://host:5432/db?opt=val');
  });

  it('should track line numbers', () => {
    const result = parseEnvContent('# header\nFOO=bar\n\nBAZ=qux');
    assert.strictEqual(result.get('FOO').line, 2);
    assert.strictEqual(result.get('BAZ').line, 4);
  });

  it('should handle inline comments', () => {
    const result = parseEnvContent('FOO=bar # this is a comment');
    assert.strictEqual(result.get('FOO').value, 'bar');
  });
});
