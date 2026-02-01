# Quick Start Guide

Get up and running with CCM in 5 minutes!

## 1. Test the Plugin Locally

```bash
cd <ccm-plugin-directory>

# Test the core script
node scripts/session-manager.js info
```

Expected output:
```
## Current Session Context

**Mode:** 🚀 Project-specific (or 🌍 Global)
**Session Directory:** `...`
...
```

## 2. Test All Commands

```bash
# Show help
node scripts/session-manager.js

# Test load (will show "no previous session" if first time)
node scripts/session-manager.js load

# Test save
node scripts/session-manager.js save "First test"

# Test load again (should now show a summary)
node scripts/session-manager.js load

# Test search
node scripts/session-manager.js search "test"

# Test list
node scripts/session-manager.js list
```

## 3. Use with Claude Code

### Option A: Test in This Directory

```bash
# Run Claude Code with this plugin
cd <ccm-plugin-directory>
claude --plugin-dir .

# Try the commands:
/ccm-info
/ccm-save "Testing CCM"
/ccm-list
```

### Option B: Install Globally

```bash
# Link to global plugins directory
mkdir -p ~/.claude/plugins
ln -s <ccm-plugin-directory> ~/.claude/plugins/ccm

# Now it works from anywhere
cd ~
claude
/ccm-info
```

## 4. Create GitHub Repository

```bash
cd <ccm-plugin-directory>

# Initialize git
git init
git add .
git commit -m "Initial commit: CCM plugin v1.0.0"

# Create repo on GitHub (via gh CLI or web)
gh repo create claude-code-memory-management --public --source=. --remote=origin

# Or manually:
# 1. Create repo on github.com
# 2. git remote add origin https://github.com/rexzhen/ccm.git

# Push
git push -u origin main
```

## 5. Share with Others

Once pushed to GitHub, others can install with:

```bash
git clone https://github.com/rexzhen/ccm ~/.claude/plugins/ccm
```

## Troubleshooting

### "command not found: node"
Install Node.js from https://nodejs.org

### "Permission denied"
Run: `chmod +x scripts/session-manager.js`

### Sessions not auto-loading
Check if the skill is loaded: `/ccm-info`

### Want project-specific sessions but getting global
Ensure you're in a git repository or have a `.claude` directory

## Next Steps

- Read [README.md](README.md) for full documentation
- Check [CONTRIBUTING.md](CONTRIBUTING.md) if you want to enhance CCM
- Test in multiple projects to see context-aware switching
- Customize hooks in `hooks/hooks.json` for your workflow

## Quick Reference

| Command | Description |
|---------|-------------|
| `/ccm-info` | Show current context |
| `/ccm-save [msg]` | Save session manually |
| `/ccm-search <query>` | Search sessions |
| `/ccm-list [limit]` | List recent sessions |
| `node scripts/session-manager.js <cmd>` | Direct script usage |

Enjoy your persistent Claude Code sessions! 🚀
