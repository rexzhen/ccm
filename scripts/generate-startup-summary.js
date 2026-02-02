#!/usr/bin/env node

/**
 * Generate a comprehensive summary directly on SessionStart
 * This script reads recent session files and generates a rich summary
 * without relying on userPrompt injection
 */

const SessionManager = require('./session-manager.js');
const fs = require('fs');
const path = require('path');

const manager = new SessionManager();
const contextInfo = manager.getContextInfo();

// Check if there are any previous sessions
const recentSessions = manager.listSessions(10);

if (recentSessions.length === 0) {
  // No previous sessions - output a simple welcome message
  const output = {
    systemMessage: `# CCM Plugin - Session Memory Active

✨ This is a fresh start - no previous sessions found.

💡 Quick commands: \`/ccm-save\` | \`/ccm-history\``
  };
  console.log(JSON.stringify(output));
  process.exit(0);
}

// Analyze recent sessions to generate comprehensive summary
const sessions = recentSessions.slice(0, 5).map(s => {
  try {
    const content = fs.readFileSync(path.join(contextInfo.sessionDir, s.filename), 'utf8');
    return JSON.parse(content);
  } catch (e) {
    return null;
  }
}).filter(s => s !== null);

// Group sessions by date
const sessionsByDate = {};
sessions.forEach(session => {
  const date = new Date(session.timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  if (!sessionsByDate[date]) {
    sessionsByDate[date] = [];
  }
  sessionsByDate[date].push(session);
});

// Build the comprehensive summary
let summary = `# 📋 Session Memory Loaded

**Project:** ${contextInfo.projectName || 'Global'}
**Location:** \`${contextInfo.sessionDir}\`
**Recent Sessions:** ${sessions.length} sessions analyzed

---

## 🎯 Recent Work Summary
`;

/**
 * Extract meaningful topics from conversation
 * Creates a human-readable summary of what was discussed
 */
function extractConversationTopics(session) {
  if (!session.exchanges || session.exchanges.length === 0) {
    return 'Conversation (no details available)';
  }

  const firstExchange = session.exchanges[0];

  // Strategy 1: Use custom summary if provided
  if (session.summary && session.summary.length > 15 && !session.summary.includes('Session saved')) {
    return session.summary;
  }

  // Strategy 2: Analyze the conversation flow between user and assistant
  let userText = firstExchange.user || '';
  let assistantText = firstExchange.assistant || '';

  // Clean up system noise from messages
  userText = userText.replace(/⏺[^⏺]*/g, '').replace(/\(ctrl\+[^)]+\)/g, '').trim();

  // Extract key noun phrases from combined text (look for the main subject)
  const combinedText = userText + ' ' + assistantText;

  // Look for common patterns that indicate the topic
  const patterns = [
    // Technical discussions
    /(?:discussing|about|regarding|working on|issue with|problem with|feature for|implementation of)\s+([^,.!?]{15,80})/i,
    // File or component references
    /(?:the|in|for|update|modify|change|fix)\s+([a-zA-Z0-9_-]+\.(?:js|ts|json|py|md|html|css)[^,.!?]{0,30})/i,
    // General technical terms (capitalized or with hyphens)
    /\b([A-Z][a-z]+(?:[A-Z][a-z]+)+|[a-z]+-[a-z]+(?:-[a-z]+)*)\s+(?:feature|functionality|system|component|hook|plugin|script)/i,
    // Questions about specific things
    /(?:how|what|why)\s+(?:to|do|does|should|is)\s+([^?]{20,80})\?/i,
  ];

  for (const pattern of patterns) {
    const match = combinedText.match(pattern);
    if (match && match[1]) {
      let topic = match[1].trim();
      // Clean up
      topic = topic.replace(/\s+/g, ' ').substring(0, 80);
      if (topic.length > 20) {
        return topic;
      }
    }
  }

  // Strategy 3: Extract key action verbs + objects
  const actionMatch = combinedText.match(/\b(creat|build|implement|fix|updat|improv|add|remov|refactor|design|debug|test|deploy|analyz)\w*\s+([^,.!?]{10,60})/i);
  if (actionMatch) {
    return `${actionMatch[1]}${actionMatch[1].endsWith('e') ? '' : 'e'} ${actionMatch[2].trim()}`.substring(0, 80);
  }

  // Strategy 4: Just take the most meaningful sentence from user message
  const sentences = userText.split(/[.!?]\s+/).filter(s => s.length > 25 && s.length < 100);
  if (sentences.length > 0) {
    return sentences[0].trim().replace(/^(please|could you|can you|would you|i need|i want|help me)\s+/gi, '');
  }

  // Strategy 5: Fall back to first 80 chars of user message
  if (userText.length > 20) {
    return userText.substring(0, 80).trim() + (userText.length > 80 ? '...' : '');
  }

  return 'Discussion';
}

