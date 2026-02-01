# CCM Quick Reference Cheatsheet

## Installation

```bash
git clone https://github.com/rexzhen/ccm ~/.claude/plugins/ccm
```

## Commands

| Command | Description |
|---------|-------------|
| `/ccm-info` | Show current context (project/global) |
| `/ccm-save [message]` | Save session manually |
| `/ccm-search <query>` | Search past sessions |
| `/ccm-list [limit]` | List recent sessions (default 10) |

## Direct Script Usage

```bash
# Show context info
node scripts/session-manager.js info

# Load latest summary
node scripts/session-manager.js load

# Save session
node scripts/session-manager.js save "Message"

# Search sessions
node scripts/session-manager.js search "query"

# List sessions
node scripts/session-manager.js list [limit]
```

## Session Locations

```
Project mode:  <project-root>/.claude/sessions/
Global mode:   ~/.claude/sessions/
```

## How Context Detection Works

1. Checks for `.claude` directory in project
2. Checks for project markers (`.git`, `package.json`, etc.)
3. Falls back to global `~/.claude/sessions/`

## Project Markers

- `.git` (Git repository)
- `package.json` (Node.js)
- `pyproject.toml` (Python)
- `Cargo.toml` (Rust)
- `go.mod` (Go)
- `pom.xml` (Java)
- `Gemfile` (Ruby)
- `composer.json` (PHP)

## Session Structure

```
.claude/sessions/
├── 2026-01-31T14-30-22-000Z.json    # Full session
├── 2026-01-30T09-15-34-000Z.json
├── summaries/
│   ├── latest.md                     # Latest summary
│   ├── 2026-01-31.md                # Dated summaries
│   └── 2026-01-30.md
└── archives/                         # For manual archiving
```

## .gitignore Configurations

### Keep Everything Private (Recommended)
```gitignore
.claude/sessions/
```

### Share Summaries with Team
```gitignore
# Keep sessions private
.claude/sessions/*.json

# Allow summaries
!.claude/sessions/summaries/
```

## Common Workflows

### Check Context
```bash
/ccm-info
```

### Save Important Milestone
```bash
/ccm-save "Completed authentication feature"
```

### Find Previous Work
```bash
/ccm-search "authentication"
```

### Review Recent Sessions
```bash
/ccm-list 5
```

## Automatic Behavior

- **Session Start**: Summary auto-loads
- **Session End**: Session auto-saves
- **Context**: Auto-detects project vs global

## Troubleshooting

### Sessions in Wrong Location?
```bash
/ccm-info  # Check current mode
```

### Can't Find Previous Session?
```bash
/ccm-info  # Verify context
# Navigate to correct directory
cd ~/work/my-project
/ccm-search "query"
```

### Want Project-Specific but Getting Global?
```bash
# Create .claude directory
mkdir -p .claude/sessions
/ccm-info  # Should now show project mode
```

## File Permissions

```bash
chmod +x scripts/session-manager.js
```

## Environment Variables (Optional)

```bash
CCM_PROFILE=experimental  # Use different profile
```

## Testing

```bash
cd /path/to/ccm
node scripts/session-manager.js info
node scripts/session-manager.js save "Test"
node scripts/session-manager.js load
```

## GitHub Setup

```bash
git init
git add .
git commit -m "Initial commit: CCM v1.0.0"
gh repo create claude-code-memory-management --public --source=. --push
git tag -a v1.0.0 -m "v1.0.0"
git push origin v1.0.0
```

## Development

```bash
# Test locally with Claude Code
claude --plugin-dir /path/to/ccm

# Try commands
/ccm-info
/ccm-save "Test"
/ccm-list
```

## Support

- Issues: `https://github.com/rexzhen/ccm/issues`
- Docs: `README.md`, `EXAMPLES.md`, `QUICKSTART.md`

## Version

Current: **v1.0.0**

---

**Quick Memory Aid:**
- `info` = where am I?
- `save` = checkpoint now
- `search` = find past work
- `list` = recent history

**Pro Tip:** Let it work automatically! Manual commands are only needed occasionally.
