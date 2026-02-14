# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CCM (Claude Code Memory Management) is a plugin for Claude Code that provides automatic session persistence and context-aware memory management. It automatically saves conversation transcripts when sessions end and loads summaries when sessions start, providing continuity across sessions.

**Core concept:** One plugin installation with dual-context storage - sessions are stored either in project-specific locations (`<project>/.claude/sessions/`) or in a global location (`~/.claude/sessions/`) based on automatic detection.

## Commands

### Testing & Development
```bash
# Run basic info test (configured in package.json)
npm test

# Manual session testing
node scripts/session-manager.js save "test message"
node scripts/session-manager.js history
node scripts/session-manager.js history "search query"

# Test hooks manually
node scripts/check-sessions.js              # SessionStart hook
bash scripts/save-session.sh                # SessionEnd hook
```

### User-Facing Commands
When installed as a plugin, users interact via:
```bash
/ccm-save "optional message"     # Manual save
/ccm-history                      # Browse recent sessions
/ccm-history "search term"        # Search sessions
```

## Architecture

### Hook System (Critical)
The plugin operates primarily through automatic hooks configured in `.claude-plugin/hooks.json`:

1. **SessionStart Hook** (`scripts/check-sessions.js`)
   - Runs automatically when Claude Code starts
   - Loads the most recent session summary from `summaries/latest.md`
   - Outputs summary to `<system-reminder>` tag for Claude to display
   - **Critical behavior:** Claude MUST automatically display this summary to the user in the first response without being asked (see `.claude-plugin/instructions.md`)

2. **SessionEnd Hook** (`scripts/save-session.sh`)
   - Runs automatically when Claude Code exits **during shutdown sequence, before final termination**
   - **Timeout: 300 seconds (5 minutes)** - Hook will be forcefully killed if it exceeds this
   - Individual Claude API calls have 60-second timeout to prevent hanging
   - Receives transcript path via stdin as JSON: `{"transcript_path": "/path/to/transcript.jsonl", "session_id": "...", "reason": "..."}`
   - Calls `session-manager.js save` to process and save the transcript
   - **AI-Powered Summaries:** If Claude CLI is available with API credentials, generates intelligent summaries using Claude API
   - Falls back to pattern-based summaries if CLI/credentials not configured
   - Supports both Anthropic API (direct) and AWS Bedrock authentication
   - Triggers automatic storage cleanup if enabled
   - **Important:** Hook runs as a child process of Claude Code. If the main process terminates unexpectedly, the hook may be interrupted.

### Context Detection Logic
The `SessionManager` class (`scripts/session-manager.js`) determines storage location:

1. **findProjectRoot()**: Walks up directory tree looking for `.claude` folder
2. **determineSessionDir()**:
   - If `.claude` found → project mode: `<project-root>/.claude/sessions/`
   - Otherwise → global mode: `~/.claude/sessions/`
3. This detection runs on every command, so sessions automatically migrate when `.claude` is created

### Session Processing Flow
When a session ends:

**Phase 1: Basic Processing (session-manager.js)**
1. Hook receives JSONL transcript file path via stdin
2. `parseTranscript()` reads and parses the JSONL file (one JSON object per line)
3. `summarizeTranscript()` extracts:
   - First exchange (user question + assistant response)
   - Message count
   - Key decisions (pattern matching)
   - Next steps / action items (pattern matching)
4. `saveSession()` creates timestamped `.jsonl` file with metadata
5. `saveSummary()` generates both `latest.md` and dated summary in `summaries/`

**Phase 2: AI Enhancement (save-session.sh, optional)**
1. Detects API configuration:
   - Checks for Anthropic API key (`ANTHROPIC_API_KEY`)
   - Checks for AWS Bedrock credentials (`AWS_REGION` + `AWS_ACCESS_KEY_ID`/`AWS_PROFILE`)
2. If Claude CLI available + credentials configured:
   - Reads previous summary and new transcript
   - Calls Claude API to generate intelligent summary
   - Overwrites `latest.md` and dated summary with AI-generated content
   - Updates session file with `enhancedSummary` field
3. If not available: Uses pattern-based summary from Phase 1

**Phase 3: Cleanup**
- `cleanupOldSessions()` removes oldest sessions if storage exceeds limit

### Storage Management
- **Default limit:** 500 MB per context (configurable in `.claude-plugin/config.json`)
- **Cleanup strategy:** Delete oldest session files first, keep last 30 dated summaries, always preserve `latest.md`
- **Independent contexts:** Each project and global storage has its own 500 MB limit
- Runs automatically on `SessionEnd` if `cleanupEnabled: true`

## File Structure

```
.claude-plugin/         Plugin manifest and configuration
├── plugin.json         Plugin metadata (name, version, author)
├── hooks.json          SessionStart and SessionEnd hook definitions
├── config.json         Storage limits and cleanup settings
└── instructions.md     Critical: Instructions for Claude to auto-display summaries

scripts/                Core session management logic
├── session-manager.js  Main SessionManager class (all logic)
├── check-sessions.js   SessionStart hook handler (loads summary)
└── save-session.sh     SessionEnd hook wrapper (bash → node)

skills/                 User-invocable commands
├── ccm-save/           Manual save skill (/ccm-save)
└── ccm-history/        Browse/search skill (/ccm-history)
```

## Key Implementation Details

### Transcript Format
Claude Code provides transcripts as JSONL files where each line is a JSON object:
```json
{"type": "user", "message": {"role": "user", "content": "..."}}
{"type": "assistant", "message": {"role": "assistant", "content": [{"type": "text", "text": "..."}]}}
```

### Message Content Handling
- User messages: Simple string in `message.content`
- Assistant messages: Array of content blocks (text, tool_use, etc.)
- `extractAssistantText()` filters for `type: 'text'` blocks
- `sanitizeMessage()` removes XML-like tags (e.g., `<command-message>`) from summaries

### Pattern-Based Extraction
The code uses regex patterns to extract:
- **Next steps:** `/(?:next|we'll|let's|going to)/gi`
- **Decisions:** `/(?:decided|agreed|chose|will use)/gi`
- **Topics:** Extracted from first user message via `extractMainTopic()`

### Storage File Naming
- Sessions: `YYYY-MM-DDTHH-MM-SS-MMMZ.jsonl` (ISO timestamp, colons replaced with hyphens)
- Summaries: `latest.md` (current) and `YYYY-MM-DD.md` (dated)

## Key Implementation Guidelines

When working on this codebase:

1. **Context detection is the core feature** - maintain the `findProjectRoot()` → `determineSessionDir()` logic carefully
2. **Preserve the JSONL format** - both input transcripts and output session files use newline-delimited JSON
3. **Pattern extraction is fragile** - changes to `summarizeTranscript()` patterns affect summary quality
4. **Storage cleanup is destructive** - test `cleanupOldSessions()` changes carefully as it deletes files
5. **Test hooks manually** before assuming they work - hooks are called by Claude Code, not by user actions
