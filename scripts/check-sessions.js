#!/usr/bin/env node

/**
 * Display the latest session summary as a user prompt on startup
 * This shows the summary from summaries/latest.md directly to the user
 * If no local summary exists, it inherits from parent project directories
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
  // No previous summary found anywhere
  // If we're in a project (not global), show a helpful message about the new project
  if (contextInfo.mode === 'project') {
    const output = {
      userPrompt: `🆕 **New Claude Project Detected**

This is a new project with no session history yet.

**Project:** \`${contextInfo.projectName}\`
**Location:** \`${contextInfo.projectRoot}\`

What would you like to work on in this project?`
    };
    console.log(JSON.stringify(output));
    process.exit(0);
  }

  // Global mode with no history - silent start
  process.exit(0);
}

// Build the user prompt with inheritance warning if applicable
let promptText = '';

if (isInherited) {
  const sourceLocation = summarySource === 'global'
    ? '~/.claude/sessions (global)'
    : path.basename(summarySource);

  promptText = `⚠️  **Note:** This is a new project with no session history yet. Showing summary inherited from parent context: \`${sourceLocation}\`

---

${summary}

---

What would you like to work on in this project?`;
} else {
  promptText = `Here's the summary from the last session:

${summary}

---

What would you like to work on?`;
}

// Output as user prompt (this will be shown to Claude as if the user asked)
const output = {
  userPrompt: promptText
};

console.log(JSON.stringify(output));
process.exit(0);
