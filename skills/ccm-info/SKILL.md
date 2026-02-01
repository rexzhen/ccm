---
name: ccm-info
description: Display current session context information including whether sessions are project-specific or global, session directory location, and project details.
user-invocable: true
allowed-tools: Bash(node *)
---

# Session Context Information

Display information about the current session management context:

```bash
node ${PLUGIN_DIR}/scripts/session-manager.js info
```

Show the user:
- Current mode (Project-specific or Global)
- Session directory location
- Project root (if applicable)
- Project name (if applicable)
- Git repository status

This helps users understand where their sessions are being saved and what context they're working in.
