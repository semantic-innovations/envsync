const fs = require('fs');
const path = require('path');
const { colors, symbols, printHeader, printSummary } = require('../utils');

/**
 * Lint a .env file for common issues
 */
function lint(options = {}) {
  const envPath = options.env || '.env';
  const absolutePath = path.resolve(envPath);

  if (!fs.existsSync(absolutePath)) {
    console.error(`  ${symbols.cross} File not found: ${envPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(absolutePath, 'utf-8');
  const lines = content.split('\n');

  printHeader('lint');

  const errors = [];
  const warnings = [];
  const passed = [];
  const seenKeys = new Map();

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const raw = lines[i];
    const trimmed = raw.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Check: line has no = sign
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) {
      errors.push({ line: lineNum, key: trimmed, msg: 'Invalid format (missing =)' });
      continue;
    }

    const key = trimmed.substring(0, eqIndex).trim();
    let value = trimmed.substring(eqIndex + 1).trim();

    // Remove quotes for value checks
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Check: invalid key format
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      errors.push({ line: lineNum, key, msg: 'Invalid key name (use A-Z, 0-9, _)' });
      continue;
    }

    // Check: duplicate keys
    if (seenKeys.has(key)) {
      warnings.push({
        line: lineNum,
        key,
        msg: `Duplicate key (first defined on line ${seenKeys.get(key)})`,
      });
    }
    seenKeys.set(key, lineNum);

    // Check: empty value
    if (value === '') {
      warnings.push({ line: lineNum, key, msg: 'Empty value' });
      continue;
    }

    // Check: value has trailing whitespace
    if (raw.substring(raw.indexOf('=') + 1) !== raw.substring(raw.indexOf('=') + 1).trimEnd()) {
      warnings.push({ line: lineNum, key, msg: 'Trailing whitespace in value' });
    }

    // Check: unmatched quotes
    const rawValue = trimmed.substring(eqIndex + 1).trim();
    if (
      (rawValue.startsWith('"') && !rawValue.endsWith('"')) ||
      (rawValue.startsWith("'") && !rawValue.endsWith("'"))
    ) {
      errors.push({ line: lineNum, key, msg: 'Unmatched quotes' });
      continue;
    }

    // Check: common port values
    if (key.toLowerCase().includes('port') && value && isNaN(Number(value))) {
      warnings.push({ line: lineNum, key, msg: `Value "${value}" doesn't look like a port number` });
    }

    // Check: URL format
    if (key.toLowerCase().includes('url') && value && !isValidUrl(value)) {
      warnings.push({ line: lineNum, key, msg: 'Value doesn\'t look like a valid URL' });
    }

    passed.push(key);
  }

  // Print errors
  for (const err of errors) {
    console.log(`  ${symbols.cross} Line ${err.line}: ${colors.bold(err.key)}`);
    console.log(`    ${colors.red(err.msg)}`);
  }

  // Print warnings
  for (const warn of warnings) {
    console.log(`  ${symbols.warn} Line ${warn.line}: ${colors.bold(warn.key)}`);
    console.log(`    ${colors.yellow(warn.msg)}`);
  }

  // Print passed
  if (errors.length === 0 && warnings.length === 0) {
    console.log(`  ${symbols.check} All ${passed.length} variables look good`);
  }

  printSummary(passed.length, errors.length, warnings.length);

  if (options.ci && errors.length > 0) {
    process.exit(1);
  }

  return { passed: passed.length, errors: errors.length, warnings: warnings.length };
}

function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

module.exports = lint;
