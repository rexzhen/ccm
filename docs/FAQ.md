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

---

**More Questions?** [Open an issue](https://github.com/rexzhen/ccm/issues)
