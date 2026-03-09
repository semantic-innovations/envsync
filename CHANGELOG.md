# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-09

### Added

- **`envsync check`** — Validate `.env` against `.env.example`. Detects missing, empty, and extra variables.
- **`envsync diff`** — Compare two env files side by side with masked values.
- **`envsync lint`** — Check `.env` for formatting issues, invalid keys, duplicates, and type mismatches.
- **`envsync scan`** — Scan project files for leaked secrets (AWS, GitHub, GitLab, Stripe, Slack tokens, and more).
- **`envsync template`** — Generate `.env.example` from existing `.env`, preserving comments and structure.
- `--ci` flag for all commands (exit code 1 on errors)
- Auto-detection of `.env.example`, `.env.sample`, `.env.template`, `.env.defaults`
- Value masking in diff output (use `--show` to reveal)
- Programmatic API — use as a library in your own tools
- 25 unit tests
- Zero external dependencies
