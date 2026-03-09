const fs = require('fs');
const path = require('path');
const { parseEnvFile } = require('../parser');
const { colors, symbols, printHeader } = require('../utils');

/**
 * Generate .env.example from an existing .env file
 */
function template(options = {}) {
  const envPath = options.env || '.env';
  const outputPath = options.output || '.env.example';

  const entries = parseEnvFile(envPath);

  if (!entries) {
    console.error(`  ${symbols.cross} File not found: ${envPath}`);
    process.exit(1);
  }

  printHeader('template');

  // Read original file to preserve comments and structure
  const content = fs.readFileSync(path.resolve(envPath), 'utf-8');
  const lines = content.split('\n');
  const outputLines = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Preserve empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      outputLines.push(line);
      continue;
    }

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) {
      outputLines.push(line);
      continue;
    }

    const key = trimmed.substring(0, eqIndex).trim();
    const value = trimmed.substring(eqIndex + 1).trim();

    // Keep placeholder values, clear real values
    if (isPlaceholder(value)) {
      outputLines.push(line);
    } else {
      outputLines.push(`${key}=`);
    }
  }

  const output = outputLines.join('\n');

  if (options.dryRun) {
    console.log();
    console.log(output);
    console.log();
    return;
  }

  // Check if file exists
  if (fs.existsSync(path.resolve(outputPath)) && !options.force) {
    console.error(`  ${symbols.warn} ${outputPath} already exists`);
    console.error(colors.dim('    Use --force to overwrite'));
    process.exit(1);
  }

  fs.writeFileSync(path.resolve(outputPath), output, 'utf-8');
  console.log(`  ${symbols.check} Created ${outputPath} with ${entries.size} variables`);
  console.log();
}

/**
 * Check if a value looks like a placeholder (not a real secret)
 */
function isPlaceholder(value) {
  const lower = value.toLowerCase();
  const placeholders = [
    'your_', 'change_me', 'replace_', 'todo', 'xxx',
    'example', 'placeholder', '<', 'fill_in',
  ];
  return placeholders.some((p) => lower.includes(p));
}

module.exports = template;
