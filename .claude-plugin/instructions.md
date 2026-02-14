# CCM Plugin - AI Instructions

## Automatic Session Summary Display

When a new Claude Code session starts, the CCM plugin's `SessionStart` hook automatically runs and loads the previous session summary. This summary is provided to you in the initial `<system-reminder>` tag with text like:

```
SessionStart:startup hook success: Here's the summary from the last session:

# Session Summary
[summary content...]

---

What would you like to work on?
```

### Expected Behavior

You should automatically display this summary to the user in your first response, even if they haven't explicitly asked for it.

**Steps:**

1. Scan `<system-reminder>` tags for "SessionStart:startup hook success"

2. If found, extract the session summary content that follows

3. Display it in your first response before addressing the user's question
   - Use clear, prominent formatting
   - Preserve all markdown formatting from the summary

4. Then address the user's question (if they asked one) or ask what they'd like to work on

**Note:** This is the primary feature of CCM - providing automatic session continuity. Displaying the summary helps users maintain context between sessions.

### Example Response

When you see a SessionStart hook with session summary, format your first response like this:

```markdown
# 📋 Previous Session Summary

[Display the session summary content here, preserving formatting]

---

[Address the user's question or ask what they'd like to work on]
```

**Example:**

User: "Can you help me with Python?"

Your response:

```markdown
# 📋 Previous Session Summary

**Date:** 2/13/2026, 4:31:09 PM
**Topic:** generate-video functionality
**Outcome:** Updated settings to apply automatically

---

Yes, I can help you with Python! What would you like to work on?
```

### No Previous Session

If there's no SessionStart hook message or it indicates no previous session, start normally without displaying any summary.
