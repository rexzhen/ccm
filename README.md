# Claude Code Memory Management (CCM)

![CCM Social Preview](assets/images/social-preview.png)

![Version](https://img.shields.io/badge/version-1.0.3-blue)
![License](https://img.shields.io/badge/license-MIT-green)

Context-aware session management for Claude Code. Automatically save conversations, load summaries on startup, and search past sessions with intelligent project-specific or global context detection.

## Features

- 🔄 **Auto-save**: Sessions automatically saved when you exit Claude Code
- 📋 **Auto-load**: Latest summary displayed at session start
- 🎯 **Context-aware**: Detects project vs global context automatically
- 🔍 **Search**: Search past conversations in current context
- 📁 **Organized**: Clean directory structure per project
- 🚀 **Zero dependencies**: Pure Node.js, no installation required

## How It Works

**Plugin Location (Global):** `~/.claude/plugins/ccm` (installed once, works everywhere)

**Session Storage (Automatic):** CCM detects your working directory and saves sessions accordingly:

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

CCM automatically adapts to your working context:

### 🚀 Project-Specific Mode (Claude Project)
**Activated when:** You're in a directory with a `.claude` folder (anywhere in the parent tree)

When you initialize Claude Code in a directory (via `/init` or manually creating `.claude/`), that becomes a **Claude project**. CCM will store all sessions for that project and its subdirectories in one place.

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

### 🌍 Global Mode
**Activated when:** You're not in a directory with `.claude` anywhere in the parent tree

**Session location:** `~/.claude/sessions/`

**Use for:**
- Quick questions outside projects
- Learning and experimentation
- General non-project work

## Installation

**Important:** The plugin itself installs globally, but it automatically manages sessions per-project or globally based on your working directory.

### Step 1: Clone the Repository

```bash
# Clone to a local directory (anywhere you like)
git clone https://github.com/rexzhen/ccm ~/ccm-plugin
# or
git clone https://github.com/rexzhen/ccm ~/Documents/plugins/ccm
```

### Step 2: Add as a Marketplace

```bash
# Add the plugin as a local marketplace
claude plugin marketplace add ~/ccm-plugin
# or wherever you cloned it
```

### Step 3: Install the Plugin

```bash
# Install ccm from the marketplace
claude plugin install ccm
```

That's it! The plugin is now active. Session storage location is determined automatically:
- **In a project directory:** Sessions saved to `<project>/.claude/sessions/`
- **Outside projects:** Sessions saved to `~/.claude/sessions/`

## Setup

### Basic Setup (Default Mode)

The plugin works out-of-the-box with basic session management:
- ✅ Automatic session saving as JSONL
- ✅ Basic summaries generated from transcript parsing
- ✅ Session history and search

**No additional setup required for basic functionality.**

### Enhanced Setup (AI-Powered Summaries)

For **Claude-powered AI summaries** that are more coherent, deduplicated, and focused on decisions/next steps, you need to configure the Claude CLI:

#### 1. Install Claude CLI

```bash
# Install via npm
npm install -g @anthropic-ai/claude-cli

# Or via homebrew (macOS)
brew install anthropic/tap/claude
```

#### 2. Set Your API Key

```bash
# Add to your shell profile (~/.zshrc, ~/.bashrc, etc.)
export ANTHROPIC_API_KEY="your-api-key-here"

# Or set it temporarily for testing
export ANTHROPIC_API_KEY="sk-ant-..."
```

**Get your API key:** https://console.anthropic.com/settings/keys

#### 3. Verify Setup

```bash
# Test that Claude CLI works
claude --version

# Verify API key is set
echo $ANTHROPIC_API_KEY
```

### What You Get With Enhanced Setup

**Without Claude CLI (Basic Mode):**
- ✅ Sessions saved automatically
- ✅ Basic summaries from transcript parsing
- ✅ Search and history

**With Claude CLI (Enhanced Mode):**
- ✅ All basic features
- ✨ **AI-powered summaries** - coherent, deduplicated, focused
- ✨ **Intelligent merging** - combines previous summary with new session
- ✨ **Better insights** - highlights key decisions and next steps
- ✨ **Higher quality** - natural language summaries instead of parsed text

**Note:** If Claude CLI or API key is not configured, the plugin will display a warning message and fall back to basic mode. Session saving still works normally.

### Verification

```bash
# List installed plugins
claude plugin list

# You should see ccm in the list
```

### Testing Transcript Capture

To verify that the plugin correctly captures conversation transcripts:

```bash
cd ~/.claude/plugins/ccm  # or wherever you cloned the plugin
./test-transcript-capture.sh
```

This test script will:
- Create a mock conversation transcript
- Simulate a SessionEnd hook
- Verify that the transcript is captured and processed
- Display the generated summary with conversation highlights

All tests should pass with ✓ marks.

### Alternative: GitHub Marketplace (Coming Soon)

Once published to a public marketplace, users will be able to install with a single command:

```bash
# Future: Direct installation from GitHub
claude plugin marketplace add rexzhen/ccm
claude plugin install ccm
```

## How Sessions Are Captured

CCM automatically captures your conversation transcripts using Claude Code's SessionEnd hook system:

1. **During Session**: Claude Code maintains a full transcript of your conversation in a JSONL file
2. **When You Exit**: The SessionEnd hook triggers, passing the transcript file path to CCM
3. **Transcript Processing**: CCM reads and parses the JSONL transcript to extract:
   - Conversation exchanges (first 3 for summary preview)
   - Files mentioned or modified
   - Message count and metadata
4. **Storage**: Full transcript and summary saved to context-aware location

**No user configuration required** - this works automatically with zero setup beyond plugin installation.

## Usage

### Automatic Operation (Recommended)

CCM works automatically without commands:

1. **Session Start**: Summary from last session automatically appears with conversation highlights
2. **During Work**: Continue conversation normally - transcript is captured automatically
3. **Session End**: Full session with transcript automatically saved when you exit

### Manual Commands

#### Browse Session History
```bash
/ccm-history
```
Browse recent sessions with context info (mode, directory, project details).

#### Search Sessions
```bash
/ccm-history "authentication"
/ccm-history "bug fix"
```
Search past sessions in current context for specific topics.

#### Manual Save
```bash
/ccm-save
/ccm-save "Completed authentication feature"
```
Manually save session with optional custom message.

## How Plugin vs Session Storage Works

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

## Examples

### Scenario 1: Multiple Projects

```bash
# Working on Project A
cd ~/projects/project-a
claude
# 📁 Sessions: ~/projects/project-a/.claude/sessions/
# Shows: Last conversation about Project A

# Switch to Project B
cd ~/projects/project-b
claude
# 📁 Sessions: ~/projects/project-b/.claude/sessions/
# Shows: Last conversation about Project B

# Quick question outside projects
cd ~
claude
# 🌍 Sessions: ~/.claude/sessions/
# Shows: Last global conversation
```

### Scenario 2: Browse and Search

```bash
# Browse recent sessions with context info
/ccm-history

# Output:
## Session History
**Mode:** 🚀 Project-specific
**Session Directory:** `/Users/you/projects/api/.claude/sessions`
**Project Root:** `/Users/you/projects/api`
**Project Name:** api

### Recent Sessions
1. 2026-01-31T14-30-22-000Z.json
   Date: 1/31/2026, 2:30:22 PM
   Project: api
...

# Search in project-a
/ccm-history "database migration"
# Searches only project-a sessions

# Switch to project-b
cd ~/projects/project-b
/ccm-history "database migration"
# Searches only project-b sessions (different results!)
```

## Directory Structure

### Project-Specific Sessions
```
your-project/
├── .claude/
│   └── sessions/
│       ├── 2026-01-31T14-30-22-000Z.json
│       ├── 2026-01-30T09-15-34-000Z.json
│       ├── summaries/
│       │   ├── latest.md
│       │   ├── 2026-01-31.md
│       │   └── 2026-01-30.md
│       └── archives/
└── .gitignore  # Add .claude/sessions/ here
```

### Global Sessions
```
~/.claude/
└── sessions/
    ├── 2026-01-31T14-30-22-000Z.json
    ├── summaries/
    │   └── latest.md
    └── archives/
```

## Configuration

### .gitignore Setup

**Keep sessions private (recommended):**
```gitignore
# In project root .gitignore
.claude/sessions/
```

**Share summaries with team (optional):**
```gitignore
# Keep full sessions private
.claude/sessions/*.json

# Allow summaries to be committed
!.claude/sessions/summaries/
```

### Customize Hooks

Edit `hooks/hooks.json` to customize auto-save behavior:

```json
{
  "hooks": {
    "SessionEnd": [
      {
        "type": "command",
        "command": "node ${PLUGIN_DIR}/scripts/session-manager.js save"
      }
    ]
  }
}
```

### Direct Script Usage

You can also use the session manager directly:

```bash
# Save session manually
node ~/.claude/plugins/ccm/scripts/session-manager.js save "Custom message"

# Browse sessions with context info
node ~/.claude/plugins/ccm/scripts/session-manager.js history

# Search sessions
node ~/.claude/plugins/ccm/scripts/session-manager.js history "query"
```

Note: Session summary auto-loads on startup via hooks, so no manual load command is needed.

## Requirements

- **Node.js**: 14.0.0 or higher (usually pre-installed on developer machines)
- **Claude Code**: Latest version with plugin support
- **Operating System**: macOS, Linux, or Windows

## Plugin Structure

```
ccm/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── skills/
│   ├── ccm-save/            # Manual save skill
│   └── ccm-history/         # Browse and search sessions skill
├── hooks/
│   └── hooks.json           # Auto-save/load on session start/end
├── scripts/
│   └── session-manager.js   # Core session management logic
├── package.json
└── README.md
```

## Troubleshooting

### Sessions Not Auto-Loading

Check that hooks are working:
```bash
/ccm-history
```

### Sessions Saving to Wrong Location

Verify project detection:
```bash
/ccm-history
```

If you want project-specific sessions but CCM is using global mode:
- Create a `.claude` directory in your project root (or run `/init`) to mark it as a Claude project
- CCM only uses the `.claude` directory to detect Claude projects, not software project markers like `.git` or `package.json`

### Search Not Finding Sessions

Remember: Search is context-aware and only searches current context (project or global).

### Permission Errors

Ensure directories are writable:
```bash
chmod -R u+w ~/.claude/sessions
# or for project
chmod -R u+w ./.claude/sessions
```

## Advanced Usage

### Custom Session Data

You can extend session data by modifying `session-manager.js`:

```javascript
const sessionData = {
  summary: 'Custom summary',
  filesModified: ['src/app.js', 'test/app.test.js'],
  topics: ['authentication', 'testing'],
  // Add your custom fields
};
manager.saveSession(sessionData);
```

### Multi-Profile Support

Set environment variable for different profiles:

```bash
# Use different profiles for different types of work
CCM_PROFILE=experimental claude
CCM_PROFILE=production claude
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details

## Author

Rex Zhen

## Changelog

### v1.0.3 (2026-02-01)
- Fresh start version with clean, simplified command structure
- Two main commands: `/ccm-save` and `/ccm-history`
- Automatic session save/load via hooks
- Context-aware project-specific or global session management
- Full conversation transcript capture and summarization

## Support

- Issues: https://github.com/rexzhen/ccm/issues
- Documentation: https://github.com/rexzhen/ccm/wiki

## Acknowledgments

- Built for [Claude Code](https://claude.ai/code)
- Inspired by the need for better conversation continuity across sessions
