---
name: ccm-save
description: Manually save the current session with optional custom message. Automatically detects project context and saves to appropriate location.
user-invocable: true
argument-hint: [optional message]
allowed-tools: Bash(node *)
---

# Manual Session Save

Save the current session manually with an optional custom message.

Message: $ARGUMENTS

```bash
node ${PLUGIN_DIR}/scripts/session-manager.js save "$ARGUMENTS"
```

The session will be saved to:
- Project directory if in a project: `<project>/.claude/sessions/`
- Global directory otherwise: `~/.claude/sessions/`

Confirm to the user that the session has been saved successfully.
