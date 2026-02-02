# Frequently Asked Questions

## Session Storage

### Why are my sessions in ~/.claude/sessions/ instead of my project?

This happens on your first session in a new directory before the `.claude` folder is created. Once Claude Code creates the `.claude` folder (automatically or via `/init`), new sessions will save to your project directory. The global sessions remain in `~/.claude/sessions/` and won't be migrated automatically.

### Do global and project sessions share the same storage limit?

No. Each context has its own independent 500 MB storage limit:
- Global sessions: `~/.claude/sessions/` (500 MB)
- Project A: `~/project-a/.claude/sessions/` (500 MB)
- Project B: `~/project-b/.claude/sessions/` (500 MB)

They are managed separately and won't affect each other.

### What happens to my old sessions when cleanup runs?

When storage exceeds 500 MB, the oldest session files are automatically deleted (oldest first). The latest summary (`latest.md`) is always preserved. Cleanup runs automatically when you exit Claude Code, so you never need to manually manage storage.

### Can I change the storage limit?

Yes. Edit `.claude-plugin/config.json` in the plugin directory:
```json
{
  "maxStorageMB": 1000,  // Set to 1 GB
  "cleanupEnabled": true
}
```

### Will sessions be shared across subdirectories?

Yes, if they're in the same Claude project. CCM searches up the directory tree for `.claude` folder. All subdirectories within that project share the same session storage at `<project-root>/.claude/sessions/`.

Example:
```
~/my-project/.claude/          ← Project root
~/my-project/frontend/         ← Shares sessions with parent
~/my-project/backend/          ← Shares sessions with parent
```

### How do I clean up old global sessions?

If you've accumulated sessions in `~/.claude/sessions/` before projects had `.claude` folders, you can:
1. Manually delete them: `rm -rf ~/.claude/sessions/*` (keeps directory)
2. Let automatic cleanup handle it over time (it also applies to global sessions)

## Installation & Setup

### Do I need to install this plugin in every project?

No! The plugin is installed globally once in `~/.claude/plugins/`. It automatically detects and adapts to each project's context.

### Can I use this without Claude CLI?

Yes. The plugin works perfectly without Claude CLI. Claude CLI is only needed for AI-powered summaries (enhanced mode). Without it, you still get:
- Automatic session saving
- Basic summaries from transcript parsing
- Search and history functionality

### How do I update the plugin?

```bash
# Pull latest changes
cd ~/ccm-plugin  # wherever you cloned it
git pull

# Reinstall
claude plugin uninstall ccm
claude plugin install ccm
```

## Troubleshooting

### Sessions Not Auto-Loading

Check that hooks are working:
```bash
/ccm-history
```

If no sessions appear, verify the plugin is installed:
```bash
claude plugin list
```

### Sessions Saving to Wrong Location

Verify project detection:
```bash
/ccm-history
```

The output shows your current mode (project vs global) and session directory.

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

### Storage Cleanup Not Working

Check that cleanup is enabled in config:
```bash
cat ~/.claude/plugins/ccm/.claude-plugin/config.json
```

Should show:
```json
{
  "cleanupEnabled": true,
  "maxStorageMB": 500
}
```

## Uninstallation

### How do I uninstall the CCM plugin?

```bash
# Uninstall the plugin
claude plugin uninstall ccm

# Remove the marketplace (optional)
claude plugin marketplace remove ccm-marketplace
```

The plugin is now uninstalled. However, your session history remains on disk.

### How do I remove all session history?

After uninstalling, if you want to remove all saved sessions:

**Remove global sessions:**
```bash
# Remove all global sessions
rm -rf ~/.claude/sessions/

# Or keep the directory structure but remove files
rm -rf ~/.claude/sessions/*
```

**Remove project-specific sessions:**
```bash
# In each project directory
rm -rf .claude/sessions/

# Or find and remove all project sessions
find ~/projects -type d -name "sessions" -path "*/.claude/sessions" -exec rm -rf {} +
```

**⚠️ Warning:** This permanently deletes all conversation history. There is no undo.

### Can I keep sessions but disable the plugin temporarily?

Yes, uninstalling the plugin doesn't delete sessions. You can:

```bash
# Uninstall plugin
claude plugin uninstall ccm

# Sessions remain in:
# - ~/.claude/sessions/ (global)
# - <project>/.claude/sessions/ (projects)

# Reinstall later to restore functionality
claude plugin install ccm
```

Your sessions will still be there and the plugin will pick up where it left off.

### How do I export my sessions before uninstalling?

```bash
# Backup global sessions
cp -r ~/.claude/sessions/ ~/ccm-backup-$(date +%Y%m%d)/

# Backup specific project sessions
cp -r ~/my-project/.claude/sessions/ ~/ccm-project-backup-$(date +%Y%m%d)/

# Create a compressed archive
tar -czf ccm-sessions-backup-$(date +%Y%m%d).tar.gz ~/.claude/sessions/
```

### What files does CCM create?

**Plugin files** (removed by uninstall):
- `~/.claude/plugins/ccm/` - Plugin code and scripts

**Session files** (NOT removed by uninstall):
- `~/.claude/sessions/` - Global session history
- `<project>/.claude/sessions/` - Project-specific session history

**Config files** (removed by uninstall):
- Stored within plugin directory, removed with plugin

### Clean uninstall checklist

For a complete removal:

```bash
# 1. Uninstall plugin
claude plugin uninstall ccm

# 2. Remove marketplace
claude plugin marketplace remove ccm-marketplace

# 3. Remove global sessions
rm -rf ~/.claude/sessions/

# 4. Remove project sessions (review first!)
find ~ -type d -name "sessions" -path "*/.claude/sessions" 2>/dev/null

# 5. Remove from .gitignore (if you added it)
# Edit .gitignore and remove: .claude/sessions/

# 6. Remove source clone (if you cloned locally)
rm -rf ~/ccm-plugin  # or wherever you cloned it
```

---

**More Questions?** [Open an issue](https://github.com/rexzhen/ccm/issues)
