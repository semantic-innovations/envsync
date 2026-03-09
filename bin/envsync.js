#!/usr/bin/env node

const check = require('../src/commands/check');
const diff = require('../src/commands/diff');
const template = require('../src/commands/template');
const lint = require('../src/commands/lint');
const scan = require('../src/commands/scan');
const { colors } = require('../src/utils');

const args = process.argv.slice(2);
const command = args[0];

// Parse flags
function parseFlags(args) {
  const flags = {};
  const positional = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.substring(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(arg);
    }
  }

  return { flags, positional };
}

const { flags, positional } = parseFlags(args.slice(1));

switch (command) {
  case 'check':
    check({
      env: flags.env || positional[0],
      example: flags.example || positional[1],
      ci: flags.ci || false,
    });
    break;

  case 'diff':
    diff(positional[0] || flags.file1, positional[1] || flags.file2, {
      show: flags.show || false,
      all: flags.all || false,
    });
    break;

  case 'template':
    template({
      env: flags.env || positional[0],
      output: flags.output || positional[1],
      force: flags.force || false,
      dryRun: flags['dry-run'] || false,
    });
    break;

  case 'lint':
    lint({
      env: flags.env || positional[0],
      ci: flags.ci || false,
    });
    break;

  case 'scan':
    scan(positional[0] || '.', {
      ci: flags.ci || false,
    });
    break;

  case 'help':
  case '--help':
  case '-h':
  case undefined:
    printHelp();
    break;

  case '--version':
  case '-v':
    const pkg = require('../package.json');
    console.log(pkg.version);
    break;

  default:
    console.error(`  Unknown command: ${command}`);
    console.error(`  Run ${colors.cyan('envsync help')} for usage`);
    process.exit(1);
}

function printHelp() {
  console.log(`
  ${colors.bold('envsync')} — Validate, compare, and manage .env files

  ${colors.bold('Usage:')}
    envsync <command> [options]

  ${colors.bold('Commands:')}
    ${colors.cyan('check')}      Validate .env against .env.example
    ${colors.cyan('diff')}       Compare two env files
    ${colors.cyan('template')}   Generate .env.example from .env
    ${colors.cyan('lint')}       Check .env for formatting issues
    ${colors.cyan('scan')}       Detect leaked secrets in your project

  ${colors.bold('Examples:')}
    envsync check
    envsync check --env .env.local --example .env.example
    envsync diff .env .env.staging
    envsync diff .env .env.production --show
    envsync template
    envsync template --output .env.sample --force
    envsync lint
    envsync lint --env .env.production
    envsync scan
    envsync scan ./src --ci

  ${colors.bold('Options:')}
    --ci         Exit with code 1 on errors (for CI pipelines)
    --env        Path to .env file (default: .env)
    --example    Path to example file (default: auto-detect)
    --show       Show full values in diff (default: masked)
    --all        Show matching vars in diff too
    --force      Overwrite existing files
    --dry-run    Preview output without writing

  ${colors.dim('https://github.com/semantic-innovations/envsync')}
`);
}
