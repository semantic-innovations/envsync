const { parseEnvFile } = require('../parser');
const { colors, symbols, printHeader, printSummary } = require('../utils');

/**
 * Compare two env files side by side
 */
function diff(file1, file2, options = {}) {
  if (!file1 || !file2) {
    console.error(`  ${symbols.cross} Usage: envsync diff <file1> <file2>`);
    process.exit(1);
  }

  const entries1 = parseEnvFile(file1);
  const entries2 = parseEnvFile(file2);

  if (!entries1) {
    console.error(`  ${symbols.cross} File not found: ${file1}`);
    process.exit(1);
  }

  if (!entries2) {
    console.error(`  ${symbols.cross} File not found: ${file2}`);
    process.exit(1);
  }

  printHeader('diff');
  console.log(colors.dim(`  Comparing: ${file1} ↔ ${file2}`));
  console.log();

  const allKeys = new Set([...entries1.keys(), ...entries2.keys()]);
  const sorted = [...allKeys].sort();

  let same = 0;
  let different = 0;
  let onlyIn1 = 0;
  let onlyIn2 = 0;

  for (const key of sorted) {
    const in1 = entries1.has(key);
    const in2 = entries2.has(key);

    if (in1 && in2) {
      const val1 = entries1.get(key).value;
      const val2 = entries2.get(key).value;

      if (val1 === val2) {
        if (options.all) {
          console.log(`  ${colors.dim('=')} ${colors.dim(key)}`);
        }
        same++;
      } else {
        console.log(`  ${symbols.tilde} ${colors.bold(key)}`);
        console.log(`    ${colors.red('- ' + maskValue(val1, options.show))}`);
        console.log(`    ${colors.green('+ ' + maskValue(val2, options.show))}`);
        different++;
      }
    } else if (in1 && !in2) {
      console.log(`  ${symbols.minus} ${key} ${colors.dim(`(only in ${file1})`)}`);
      onlyIn1++;
    } else {
      console.log(`  ${symbols.plus} ${key} ${colors.dim(`(only in ${file2})`)}`);
      onlyIn2++;
    }
  }

  const passed = same;
  const failed = different + onlyIn1 + onlyIn2;
  printSummary(passed, failed);

  return { same, different, onlyIn1, onlyIn2 };
}

/**
 * Mask sensitive values unless --show flag is used
 */
function maskValue(value, show = false) {
  if (show) return value;
  if (value.length <= 4) return '****';
  return value.substring(0, 2) + '****' + value.substring(value.length - 2);
}

module.exports = diff;
