# CCM Usage Examples

Real-world examples of how to use Claude Code Memory Management.

## Table of Contents
- [Basic Usage](#basic-usage)
- [Project-Specific Sessions](#project-specific-sessions)
- [Global Sessions](#global-sessions)
- [Search Examples](#search-examples)
- [Advanced Workflows](#advanced-workflows)

---

## Basic Usage

### First Time Setup

```bash
# Install the plugin
git clone https://github.com/rexzhen/ccm ~/.claude/plugins/ccm

# Test it works
cd ~/projects/my-app
claude
```

When Claude Code starts, you'll see:
```
## No Previous Session

No previous session found in this context.
This is a fresh start! 🎉
```

After working and exiting, next time you start Claude Code in the same project:
```
# Session Summary

**Date:** 1/31/2026, 2:30:22 PM
**Location:** Project: **my-app**
...
```

---

## Project-Specific Sessions

### Scenario: Working on Multiple Projects

**Morning: Working on API Project**
```bash
cd ~/work/api-service
claude

# Claude automatically shows:
# "Last time: Fixed authentication bug, updated tests"

# Work on the project...
# Sessions saved to: ~/work/api-service/.claude/sessions/
```

**Afternoon: Switch to Frontend Project**
```bash
cd ~/work/frontend-app
claude

# Claude automatically shows:
# "Last time: Implemented dark mode, refactored components"

# Work on the project...
# Sessions saved to: ~/work/frontend-app/.claude/sessions/
```

**Evening: Back to API Project**
```bash
cd ~/work/api-service
claude

# Shows context from morning session about authentication
```

### Scenario: Team Collaboration

**Setup for team sharing (optional):**

```bash
cd ~/work/team-project

# Create .gitignore to keep sessions private but share summaries
cat >> .gitignore << 'EOF'
# Keep full session transcripts private
.claude/sessions/*.json

# Allow summaries for team reference
!.claude/sessions/summaries/
EOF

git add .gitignore .claude/sessions/summaries/
git commit -m "Add session summaries for team context"
```

Team members can now see summaries of past sessions when they pull.

---

## Global Sessions

### Scenario: Quick Questions Outside Projects

```bash
# Not in any project
cd ~
claude

# Ask a quick question
# "How do I parse JSON in Python?"

# Exit, then later...
cd ~
claude

# Shows: "Last time: Discussed JSON parsing in Python"
# Sessions saved to: ~/.claude/sessions/
```

### Scenario: Learning and Experimentation

```bash
cd ~/learning
claude

# Try out code examples, ask questions
# All saved to global sessions

# Search later
/ccm-search "regex examples"
```

---

## Search Examples

### Search for Specific Topics

```bash
# In a project
/ccm-search "authentication"

# Output:
## Search Results for "authentication"

Found 3 matching session(s):

### 1. 2026-01-31T14-30-22-000Z.json
**Date:** 1/31/2026, 2:30:22 PM
**Project:** api-service
**Directory:** `/Users/you/work/api-service`
**Match:** ...implemented JWT authentication with refresh tokens...

### 2. 2026-01-28T09-15-34-000Z.json
**Date:** 1/28/2026, 9:15:34 AM
**Project:** api-service
**Directory:** `/Users/you/work/api-service`
**Match:** ...fixed authentication bug where tokens were expiring...
```

### Search for File Names

```bash
/ccm-search "auth.js"
/ccm-search "database.py"
/ccm-search "config.yml"
```

### Search for Error Messages

```bash
/ccm-search "TypeError"
/ccm-search "connection refused"
/ccm-search "build failed"
```

### Search for Features

```bash
/ccm-search "dark mode"
/ccm-search "user profile"
/ccm-search "payment integration"
```

---

## Advanced Workflows

### Workflow 1: Daily Standup Report

```bash
# Generate a report of what you worked on
cd ~/work/my-project
/ccm-list 5

# Output shows last 5 sessions with timestamps
# Copy relevant info for standup
```

### Workflow 2: Context Switching

```bash
# Check where you are
/ccm-info

# Output:
## Current Session Context
**Mode:** 🚀 Project-specific
**Session Directory:** `/path/to/project/.claude/sessions`
...

# List recent work
/ccm-list

# Search for specific context
/ccm-search "the bug I was working on"
```

### Workflow 3: Project Retrospective

```bash
# Review all sessions for a project
cd ~/work/completed-project
/ccm-list 50

# Search for key milestones
/ccm-search "completed"
/ccm-search "deployed"
/ccm-search "bug fix"
```

### Workflow 4: Manual Session Checkpoints

```bash
# Save important milestones manually
/ccm-save "Completed user authentication feature"
/ccm-save "Fixed critical security vulnerability"
/ccm-save "Refactored database layer - all tests passing"

# Later, search for these checkpoints
/ccm-search "Completed"
```

### Workflow 5: Cross-Project Learning

```bash
# In project A, you solved a problem
cd ~/work/project-a
/ccm-search "implemented caching"

# Use that knowledge in project B
cd ~/work/project-b
# Apply the same solution

# Search later to find the pattern
cd ~/work/project-a
/ccm-search "caching"
```

---

## Tips and Tricks

### Tip 1: Add Descriptive Save Messages

Instead of letting auto-save handle everything:
```bash
/ccm-save "Implemented OAuth2 flow with Google and GitHub providers"
/ccm-save "Debugged race condition in async queue processor"
```

These custom messages make searching easier later.

### Tip 2: Regular Context Checks

At the start of each session:
```bash
/ccm-info
```

Confirms you're in the right context (project vs global).

### Tip 3: Use List to Review Recent Work

Before starting work:
```bash
/ccm-list 3
```

Shows what you worked on in the last 3 sessions.

### Tip 4: Search Before Asking

If you remember discussing something before:
```bash
/ccm-search "redis configuration"
```

Find the previous conversation instead of re-explaining.

### Tip 5: Clean Up Old Sessions

Periodically archive or remove old sessions:
```bash
# Direct file operations
cd .claude/sessions
mkdir archives/2025
mv 2025-*.json archives/2025/
```

---

## Integration with Git Workflow

### Example: Pre-commit Context

```bash
# Before committing, check what you changed
/ccm-list 1

# Shows recent session with file changes
# Helps write better commit messages
```

### Example: Pull Request Description

```bash
# Search for all work on a feature
/ccm-search "user dashboard"

# Use session summaries to write PR description
```

### Example: Bug Fix Documentation

```bash
# Search for the debugging session
/ccm-search "memory leak"

# Reference the session in your bug fix commit
git commit -m "Fix: Memory leak in websocket handler

Debugged in session 2026-01-31, found that connections
weren't being closed properly..."
```

---

## Troubleshooting Examples

### "I can't find my previous conversation"

```bash
# Check current context
/ccm-info

# If you're in the wrong context (global vs project), navigate to correct location
cd ~/work/my-project
/ccm-info

# Now search again
/ccm-search "my topic"
```

### "Sessions are being saved to the wrong place"

```bash
# Check detection
/ccm-info

# If you want project-specific but getting global:
# Create a .claude directory in your project
mkdir -p .claude/sessions
/ccm-info  # Should now show project-specific
```

### "How do I share sessions with my team?"

```bash
# Option 1: Share summaries only (recommended)
echo '.claude/sessions/*.json' >> .gitignore
git add .claude/sessions/summaries/
git commit -m "Share session summaries"

# Option 2: Keep everything private
echo '.claude/sessions/' >> .gitignore
```

---

## Real-World Use Cases

### Use Case 1: Freelancer with Multiple Clients

```bash
~/clients/
├── client-a/          # Project A sessions
├── client-b/          # Project B sessions
└── client-c/          # Project C sessions
```

Each client gets isolated session history.

### Use Case 2: Open Source Contributor

```bash
~/opensource/
├── project-1/         # Contribution 1
├── project-2/         # Contribution 2
└── ~/                 # Global for general questions
```

### Use Case 3: Student Learning Multiple Languages

```bash
~/learning/python/     # Python project sessions
~/learning/rust/       # Rust project sessions
~/learning/go/         # Go project sessions
~/                     # Global for general programming questions
```

### Use Case 4: Data Scientist with Multiple Experiments

```bash
~/experiments/
├── experiment-01/     # Context for experiment 1
├── experiment-02/     # Context for experiment 2
└── experiment-03/     # Context for experiment 3
```

Each experiment maintains its own conversation history.

---

## Summary

CCM adapts to your workflow:
- **Automatic** context switching based on directory
- **Manual** commands when you need control
- **Search** to find past conversations
- **Flexible** for teams or solo work

Remember: The key benefit is **persistent context across sessions** - no more explaining the same thing twice!
