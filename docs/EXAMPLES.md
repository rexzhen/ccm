# Usage Examples

## Scenario 1: First Time in a New Directory

```bash
# Day 1: First session in new project
cd ~/new-project
claude
# No .claude folder yet
# 💾 Sessions save to: ~/.claude/sessions/ (global)
# Ask Claude some questions, exit

# Day 2: Claude creates .claude folder (via /init or automatically)
cd ~/new-project
claude
# ✅ .claude folder now exists!
# 💾 Sessions now save to: ~/new-project/.claude/sessions/ (project-specific)
# Previous day's session still in ~/.claude/sessions/
```

This transition is automatic and seamless. Each location has its own 500 MB storage limit.

## Scenario 2: Multiple Projects

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

## Scenario 3: Browse and Search

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

## Scenario 4: Manual Save with Custom Message

```bash
# During your session, save with a custom note
/ccm-save "Completed user authentication feature with JWT"

# Session saved immediately with your message
# Useful for marking important milestones
```

## Scenario 5: Storage Management

```bash
# CCM automatically manages storage (default: 500 MB per context)

# After many sessions, storage reaches 500 MB
# Exit Claude Code → SessionEnd hook triggers
# Automatic cleanup runs:
#   - Deletes oldest sessions
#   - Keeps storage under 450 MB (90% of limit)
#   - Preserves latest.md summary

# Next session starts with cleaned storage
# Zero user intervention required!
```

## Scenario 6: Custom Storage Limit

```bash
# Edit plugin config for more/less storage
# Location: ~/.claude/plugins/ccm/.claude-plugin/config.json

# Example: Increase to 1 GB for large projects
{
  "maxStorageMB": 1000,
  "cleanupEnabled": true
}

# Example: Decrease to 100 MB for quick projects
{
  "maxStorageMB": 100,
  "cleanupEnabled": true
}
```

## Scenario 7: Working in Subdirectories

```bash
# Project structure:
# ~/my-app/.claude/
# ~/my-app/frontend/
# ~/my-app/backend/

# Work in frontend
cd ~/my-app/frontend
claude
# 💾 Sessions: ~/my-app/.claude/sessions/

# Work in backend
cd ~/my-app/backend
claude
# 💾 Sessions: ~/my-app/.claude/sessions/ (same location!)

# All subdirectories share project sessions
# Maintains context across the entire project
```

## Scenario 8: Team Collaboration

```bash
# Keep sessions private (recommended)
# Add to .gitignore:
.claude/sessions/

# Or share summaries with team
# Add to .gitignore:
.claude/sessions/*.json
.claude/sessions/*.jsonl

# Don't ignore summaries:
!.claude/sessions/summaries/

# Team members can see session summaries
# But full transcripts remain private
```

## Scenario 9: Quick Questions Outside Projects

```bash
# You're at home directory
cd ~
claude

# Ask quick question: "What's the difference between Map and Set in JavaScript?"
# Exit

# Session saved to: ~/.claude/sessions/
# Doesn't clutter any project's session history
# Global sessions have their own 500 MB limit
```

## Scenario 10: Migrating from Global to Project Sessions

```bash
# You've been using global sessions
# Now want to start a project

cd ~/new-project
claude
# Currently using: ~/.claude/sessions/ (no .claude yet)

# Initialize as Claude project
/init

# Now using: ~/new-project/.claude/sessions/
# New sessions save to project
# Old global sessions remain in ~/.claude/sessions/

# If you want to migrate old sessions (optional):
cp ~/.claude/sessions/*.jsonl ~/new-project/.claude/sessions/
cp -r ~/.claude/sessions/summaries ~/new-project/.claude/sessions/
```

## Advanced: Direct Script Usage

```bash
# Save session manually via script
node ~/.claude/plugins/ccm/scripts/session-manager.js save "Custom message"

# Browse sessions with context info
node ~/.claude/plugins/ccm/scripts/session-manager.js history

# Search sessions
node ~/.claude/plugins/ccm/scripts/session-manager.js history "query"
```

---

**Back to:** [README](../README.md) | **See also:** [FAQ](FAQ.md) | [How It Works](HOW-IT-WORKS.md)
