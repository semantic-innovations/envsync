const { parseEnvFile, findExampleFile } = require('../parser');
const { colors, symbols, printHeader, printSummary } = require('../utils');

/**
 * Check if .env has all variables defined in .env.example
 */
function check(options = {}) {
  const envPath = options.env || '.env';
  const examplePath = options.example || findExampleFile();

  if (!examplePath) {
    console.error(`  ${symbols.cross} No .env.example file found`);
    console.error(colors.dim('    Create one or specify with --example <path>'));
    process.exit(1);
  }

  const envEntries = parseEnvFile(envPath);
  const exampleEntries = parseEnvFile(examplePath);

  if (!envEntries) {
    console.error(`  ${symbols.cross} File not found: ${envPath}`);
    console.error(colors.dim(`    Copy ${examplePath} to ${envPath} and fill in values`));
    process.exit(1);
  }

  if (!exampleEntries) {
    console.error(`  ${symbols.cross} File not found: ${examplePath}`);
    process.exit(1);
  }

  printHeader('check');

  const missing = [];
  const empty = [];
  const present = [];
  const extra = [];

  // Check for missing and empty vars
  for (const [key, entry] of exampleEntries) {
    if (!envEntries.has(key)) {
      missing.push(key);
    } else if (envEntries.get(key).value === '') {
      empty.push(key);
    } else {
      present.push(key);
    }
  }

  // Check for extra vars not in example
  for (const [key] of envEntries) {
    if (!exampleEntries.has(key)) {
      extra.push(key);
    }
  }

  // Print results
  for (const key of present) {
    console.log(`  ${symbols.check} ${key}`);
  }

  for (const key of empty) {
    console.log(`  ${symbols.warn} ${key} ${colors.yellow('(empty)')}`);
  }

  for (const key of missing) {
    console.log(`  ${symbols.cross} ${key} ${colors.red('(missing)')}`);
  }

  if (extra.length > 0 && !options.ci) {
    console.log();
    console.log(colors.dim('  Extra variables not in example:'));
    for (const key of extra) {
      console.log(`  ${colors.dim('?')} ${colors.dim(key)}`);
    }
  }

  const total = exampleEntries.size;
  const passed = present.length;
  const failed = missing.length;
  const warnings = empty.length;

  printSummary(passed, failed, warnings);

  if (options.ci && (failed > 0 || warnings > 0)) {
    process.exit(1);
  }

  return { passed, failed, warnings, extra: extra.length };
}

module.exports = check;
