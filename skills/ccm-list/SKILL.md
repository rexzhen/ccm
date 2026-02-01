---
name: ccm-list
description: List recent sessions in current context showing timestamps, project names, and working directories. Useful for reviewing past conversations.
user-invocable: true
argument-hint: [optional limit]
allowed-tools: Bash(node *)
---

# List Recent Sessions

List recent sessions in current context.

Limit: ${ARGUMENTS:-10}

```bash
node ${PLUGIN_DIR}/scripts/session-manager.js list ${ARGUMENTS:-10}
```

Display sessions with:
- Session filename (timestamped)
- Date and time
- Project name (if project-specific)
- Working directory

Help the user browse their session history in the current context.
