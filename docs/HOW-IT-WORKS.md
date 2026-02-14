# How CCM Works

## Architecture Overview

```
Plugin (global):           ~/.claude/plugins/ccm/
                                    |
                                    v
                          [Automatic Detection]
                                    |
                    +---------------+---------------+
                    |                               |
            In a project?                    Outside projects?
                    |                               |
                    v                               v
        <project>/.claude/sessions/        ~/.claude/sessions/
        (project-specific)                   (global)
```

## Session Storage Behavior

CCM uses smart detection that adapts as your project evolves:

### First Session in a New Folder

**Status:** No `.claude` directory exists yet

**Behavior:**
- Sessions temporarily save to `~/.claude/sessions/` (global fallback)
- This is normal for first-time use in a directory
- Plugin works immediately without any setup

### After Claude Creates `.claude` Folder

**Status:** `.claude` folder created (via `/init` or automatically)

**Behavior:**
- CCM detects the `.claude` folder and switches to project mode
- All new sessions save to `<project>/.claude/sessions/`
- Previous global sessions remain in `~/.claude/sessions/` (not migrated)

### Why This Design?

- **Flexible**: Works immediately without setup
- **Automatic**: Seamlessly transitions when `.claude` appears
- **No data loss**: Global sessions preserved separately
- **Independent contexts**: Each project has its own session history and storage limit

## Project-Specific Mode

**Activated when:** You're in a directory with a `.claude` folder (anywhere in the parent tree)

When you initialize Claude Code in a directory (via `/init` or when Claude creates `.claude/`), that becomes a **Claude project**. CCM will store all sessions for that project and its subdirectories in one place.

**Session location:** `<claude-project-root>/.claude/sessions/`

**Key behavior:**
- All subdirectories within a Claude project share the same session storage
- Example: If `/Users/you/Documents/.claude/` exists, all work in Documents or its subdirectories (like `Documents/workspace/project-a/`) will save sessions to `/Users/you/Documents/.claude/sessions/`
- This aligns with Claude Code's concept of a "project" - any directory where you've initialized Claude

**Use for:**
- Dedicated Claude project work
- Maintaining separate context per project
- Sharing session context across related subdirectories
- Team collaboration (optional sharing via git)

## Global Mode

**Activated when:** You're not in a directory with `.claude` anywhere in the parent tree

**Session location:** `~/.claude/sessions/`

**Use for:**
- Quick questions outside projects
- Learning and experimentation
- General non-project work
- First-time use before `.claude` is created

## How Sessions Are Captured

CCM automatically captures your conversation transcripts using Claude Code's SessionEnd hook system:

1. **During Session**: Claude Code maintains a full transcript of your conversation in a JSONL file
2. **When You Exit**: The SessionEnd hook triggers, passing the transcript file path to CCM
3. **Transcript Processing**: CCM reads and parses the JSONL transcript to extract:
   - Conversation exchanges (first 3 for summary preview)
   - Files mentioned or modified
   - Message count and metadata
4. **Storage**: Full transcript and summary saved to context-aware location
5. **Cleanup**: Automatic storage management runs to keep size under limit

**No user configuration required** - this works automatically with zero setup beyond plugin installation.

## Storage Management

### How It Works

1. **Automatic cleanup**: Runs after every session save (when you exit Claude Code)
2. **Size check**: Calculates total storage used by sessions
3. **Smart deletion**: If over limit, deletes oldest sessions first
4. **Stops at 90%**: Cleanup stops when storage is at 90% of limit
5. **Preserves summaries**: Latest summary is always kept
6. **Zero maintenance**: Completely automatic - no manual cleanup needed

### Configuration

Edit `.claude-plugin/config.json` in the plugin directory:

```json
{
  "maxStorageMB": 500,
  "cleanupEnabled": true,
  "preserveLatestSummary": true
}
```

**Settings:**
- `maxStorageMB`: Maximum storage in MB (default: 500)
- `cleanupEnabled`: Enable auto-cleanup (default: true)
- `preserveLatestSummary`: Always preserve latest.md (default: true)

**Examples:**
```json
// Conservative: 100 MB limit
{"maxStorageMB": 100, "cleanupEnabled": true}

// Generous: 1 GB limit
{"maxStorageMB": 1000, "cleanupEnabled": true}

// Disable auto-cleanup (not recommended)
{"maxStorageMB": 500, "cleanupEnabled": false}
```

### What Gets Cleaned

- **Session files**: Oldest *.json and *.jsonl files deleted first
- **Dated summaries**: Only last 30 dated summaries kept
- **Always preserved**: latest.md summary file

### Context-Aware Limits

Each context (project or global) has its own independent storage limit:
- Project A: 500 MB limit
- Project B: 500 MB limit
- Global: 500 MB limit

All managed separately.

## Plugin vs Session Storage

### Plugin Installation (One-Time, Global):
```bash
# Install plugin once
git clone https://github.com/rexzhen/ccm ~/.claude/plugins/ccm

# Now CCM is available in ALL Claude Code sessions
```

### Session Storage (Automatic Per Context):
```bash
# Working on Project A
cd ~/projects/project-a
claude
# Plugin loaded from: ~/.claude/plugins/ccm/
# Sessions saved to:   ~/projects/project-a/.claude/sessions/

# Working on Project B
cd ~/projects/project-b
claude
# Plugin loaded from: ~/.claude/plugins/ccm/ (same plugin)
# Sessions saved to:   ~/projects/project-b/.claude/sessions/ (different location!)

# Quick question (not in a project)
cd ~
claude
# Plugin loaded from: ~/.claude/plugins/ccm/ (same plugin)
# Sessions saved to:   ~/.claude/sessions/ (global location)
```

**Key Point:** One plugin installation, automatic context detection!

## Plugin Structure

```
ccm/
├── .claude-plugin/
│   ├── config.json          # Storage configuration
│   ├── hooks.json           # Auto-save/load hooks
│   └── plugin.json          # Plugin manifest
├── skills/
│   ├── ccm-save/            # Manual save skill
│   └── ccm-history/         # Browse and search sessions skill
├── scripts/
│   ├── session-manager.js   # Core session management logic
│   ├── check-sessions.js    # SessionStart hook handler
│   └── save-session.sh      # SessionEnd hook handler
├── docs/
│   ├── FAQ.md               # Frequently asked questions
│   ├── HOW-IT-WORKS.md      # This file
│   └── EXAMPLES.md          # Usage examples
├── package.json
└── README.md
```

---

**Back to:** [README](../README.md) | **See also:** [FAQ](FAQ.md) | [Examples](EXAMPLES.md)
