---
name: ccm-load
description: Automatically load and display the latest session summary based on current context - project-specific if in a project directory, global otherwise. Shows context from previous conversations.
disable-model-invocation: false
user-invocable: true
allowed-tools: Bash(node *)
---

# Context-Aware Session Load

Load the appropriate session summary based on working directory:
- If in a project: Load project-specific session
- If outside projects: Load global session

Execute the session loader:

```bash
node ${PLUGIN_DIR}/scripts/session-manager.js load
```

Display the summary prominently to the user to help them recall context from their last session.

If no previous session exists, inform the user this is a fresh start.
