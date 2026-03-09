const fs = require('fs');
const path = require('path');
const { colors, symbols, printHeader, printSummary } = require('../utils');

/**
 * Secret patterns to detect
 */
const SECRET_PATTERNS = [
  { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/ },
  { name: 'AWS Secret Key', pattern: /[0-9a-zA-Z/+]{40}/, context: /aws|secret/i },
  { name: 'GitHub Token', pattern: /(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,}/ },
  { name: 'GitLab Token', pattern: /glpat-[A-Za-z0-9\-_]{20,}/ },
  { name: 'Slack Token', pattern: /xox[baprs]-[0-9a-zA-Z\-]{10,}/ },
  { name: 'Stripe Key', pattern: /sk_(live|test)_[0-9a-zA-Z]{24,}/ },
  { name: 'Private Key', pattern: /-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/ },
  { name: 'Generic Secret', pattern: /(password|passwd|pwd|secret|token|api_key|apikey|api-key)\s*[:=]\s*['"]\S{8,}['"]/i },
  { name: 'Bearer Token', pattern: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/  },
  { name: 'Basic Auth', pattern: /Basic\s+[A-Za-z0-9+/]+=*/  },
];

/**
 * Files to scan by default
 */
const DEFAULT_GLOBS = [
  '*.json', '*.yml', '*.yaml', '*.toml', '*.xml',
  '*.js', '*.ts', '*.py', '*.rb', '*.go', '*.java',
  '*.sh', '*.bash', '*.cfg', '*.conf', '*.ini',
  'Dockerfile', 'docker-compose*.yml',
];

/**
 * Files/dirs to always skip
 */
const SKIP_DIRS = [
  'node_modules', '.git', 'dist', 'build', 'vendor',
  '__pycache__', '.next', '.nuxt', 'coverage',
];

const SKIP_FILES = ['.env.example', '.env.sample', '.env.template', 'package-lock.json', 'yarn.lock'];

/**
 * Scan directory for leaked secrets
 */
function scan(targetDir = '.', options = {}) {
  const dir = path.resolve(targetDir);

  if (!fs.existsSync(dir)) {
    console.error(`  ${symbols.cross} Directory not found: ${targetDir}`);
    process.exit(1);
  }

  printHeader('scan');
  console.log(colors.dim(`  Scanning: ${dir}`));
  console.log();

  const findings = [];

  // Check if .env is tracked by git
  checkEnvInGit(dir, findings);

  // Scan files for secrets
  scanDirectory(dir, findings, options);

  // Print findings
  if (findings.length === 0) {
    console.log(`  ${symbols.check} No secrets detected`);
  } else {
    for (const finding of findings) {
      console.log(`  ${symbols.warn} ${colors.bold(finding.type)}`);
      console.log(`    ${colors.dim('File:')} ${finding.file}${finding.line ? `:${finding.line}` : ''}`);
      if (finding.preview) {
        console.log(`    ${colors.dim('Match:')} ${colors.red(finding.preview)}`);
      }
    }
  }

  printSummary(0, 0, findings.length);

  if (options.ci && findings.length > 0) {
    process.exit(1);
  }

  return { findings: findings.length };
}

function checkEnvInGit(dir, findings) {
  const gitDir = path.join(dir, '.git');
  if (!fs.existsSync(gitDir)) return;

  // Check .gitignore for .env
  const gitignorePath = path.join(dir, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
    if (!gitignore.includes('.env')) {
      findings.push({
        type: '.env not in .gitignore',
        file: '.gitignore',
        preview: 'Add .env to your .gitignore to prevent committing secrets',
      });
    }
  } else {
    findings.push({
      type: 'No .gitignore found',
      file: dir,
      preview: 'Create a .gitignore and add .env to it',
    });
  }
}

function scanDirectory(dir, findings, options, depth = 0) {
  if (depth > 10) return;

  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (SKIP_DIRS.includes(entry.name)) continue;
      scanDirectory(fullPath, findings, options, depth + 1);
    } else if (entry.isFile()) {
      if (SKIP_FILES.includes(entry.name)) continue;
      if (shouldScanFile(entry.name)) {
        scanFile(fullPath, findings);
      }
    }
  }
}

function shouldScanFile(filename) {
  return DEFAULT_GLOBS.some((glob) => {
    if (glob.startsWith('*.')) {
      return filename.endsWith(glob.substring(1));
    }
    return filename === glob || filename.startsWith(glob.replace('*', ''));
  });
}

function scanFile(filePath, findings) {
  let content;
  try {
    const stat = fs.statSync(filePath);
    if (stat.size > 1024 * 1024) return; // Skip files > 1MB
    content = fs.readFileSync(filePath, 'utf-8');
  } catch {
    return;
  }

  const lines = content.split('\n');
  const relativePath = path.relative(process.cwd(), filePath);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const secret of SECRET_PATTERNS) {
      if (secret.pattern.test(line)) {
        // If pattern needs context, check the key name
        if (secret.context && !secret.context.test(line)) continue;

        const match = line.match(secret.pattern);
        const preview = match ? maskSecret(match[0]) : '';

        findings.push({
          type: secret.name,
          file: relativePath,
          line: i + 1,
          preview,
        });
        break; // One finding per line
      }
    }
  }
}

function maskSecret(value) {
  if (value.length <= 8) return '****';
  return value.substring(0, 4) + '****' + value.substring(value.length - 4);
}

module.exports = scan;
