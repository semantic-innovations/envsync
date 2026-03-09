const fs = require('fs');
const path = require('path');

/**
 * Parse a .env file into a Map of { key: { value, line, raw } }
 */
function parseEnvFile(filePath) {
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    return null;
  }

  const content = fs.readFileSync(absolutePath, 'utf-8');
  return parseEnvContent(content);
}

/**
 * Parse .env content string into a Map
 */
function parseEnvContent(content) {
  const entries = new Map();
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) {
      continue;
    }

    const key = trimmed.substring(0, eqIndex).trim();
    let value = trimmed.substring(eqIndex + 1).trim();

    // Remove surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Remove inline comments (only if not inside quotes)
    const commentIndex = value.indexOf(' #');
    if (commentIndex !== -1) {
      value = value.substring(0, commentIndex).trim();
    }

    if (key) {
      entries.set(key, { value, line: i + 1, raw });
    }
  }

  return entries;
}

/**
 * Find the .env.example file by checking common names
 */
function findExampleFile(dir = '.') {
  const candidates = [
    '.env.example',
    '.env.sample',
    '.env.template',
    '.env.defaults',
  ];

  for (const name of candidates) {
    const filePath = path.resolve(dir, name);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  return null;
}

module.exports = { parseEnvFile, parseEnvContent, findExampleFile };
