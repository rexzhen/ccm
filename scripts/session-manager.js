#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Context-aware session manager for Claude Code
 * Automatically detects project context and manages sessions accordingly
 */
class SessionManager {
  constructor() {
    this.cwd = process.cwd();
    this.projectRoot = this.findProjectRoot();

    // Decide session location based on context
    this.sessionDir = this.determineSessionDir();
  }



  /**
   * Find project root by looking for .claude directory (Claude project)
   */
  findProjectRoot() {
    let dir = this.cwd;
    while (dir !== path.parse(dir).root) {
      if (fs.existsSync(path.join(dir, '.claude'))) {
        return dir;
      }
      dir = path.dirname(dir);
    }
    return null;
  }

  /**
   * Determine session directory based on context
   * Priority: Claude Project (.claude directory) > Global
   */
  determineSessionDir() {
    // If in a Claude project, use project-specific sessions
    if (this.projectRoot) {
      const projectSessions = path.join(this.projectRoot, '.claude/sessions');
      if (process.stderr.isTTY) {
        console.error(`📁 Using Claude project sessions: ${projectSessions}`);
      }
      return projectSessions;
    }

    // Otherwise, use global sessions
    const globalSessions = path.join(require('os').homedir(), '.claude/sessions');
    if (process.stderr.isTTY) {
      console.error(`🌍 Using global sessions: ${globalSessions}`);
    }
    return globalSessions;
  }

  /**
   * Ensure all required directories exist
   */
  ensureDirectories() {
    const dirs = [
      this.sessionDir,
      path.join(this.sessionDir, 'summaries'),
      path.join(this.sessionDir, 'archives')
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Get the latest session summary
   */
  getLatestSummary() {
    this.ensureDirectories();
    const summaryPath = path.join(this.sessionDir, 'summaries/latest.md');
    if (fs.existsSync(summaryPath)) {
      return fs.readFileSync(summaryPath, 'utf8');
    }
    return null;
  }

  /**
   * Save session data with timestamp
   */
  saveSession(sessionData = {}) {
    this.ensureDirectories();

    const timestamp = new Date().toISOString();
    const filename = `${timestamp.replace(/[:.]/g, '-')}.json`;
    const filepath = path.join(this.sessionDir, filename);

    const data = {
      timestamp,
      workingDir: this.cwd,
      projectRoot: this.projectRoot,
      isProjectSession: this.projectRoot !== null,
      projectName: this.projectRoot ? path.basename(this.projectRoot) : null,
      ...sessionData
    };

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));

    // Update summary
    this.saveSummary(data);

    return { filename, filepath, data };
  }

  /**
   * Generate and save session summary
   */
  saveSummary(sessionData) {
    const summary = this.generateSummary(sessionData);
    const summaryPath = path.join(this.sessionDir, 'summaries/latest.md');
    const date = new Date().toISOString().split('T')[0];
    const datedSummary = path.join(this.sessionDir, 'summaries', `${date}.md`);

    fs.writeFileSync(summaryPath, summary);
    fs.writeFileSync(datedSummary, summary);
  }

