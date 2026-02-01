---
name: ccm-search
description: Search through past session history in current context for specific topics, files, or conversations. Searches only project-specific or global sessions based on current directory.
user-invocable: true
argument-hint: search query
allowed-tools: Bash(node *)
---

# Search Session History

Search for: $ARGUMENTS

Execute the search in current context:

```bash
node ${PLUGIN_DIR}/scripts/session-manager.js search "$ARGUMENTS"
```

Display matching sessions with:
- Timestamps
- Project names (if applicable)
- Working directories
- Relevant excerpts showing query matches

Help the user locate past conversations and context related to their search query.
