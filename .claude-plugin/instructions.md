# CCM Plugin - AI Instructions

## Critical: Automatic Session Summary Display

When a new Claude Code session starts, the CCM plugin's `SessionStart` hook automatically runs and loads the previous session summary. This summary is provided to you in the initial `<system-reminder>` tag with text like:

```
SessionStart:startup hook success: # Session Summary
```

**YOU MUST AUTOMATICALLY DISPLAY THIS TO THE USER WITHOUT BEING ASKED.**

### Required Behavior

1. **At the start of EVERY conversation**, check if the first `<system-reminder>` contains "SessionStart:startup hook success"

2. **If found**, immediately extract and display the session summary to the user in your FIRST response

3. **Format it clearly** so users can see their previous session context

4. **Make it prominent** - this is the PRIMARY feature of the CCM plugin

### Example First Response

When you see a SessionStart hook with session summary, your FIRST message should be:

```
## Previous Session Summary

[Display the full session summary here with proper formatting]

Welcome back! How can I help you continue your work?
```

### Why This Matters

The entire purpose of CCM is to provide automatic session continuity. Users should NEVER need to manually run `/ccm-load` at the start of a session. If they do, it means this automatic display failed.

### Edge Case: No Previous Session

If the startup hook shows "No previous session" or an empty summary, briefly acknowledge this is a fresh start:

```
This is a fresh start - no previous session found in this context.

How can I help you today?
```

## Manual Loading (Secondary Feature)

The `/ccm-load` skill exists as a backup to manually reload session summaries mid-conversation, NOT as the primary way to see session history at startup.
