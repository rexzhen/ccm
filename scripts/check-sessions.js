#!/usr/bin/env node

/**
 * SessionStart Hook - Load Previous Session Summary
 * This script runs automatically when Claude Code starts
 * It adds the summary to Claude's context via <system-reminder>
 * Claude's instructions.md tells it to display the summary automatically
 */

const fs = require('fs');
const path = require('path');
const SessionManager = require('./session-manager.js');

const manager = new SessionManager();
const contextInfo = manager.getContextInfo();

// Check if we have a latest summary in the current context
const latestSummaryPath = path.join(contextInfo.sessionDir, 'summaries', 'latest.md');

let summary = null;
let summarySource = null;
let isInherited = false;

if (fs.existsSync(latestSummaryPath)) {
  // Found local summary
  summary = fs.readFileSync(latestSummaryPath, 'utf8');
  summarySource = contextInfo.sessionDir;
  isInherited = false;
} else if (contextInfo.mode === 'project' && contextInfo.projectRoot) {
  // No local summary in project - try to find parent project summaries
  let currentDir = path.dirname(contextInfo.projectRoot);
  const homeDir = require('os').homedir();

  // Search up the directory tree for parent .claude directories
  while (currentDir !== path.parse(currentDir).root && currentDir !== homeDir) {
    const parentClaudeDir = path.join(currentDir, '.claude');
    const parentSummaryPath = path.join(parentClaudeDir, 'sessions', 'summaries', 'latest.md');

    if (fs.existsSync(parentSummaryPath)) {
      // Found parent summary
      summary = fs.readFileSync(parentSummaryPath, 'utf8');
      summarySource = currentDir;
      isInherited = true;
      break;
    }

    // Move up one directory
    currentDir = path.dirname(currentDir);
  }

  // If still no summary found, try global sessions as last resort
  if (!summary) {
    const globalSummaryPath = path.join(homeDir, '.claude', 'sessions', 'summaries', 'latest.md');
    if (fs.existsSync(globalSummaryPath)) {
      summary = fs.readFileSync(globalSummaryPath, 'utf8');
      summarySource = 'global';
      isInherited = true;
    }
  }
}

if (!summary) {
  // No previous summary found - exit silently
  // Claude will start normally without session context
  process.exit(0);
}

// Build the prompt text for Claude's context
// The .claude-plugin/instructions.md file tells Claude to display this automatically
let promptText = '';

if (isInherited) {
  const sourceLocation = summarySource === 'global'
    ? '~/.claude/sessions (global)'
    : path.basename(summarySource);

  promptText = `⚠️  **Note:** Showing summary inherited from parent context: \`${sourceLocation}\`

---

${summary}

---

What would you like to work on?`;
} else {
  promptText = `Here's the summary from the last session:

${summary}

---

What would you like to work on?`;
}

// Output as plain text to be wrapped in <system-reminder> by Claude Code
console.log(promptText);
process.exit(0);