  /**
   * Generate markdown summary from session data
   */
  generateSummary(data) {
    const location = data.projectRoot
      ? `Project: **${path.basename(data.projectRoot)}**`
      : 'Global session';

    const contextType = data.projectRoot ? '🚀 Project-specific session' : '🌍 Global session';

    // Generate a meaningful summary based on available data
    let summaryText = data.summary || '';

    // If no custom summary provided, generate focused bullet points
    if (!summaryText || summaryText === 'Session automatically saved by CCM.') {
      const parts = [];

      // Extract topic/problem from first exchange
      if (data.exchanges && data.exchanges.length > 0) {
        const firstExchange = data.exchanges[0];
        // Try to extract main topic (keep it under 60 chars for brevity)
        const topic = this.extractMainTopic(firstExchange.user);
        if (topic) {
          parts.push(`• **Topic:** ${topic}`);
        }
      }

      // Add key decisions/outcomes
      if (data.decisions && data.decisions.length > 0) {
        const decision = data.decisions[0].length > 70
          ? data.decisions[0].substring(0, 70) + '...'
          : data.decisions[0];
        parts.push(`• **Outcome:** ${decision}`);
      }

      // Add next steps concisely
      if (data.nextSteps && data.nextSteps.length > 0) {
        const nextStep = data.nextSteps[0].length > 70
          ? data.nextSteps[0].substring(0, 70) + '...'
          : data.nextSteps[0];
        parts.push(`• **Next:** ${nextStep}`);
      }

      summaryText = parts.length > 0 ? parts.join('\n') : 'Session saved.';
    }

    const messageStats = data.messageCount ? `\n*Total exchanges: ${Math.floor(data.messageCount / 2)}*\n` : '';

    // Show decisions and next steps instead of file details
    const decisionsSection = data.decisions && data.decisions.length > 0
      ? `\n## Key Decisions\n${data.decisions.map(d => `- ${d}`).join('\n')}\n`
      : '';

    const nextStepsSection = data.nextSteps && data.nextSteps.length > 0
      ? `\n## Where We Left Off\n${data.nextSteps.map(s => `- ${s}`).join('\n')}\n`
      : '';

    const topicsSection = data.topics && data.topics.length > 0
      ? `\n## Topics Discussed\n${data.topics.slice(0, 5).map(t => `- ${t}`).join('\n')}${data.topics.length > 5 ? `\n- ...and ${data.topics.length - 5} more` : ''}\n`
      : '';

    return `# Session Summary

**Date:** ${new Date(data.timestamp).toLocaleString()}
**Location:** ${location}
**Working Directory:** \`${data.workingDir}\`
${data.projectRoot ? `**Project Root:** \`${data.projectRoot}\`` : ''}

## Context
${contextType}

## Summary
${summaryText}
${decisionsSection}${nextStepsSection}${topicsSection}${messageStats}
---
*Generated by CCM Plugin v1.0.3*
*Context-aware session management*
`;
  }

  /**
   * Search sessions for a query string
   */
  searchSessions(query) {
    this.ensureDirectories();

    const sessionFiles = fs.readdirSync(this.sessionDir)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse(); // Most recent first

    const results = [];

    for (const file of sessionFiles) {
      try {
        const content = fs.readFileSync(path.join(this.sessionDir, file), 'utf8');
        const data = JSON.parse(content);
        const searchable = JSON.stringify(data).toLowerCase();

        if (searchable.includes(query.toLowerCase())) {
          results.push({
            filename: file,
            timestamp: data.timestamp,
            projectName: data.projectName,
            workingDir: data.workingDir,
            excerpt: this.generateExcerpt(data, query)
          });
        }
      } catch (error) {
        console.error(`Error reading ${file}:`, error.message);
      }
    }

    return results;
  }

  /**
   * Parse JSONL transcript file from Claude Code
   */
  parseTranscript(transcriptPath) {
    try {
      if (!fs.existsSync(transcriptPath)) {
        return null;
      }

      const content = fs.readFileSync(transcriptPath, 'utf8');

      // Try to parse as JSONL first (one JSON object per line)
      let messages;
      if (content.includes('\n') && !content.trim().startsWith('[')) {
        // JSONL format
        const lines = content.trim().split('\n').filter(line => line.trim());
        messages = lines.map(line => {
          try {
            return JSON.parse(line);
          } catch (e) {
            return null;
          }
        }).filter(m => m !== null);
      } else {
        // Single JSON array or object
        try {
          const parsed = JSON.parse(content);
          messages = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          console.error('Failed to parse transcript as JSON:', e.message);
          return null;
        }
      }

      return this.summarizeTranscript(messages);
    } catch (error) {
      console.error('Error parsing transcript:', error.message);
      return null;
    }
  }

  /**
   * Generate summary from transcript messages
   */
  summarizeTranscript(messages) {
    // Filter for actual user/assistant messages (not progress/hooks)
    // Keep them in order and build exchanges by pairing consecutive messages
    const conversationMessages = messages.filter(m => {
      if (m.type !== 'user' && m.type !== 'assistant') return false;
      if (!m.message || !m.message.content) return false;

      // For user messages, only include those with string content (actual user input)
      // Skip tool results (array content with tool_use_id)
      if (m.message.role === 'user') {
        return typeof m.message.content === 'string';
      }

      // For assistant messages, include all
      return m.message.role === 'assistant';
    });

    // Extract ONLY the first exchange for a clean summary
    const exchanges = [];
    let currentExchange = null;

    for (const msg of conversationMessages) {
      if (msg.message.role === 'user') {
        // Save previous exchange if complete
        if (currentExchange && currentExchange.user && currentExchange.assistant) {
          exchanges.push(currentExchange);
          if (exchanges.length >= 1) break; // Only keep first exchange
        }
        // Start a new exchange
        // Clean XML-like tags from user messages (e.g., <command-message>)
        const cleanContent = this.sanitizeMessage(msg.message.content);
        currentExchange = {
          user: this.truncate(cleanContent, 200),
          assistant: ''
        };
      } else if (msg.message.role === 'assistant' && currentExchange) {
        // Only capture the FIRST non-empty assistant response
        const assistantText = this.extractAssistantText(msg.message.content);
        if (assistantText && !assistantText.match(/^\s*$/) && !currentExchange.assistant) {
          currentExchange.assistant = this.truncate(assistantText, 300);
        }
      }
    }

    // Add final exchange if complete
    if (currentExchange && currentExchange.user && currentExchange.assistant && exchanges.length < 1) {
      exchanges.push(currentExchange);
    }

    // Extract the last few exchanges to understand where we left off
    const lastExchanges = exchanges.slice(-3); // Last 3 exchanges

    // Analyze conversation to extract key information
    const allText = messages
      .map(m => {
        if (m.type === 'user' && m.message && typeof m.message.content === 'string') {
          return m.message.content;
        }
        if (m.type === 'assistant' && m.message && m.message.content) {
          return this.extractAssistantText(m.message.content);
        }
        return '';
      })
      .join(' ');

    // Extract next steps / action items from last assistant message
    let nextSteps = null;
    if (exchanges.length > 0) {
      const lastAssistant = exchanges[exchanges.length - 1].assistant;
      const nextStepPatterns = [
        /(?:next(?:\s+step)?|we(?:'ll| will)|let'?s|going to|about to|ready to|need to|should|plan to)[:\s]+([^.!?\n]{20,150})/gi,
        /(?:i'?ll|we can|you can|you should)[:\s]+([^.!?\n]{20,150})/gi,
        /before (?:we|you|i)[:\s]+([^.!?\n]{20,150})/gi
      ];

      const steps = [];
      for (const pattern of nextStepPatterns) {
        const matches = [...lastAssistant.matchAll(pattern)];
        matches.slice(0, 2).forEach(match => {
          const step = match[1].trim();
          if (step.length > 20 && !steps.includes(step)) {
            steps.push(step);
          }
        });
      }

      if (steps.length > 0) {
        nextSteps = steps.slice(0, 2); // Max 2 next steps
      }
    }

    // Extract key decisions or topics from the conversation
    const decisions = [];
    const decisionPatterns = [
      /(?:decided|agreed|chose|selected|going with|will use)[:\s]+([^.!?\n]{15,120})/gi,
      /(?:the plan is|approach is|solution is|we'?ll)[:\s]+([^.!?\n]{15,120})/gi
    ];

    for (const pattern of decisionPatterns) {
      const matches = [...allText.matchAll(pattern)];
      matches.slice(0, 3).forEach(match => {
        const decision = match[1].trim();
        if (decision.length > 15 && !decisions.includes(decision)) {
          decisions.push(decision);
        }
      });
    }

    return {
      messageCount: messages.length,
      exchanges,
      nextSteps,
      decisions: decisions.length > 0 ? decisions.slice(0, 2) : null,
      lastExchanges,
      fullTranscript: JSON.stringify(messages)
    };
  }

  /**
   * Extract text from assistant message content array
   */
  extractAssistantText(messageContent) {
    if (typeof messageContent === 'string') {
      return messageContent;
    }
    if (Array.isArray(messageContent)) {
      return messageContent
        .filter(item => item.type === 'text')
        .map(item => item.text || '')
        .join(' ');
    }
    if (messageContent.content && Array.isArray(messageContent.content)) {
      return messageContent.content
        .filter(item => item.type === 'text')
        .map(item => item.text || '')
        .join(' ');
    }
    return '';
  }

  /**
   * Extract text content from various message formats (legacy)
   */
  extractText(content) {
    if (typeof content === 'string') {
      return content;
    }
    if (Array.isArray(content)) {
      return content
        .filter(item => item.type === 'text')
        .map(item => item.text || '')
        .join(' ');
    }
    return '';
  }

  /**
   * Sanitize message by removing XML-like tags
   */
  sanitizeMessage(text) {
    if (!text) return '';
    // Remove XML-like tags (e.g., <command-message>, <command-name>)
    let cleaned = text.replace(/<[^>]+>/g, '');
    // Clean up extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return cleaned;
  }

  /**
   * Extract main topic from user message (concise, under 60 chars)
   */
  extractMainTopic(userMessage) {
    if (!userMessage) return null;

    // Clean the message
    let topic = userMessage.trim();

    // Remove common question starters to get to the core
    topic = topic
      .replace(/^(can you|could you|please|would you|I need|I want|help me|how do I|what is|why is|when should)\s+/gi, '')
      .replace(/^(fix|add|update|create|implement|remove|delete|refactor|improve)\s+/gi, (match) => match.trim() + ' ');

    // Take first sentence or clause
    const sentences = topic.split(/[.!?;]/);
    topic = sentences[0].trim();

    // Further truncate at natural break points if needed
    if (topic.length > 60) {
      // Try to break at comma, dash, or preposition
      const breakPoints = [',', ' - ', ' in ', ' for ', ' to ', ' with '];
      for (const bp of breakPoints) {
        const idx = topic.indexOf(bp);
        if (idx > 20 && idx < 60) {
          topic = topic.substring(0, idx);
          break;
        }
      }

      // Hard truncate if still too long
      if (topic.length > 60) {
        topic = topic.substring(0, 57) + '...';
      }
    }

    return topic || null;
  }

  /**
   * Truncate text to max length at word boundary
   */
  truncate(text, maxLength) {
    if (text.length <= maxLength) return text;

    // Find last space before maxLength
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > maxLength * 0.8) {
      // If there's a space in the last 20%, truncate there
      return text.substring(0, lastSpace) + '...';
    }

    // Otherwise, hard truncate
    return truncated + '...';
  }

  /**
   * Generate a brief excerpt showing query context
   */
  generateExcerpt(data, query) {
    const text = JSON.stringify(data);
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index === -1) return '';

    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + query.length + 50);
    const excerpt = text.substring(start, end);

    return '...' + excerpt + '...';
  }

  /**
   * Get context information
   */
  getContextInfo() {
    return {
      sessionDir: this.sessionDir,
      projectRoot: this.projectRoot,
      projectName: this.projectRoot ? path.basename(this.projectRoot) : null,
      mode: this.projectRoot ? 'project' : 'global'
    };
  }

  /**
   * List all sessions in current context
   */
  listSessions(limit = 10) {
    this.ensureDirectories();

    const sessionFiles = fs.readdirSync(this.sessionDir)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse()
      .slice(0, limit);

    return sessionFiles.map(file => {
      try {
        const content = fs.readFileSync(path.join(this.sessionDir, file), 'utf8');
        const data = JSON.parse(content);
        return {
          filename: file,
          timestamp: data.timestamp,
          projectName: data.projectName,
          workingDir: data.workingDir
        };
      } catch (error) {
        return { filename: file, error: error.message };
      }
    });
  }
}

// ============================================================================
// CLI Interface
// ============================================================================

/**
 * Handle save command with stdin support for hooks
 */
function handleSave(manager, arg) {
  // Check if stdin has data (hook mode)
  if (!process.stdin.isTTY) {
    // Read from stdin synchronously (hook mode)
    let hookInput = null;
    let transcriptData = null;

    try {
      // Read all data from stdin synchronously
      const input = fs.readFileSync(0, 'utf-8');

      if (input.trim()) {
        hookInput = JSON.parse(input);

        // Parse transcript if available
        if (hookInput.transcript_path) {
          transcriptData = manager.parseTranscript(hookInput.transcript_path);
        }
      }
    } catch (e) {
      console.error(JSON.stringify({
        error: `Failed to parse hook input: ${e.message}`
      }));
    }

    // Let generateSummary handle creating the summary text
    // Only override if user provided an explicit message
    let summary = arg || null;

    // Build session data
    const sessionData = {
      summary,
      sessionId: hookInput?.session_id || null,
      reason: hookInput?.reason || null,
      messageCount: transcriptData?.messageCount || 0,
      exchanges: transcriptData?.exchanges || [],
      decisions: transcriptData?.decisions || null,
      nextSteps: transcriptData?.nextSteps || null,
      transcript: transcriptData?.fullTranscript || '',
      transcriptPath: hookInput?.transcript_path || null
    };

    const result = manager.saveSession(sessionData);
    console.log(JSON.stringify({
      systemMessage: `✅ Session saved: ${result.filename}`,
      location: result.filepath
    }));
  } else {
    // Manual save (CLI mode)
    const sessionData = {
      summary: arg || 'Session saved via CLI',
      transcript: '',
      metadata: '{}'
    };
    const result = manager.saveSession(sessionData);
    console.log(`✅ Session saved: ${result.filename}`);
    console.log(`📁 Location: ${result.filepath}`);
  }
}

if (require.main === module) {
  const command = process.argv[2];
  const arg = process.argv[3];

  const manager = new SessionManager();

  switch (command) {
    case 'save':
      try {
        handleSave(manager, arg);
      } catch (err) {
        console.error(JSON.stringify({ error: err.message }));
        process.exit(1);
      }
      break;

    case 'history':
      // Combined command: if arg provided, search; otherwise show info + list
      if (arg) {
        // Search mode
        const searchResults = manager.searchSessions(arg);
        console.log(`\n## Search Results for "${arg}"\n`);
        if (searchResults.length === 0) {
          console.log('No matching sessions found.');
        } else {
          console.log(`Found ${searchResults.length} matching session(s):\n`);
          searchResults.forEach((r, i) => {
            console.log(`### ${i + 1}. ${r.filename}`);
            console.log(`**Date:** ${new Date(r.timestamp).toLocaleString()}`);
            if (r.projectName) {
              console.log(`**Project:** ${r.projectName}`);
            }
            console.log(`**Directory:** \`${r.workingDir}\``);
            if (r.excerpt) {
              console.log(`**Match:** ${r.excerpt}`);
            }
            console.log('');
          });
        }
      } else {
        // List mode with context info
        const contextInfo = manager.getContextInfo();
        console.log('\n## Session History\n');
        console.log(`**Mode:** ${contextInfo.mode === 'project' ? '🚀 Project-specific' : '🌍 Global'}`);
        console.log(`**Session Directory:** \`${contextInfo.sessionDir}\``);
        console.log(`**Project Root:** ${contextInfo.projectRoot ? `\`${contextInfo.projectRoot}\`` : 'None (global mode)'}`);
        if (contextInfo.projectName) {
          console.log(`**Project Name:** ${contextInfo.projectName}`);
        }
        console.log('\n### Recent Sessions\n');

        const historySessions = manager.listSessions(10);
        if (historySessions.length === 0) {
          console.log('No sessions found.');
        } else {
          historySessions.forEach((s, i) => {
            console.log(`${i + 1}. ${s.filename}`);
            if (s.timestamp) {
              console.log(`   Date: ${new Date(s.timestamp).toLocaleString()}`);
              if (s.projectName) {
                console.log(`   Project: ${s.projectName}`);
              }
            }
            if (s.error) {
              console.log(`   Error: ${s.error}`);
            }
            console.log('');
          });
        }
      }
      break;

    default:
      console.log(`
Claude Code Memory Management (CCM) v1.0.3

Usage: session-manager.js <command> [args]

Commands:
  save [message]      Save current session with optional message
  history [query]     Browse sessions (no query) or search for specific topics

Examples:
  node session-manager.js save "Completed authentication feature"
  node session-manager.js history
  node session-manager.js history "authentication"

Context Detection:
  CCM automatically detects if you're in a project directory and stores
  sessions accordingly:
  - Project-specific: <project-root>/.claude/sessions/
  - Global: ~/.claude/sessions/

Note:
  Session summary auto-loads on startup via hooks (no manual load command needed)
      `);
  }
}

module.exports = SessionManager;
