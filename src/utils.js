const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  dim: (text) => `\x1b[2m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
};

const symbols = {
  check: colors.green('✓'),
  cross: colors.red('✗'),
  warn: colors.yellow('⚠'),
  arrow: colors.cyan('→'),
  plus: colors.green('+'),
  minus: colors.red('-'),
  tilde: colors.yellow('~'),
};

function printHeader(title) {
  console.log();
  console.log(colors.bold(`  envsync ${title}`));
  console.log(colors.dim('  ' + '─'.repeat(40)));
}

function printSummary(passed, failed, warnings = 0) {
  console.log();
  console.log(colors.dim('  ' + '─'.repeat(40)));
  const parts = [];
  if (passed > 0) parts.push(colors.green(`${passed} passed`));
  if (failed > 0) parts.push(colors.red(`${failed} failed`));
  if (warnings > 0) parts.push(colors.yellow(`${warnings} warnings`));
  console.log(`  ${parts.join(colors.dim(' · '))}`);
  console.log();
}

module.exports = { colors, symbols, printHeader, printSummary };
