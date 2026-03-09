# Contributing to envsync

First off, thanks for considering contributing! envsync is built to be simple and easy to contribute to.

## Project Structure

```
envsync/
├── bin/envsync.js        → CLI entry point (parses args, routes to commands)
├── src/
│   ├── commands/
│   │   ├── check.js      → Validate .env against .env.example
│   │   ├── diff.js       → Compare two env files
│   │   ├── lint.js       → Check formatting issues
│   │   ├── scan.js       → Detect leaked secrets
│   │   └── template.js   → Generate .env.example
│   ├── parser.js         → Parse .env files into structured data
│   └── utils.js          → Colors, symbols, output helpers
├── tests/                → Test files (one per command)
└── package.json
```

Each command is a **standalone file** — you can understand one without reading the others.

## Ground Rules

1. **Zero dependencies** — We only use Node.js built-in modules. No exceptions.
2. **Keep it simple** — Each command should do one thing well.
3. **Test everything** — Add tests for any new functionality.
4. **No breaking changes** — Existing CLI flags and output format should stay stable.

## Getting Started

```bash
# Clone the repo
git clone https://github.com/semantic-innovations/envsync.git
cd envsync

# Run tests
npm test

# Test the CLI locally
node bin/envsync.js help
node bin/envsync.js check --env path/to/.env
```

## How to Add a New Lint Rule

1. Open `src/commands/lint.js`
2. Add your check in the main loop (look for the pattern)
3. Push to `errors[]` for hard failures or `warnings[]` for soft issues
4. Add a test in `tests/lint.test.js`

## How to Add a New Secret Pattern

1. Open `src/commands/scan.js`
2. Add your pattern to the `SECRET_PATTERNS` array:
   ```javascript
   { name: 'Service Name', pattern: /your-regex-here/ }
   ```
3. Add a test in `tests/scan.test.js`

## How to Add a New Command

1. Create `src/commands/yourcommand.js`
2. Export a single function
3. Add the route in `bin/envsync.js` (switch statement)
4. Create `tests/yourcommand.test.js`
5. Update README with usage docs

## Submitting a PR

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run `npm test` — all tests must pass
5. Commit with a clear message
6. Open a PR

## Reporting Bugs

Use the [bug report template](https://github.com/semantic-innovations/envsync/issues/new?template=bug_report.yml) — it helps us fix things faster.

## Questions?

Open a [discussion](https://github.com/semantic-innovations/envsync/issues) or reach out. We're friendly!
