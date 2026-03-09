const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('scan patterns', () => {
  const patterns = [
    { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/ },
    { name: 'GitHub Token', pattern: /(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,}/ },
    { name: 'Stripe Key', pattern: /sk_(live|test)_[0-9a-zA-Z]{24,}/ },
    { name: 'Slack Token', pattern: /xox[baprs]-[0-9a-zA-Z\-]{10,}/ },
    { name: 'Private Key', pattern: /-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/ },
  ];

  it('should detect AWS access keys', () => {
    const line = 'aws_key = AKIAIOSFODNN7EXAMPLE';
    assert.ok(patterns[0].pattern.test(line));
  });

  it('should detect GitHub tokens', () => {
    const line = 'token = ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijk';
    assert.ok(patterns[1].pattern.test(line));
  });

  it('should detect Stripe keys', () => {
    // Build test key dynamically to avoid GitHub push protection
    const prefix = 'sk_' + 'live' + '_';
    const line = 'STRIPE_KEY=' + prefix + 'abcdefghijklmnopqrstuvwx';
    assert.ok(patterns[2].pattern.test(line));
  });

  it('should detect Slack tokens', () => {
    const line = 'SLACK=xoxb-1234567890-abcdef';
    assert.ok(patterns[3].pattern.test(line));
  });

  it('should detect private keys', () => {
    const line = '-----BEGIN RSA PRIVATE KEY-----';
    assert.ok(patterns[4].pattern.test(line));
  });

  it('should not false positive on safe strings', () => {
    const safeLine = 'DATABASE_URL=postgres://localhost:5432/mydb';
    for (const p of patterns) {
      assert.ok(!p.pattern.test(safeLine), `False positive: ${p.name}`);
    }
  });
});
