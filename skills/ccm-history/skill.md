---
name: ccm-history
description: Browse and search session history. Without arguments shows recent sessions with context info. With arguments searches for specific topics.
user-invocable: true
argument-hint: [optional search query]
allowed-tools: Bash(node *)
---

# Session History Browser

Browse or search session history in current context.

{{#if ARGUMENTS}}
## Searching for: $ARGUMENTS

```bash
node ${PLUGIN_DIR}/scripts/session-manager.js history "$ARGUMENTS"
```

Display matching sessions with timestamps, project names, directories, and relevant excerpts.
{{else}}
## Recent Sessions

```bash
node ${PLUGIN_DIR}/scripts/session-manager.js history
```

Display sessions with timestamps, project names, and working directories to help the user review past conversations.
{{/if}}