// Analyze each date group
const dates = Object.keys(sessionsByDate).sort((a, b) => new Date(b) - new Date(a));

for (const date of dates.slice(0, 3)) { // Show last 3 days
  const dateSessions = sessionsByDate[date];
  summary += `\n### ${date}\n`;

  const topics = [];
  const allDecisions = [];
  const allNextSteps = [];
  let totalExchanges = 0;

  dateSessions.forEach(session => {
    // Extract meaningful topic from conversation
    const topic = extractConversationTopics(session);
    if (topic) {
      topics.push(topic);
    }

    if (session.exchanges) {
      totalExchanges += session.exchanges.length;
    }

    if (session.decisions) {
      allDecisions.push(...session.decisions);
    }

    if (session.nextSteps) {
      allNextSteps.push(...session.nextSteps);
    }
  });

  // Show topics
  if (topics.length > 0) {
    summary += `**Topics discussed:**\n`;
    topics.slice(0, 3).forEach(topic => {
      summary += `  • ${topic}\n`;
    });
    summary += `\n`;
  }

  // Show session count and exchanges
  summary += `*${dateSessions.length} session(s), ${totalExchanges} exchange(s)*\n`;

  // Show key decisions
  if (allDecisions.length > 0) {
    summary += `\n**Key Decisions:**\n`;
    allDecisions.slice(0, 2).forEach(decision => {
      summary += `- ${decision}\n`;
    });
  }

  // Show next steps
  if (allNextSteps.length > 0) {
    summary += `\n**Next Steps:**\n`;
    allNextSteps.slice(0, 2).forEach(step => {
      summary += `- ${step}\n`;
    });
  }
}

summary += `\n---

## 🔍 Session Details

`;

/**
 * Generate a concise conversation summary from exchanges
 */
function summarizeConversation(session) {
  if (!session.exchanges || session.exchanges.length === 0) {
    return session.summary || `*${session.messageCount || 0} messages*`;
  }

  const topic = extractConversationTopics(session);
  let conversationSummary = '';

  if (topic) {
    conversationSummary += `**Discussion:** ${topic}\n\n`;
  }

  // Show conversation flow (first few exchanges)
  const exchangesToShow = Math.min(2, session.exchanges.length);
  for (let i = 0; i < exchangesToShow; i++) {
    const ex = session.exchanges[i];
    if (ex.user) {
      const userMsg = ex.user.substring(0, 150).replace(/\n/g, ' ');
      conversationSummary += `👤 ${userMsg}${ex.user.length > 150 ? '...' : ''}\n`;
    }
    if (ex.assistant) {
      const assistantMsg = ex.assistant.substring(0, 200).replace(/\n/g, ' ');
      conversationSummary += `🤖 ${assistantMsg}${ex.assistant.length > 200 ? '...' : ''}\n\n`;
    }
  }

  if (session.exchanges.length > exchangesToShow) {
    conversationSummary += `*...and ${session.exchanges.length - exchangesToShow} more exchange(s)*\n`;
  }

  return conversationSummary;
}

// Show individual session summaries
sessions.slice(0, 3).forEach((session, idx) => {
  const time = new Date(session.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  const date = new Date(session.timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  summary += `\n### Session ${idx + 1}: ${date} at ${time}\n\n`;

  // Show conversation summary
  summary += summarizeConversation(session);

  if (session.decisions && session.decisions.length > 0) {
    summary += `\n**Decisions:**\n`;
    session.decisions.forEach(d => summary += `- ${d}\n`);
  }

  if (session.nextSteps && session.nextSteps.length > 0) {
    summary += `\n**Next Steps:**\n`;
    session.nextSteps.forEach(s => summary += `- ${s}\n`);
  }
});

summary += `\n---

## 💡 What would you like to work on today?

Based on recent sessions, you can:

1. **Continue previous work** - Pick up where you left off
2. **Browse history** - Use \`/ccm-history\` to search past sessions
3. **Start something new** - Begin a fresh task
4. **Review decisions** - Examine key decisions made in recent sessions

*Session memory is active. Use \`/ccm-save\` to manually save important sessions.*
`;

// Output as systemMessage so it appears in the UI
const output = {
  systemMessage: summary
};

console.log(JSON.stringify(output));
process.exit(0);
