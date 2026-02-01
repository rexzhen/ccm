#!/usr/bin/env node

const SessionManager = require('./session-manager.js');

const manager = new SessionManager();
const summary = manager.getLatestSummary();

// Write to stderr which is typically visible to user
if (summary) {
  console.error('\n' + '='.repeat(60));
  console.error('📋 PREVIOUS SESSION SUMMARY');
  console.error('='.repeat(60));
  console.error(summary);
  console.error('='.repeat(60) + '\n');
} else {
  console.error('\n' + '='.repeat(60));
  console.error('🎉 FRESH START - No previous session found');
  console.error('='.repeat(60) + '\n');
}

// Also output for AI context via stdout
if (summary) {
  console.log(summary);
} else {
  console.log('## No Previous Session\n\nNo previous session found in this context.\nThis is a fresh start! 🎉\n');
}
