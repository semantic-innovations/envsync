<p align="center">
  <h1 align="center">envsync</h1>
  <p align="center">
    <strong>Stop deploying with missing environment variables.</strong>
  </p>
  <p align="center">
    Validate, compare, lint, and secure your <code>.env</code> files — in one command.
  </p>
  <p align="center">
    <a href="#installation">Install</a> · <a href="#commands">Commands</a> · <a href="#ci-integration">CI Setup</a> · <a href="#contributing">Contribute</a>
  </p>
</p>

---

## The Problem

Every developer has been here:

```
❌ App crashes → "DATABASE_URL is not defined"
❌ Deploy fails → someone added a new env var but forgot to tell the team
❌ New teammate → spends half a day figuring out which env vars they need
❌ Security panic → someone committed .env to git
```

**Your `.env.example` says one thing. Your `.env` says another. Production says nothing — it just breaks.**

There's no standard tool to catch this. Until now.

## What envsync Does

| Command | What it solves |
|---------|---------------|
| `envsync check` | Are all required env vars present? |
| `envsync diff` | What's different between local and staging? |
| `envsync lint` | Are there typos, duplicates, or bad formats? |
| `envsync scan` | Did someone leak secrets in the codebase? |
| `envsync template` | Generate `.env.example` from your `.env` automatically |

**Zero dependencies. Works offline. Runs in milliseconds.**

## Installation

```bash
npm install -g envsync-cli
```

Or use without installing:

```bash
npx envsync-cli check
```

## Quick Start

```bash
# Check if your .env matches .env.example
envsync check

# Compare local vs staging
envsync diff .env .env.staging

# Lint your env file
envsync lint

# Scan for leaked secrets
envsync scan

# Generate .env.example from your .env
envsync template
```

## Commands

### `envsync check`

Validates your `.env` against `.env.example` and tells you what's missing.

```bash
$ envsync check

  envsync check
  ────────────────────────────────────────
  ✓ DATABASE_URL
  ✓ REDIS_URL
  ✓ PORT
  ⚠ API_KEY (empty)
  ✗ STRIPE_SECRET (missing)
  ✗ NEW_FEATURE_FLAG (missing)

  ────────────────────────────────────────
  4 passed · 2 failed · 1 warnings
```

**Options:**

```bash
envsync check                              # Uses .env + auto-detects example file
envsync check --env .env.local             # Check a specific env file
envsync check --example .env.template      # Use a specific example file
envsync check --ci                         # Exit code 1 on any errors (for CI)
```

### `envsync diff`

Compares two env files side by side. Values are masked by default.

```bash
$ envsync diff .env .env.staging

  envsync diff
  ────────────────────────────────────────
  Comparing: .env ↔ .env.staging

  ~ API_URL
    - ht****st
    + ht****om
  - DEBUG (only in .env)
  + SENTRY_DSN (only in .env.staging)

  ────────────────────────────────────────
  3 passed · 3 failed
```

**Options:**

```bash
envsync diff .env .env.staging             # Compare two files
envsync diff .env .env.prod --show         # Show full values (unmasked)
envsync diff .env .env.prod --all          # Also show matching vars
```

### `envsync lint`

Checks your `.env` for formatting issues, invalid keys, duplicates, and type mismatches.

```bash
$ envsync lint

  envsync lint
  ────────────────────────────────────────
  ✗ Line 5: 123BAD
    Invalid key name (use A-Z, 0-9, _)
  ⚠ Line 8: PORT
    Value "abc" doesn't look like a port number
  ⚠ Line 12: DATABASE_URL
    Duplicate key (first defined on line 3)

  ────────────────────────────────────────
  9 passed · 1 failed · 2 warnings
```

### `envsync scan`

Scans your project files for accidentally committed secrets.

```bash
$ envsync scan

  envsync scan
  ────────────────────────────────────────
  Scanning: /Users/you/project

  ⚠ AWS Access Key
    File: config/aws.json:12
    Match: AKIA****MPLE
  ⚠ GitHub Token
    File: scripts/deploy.sh:5
    Match: ghp_****fghi
  ⚠ .env not in .gitignore
    File: .gitignore
    Match: Add .env to your .gitignore to prevent committing secrets

  ────────────────────────────────────────
  0 passed · 0 failed · 3 warnings
```

**Detects:** AWS keys, GitHub tokens, GitLab tokens, Stripe keys, Slack tokens, private keys, bearer tokens, basic auth credentials, and generic secrets.

### `envsync template`

Generates a `.env.example` from your existing `.env` — strips all real values but preserves comments and structure.

```bash
$ envsync template

  envsync template
  ────────────────────────────────────────
  ✓ Created .env.example with 14 variables
```

**Options:**

```bash
envsync template                           # Generate .env.example
envsync template --output .env.sample      # Custom output filename
envsync template --force                   # Overwrite existing file
envsync template --dry-run                 # Preview without writing
```

## CI Integration

### GitHub Actions

```yaml
# .github/workflows/env-check.yml
name: Env Check
on: [push, pull_request]

jobs:
  env-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npx envsync-cli check --ci
      - run: npx envsync-cli scan --ci
```

### Pre-commit Hook

Add to your `package.json`:

```json
{
  "scripts": {
    "prestart": "envsync check",
    "precommit": "envsync scan"
  }
}
```

Or with [husky](https://github.com/typicode/husky):

```bash
npx husky add .husky/pre-commit "npx envsync-cli scan --ci"
```

### GitLab CI

```yaml
env-check:
  script:
    - npx envsync-cli check --ci
    - npx envsync-cli scan --ci
```

## Use as a Library

```javascript
const { check, diff, lint, scan, template } = require('envsync-cli');

// Use programmatically in your own tools
const result = check({ env: '.env', example: '.env.example' });
console.log(result); // { passed: 12, failed: 2, warnings: 1 }
```

## Why envsync?

| Problem | Before envsync | After envsync |
|---------|---------------|---------------|
| Missing env vars | App crashes at runtime | Caught before deploy |
| New teammate setup | "Ask John for the env vars" | `envsync check` shows exactly what's missing |
| Staging vs production | Manual comparison | `envsync diff .env .env.prod` |
| Leaked secrets | Found in code review (maybe) | `envsync scan` catches them instantly |
| .env.example outdated | Always out of sync | `envsync template` regenerates it |
| Bad formatting | Silent bugs | `envsync lint` catches typos and duplicates |

## Requirements

- Node.js >= 18
- Zero external dependencies

## Contributing

Contributions are welcome! Each command is a standalone file in `src/commands/`, making it easy to add new features.

```bash
git clone https://github.com/semantic-innovations/envsync.git
cd envsync
npm test
```

**Ideas for contributions:**
- New secret patterns for `scan`
- Additional lint rules
- YAML/TOML env file support
- VS Code extension
- Git hook installer command

## License

MIT

---

<p align="center">
  <strong>If your app has a <code>.env</code> file, it needs <code>envsync</code>.</strong>
  <br>
  <sub>Built by <a href="https://github.com/semantic-innovations">Semantic Innovations</a></sub>
</p>
