# Analyze Session History

**analyze-sessions**: Read recent session history and generate a comprehensive summary

## Instructions

When this skill is invoked, you should:

1. **Read session files** from the appropriate location:
   - If in a Claude project: `<project-root>/.claude/sessions/`
   - Otherwise: `~/.claude/sessions/`

2. **Analyze the most recent sessions** (last 3-5 session JSON files)

3. **Generate a comprehensive summary** with this structure:

```
# Recent Work Summary

**Recent Focus** (with dates):
- Main topics, tasks, or problems worked on
- Key decisions and outcomes
- Timeline of important events

**Ongoing Work/Infrastructure**:
- Current projects or systems being developed
- Configuration details and state
- Technical specifications worth remembering

**Previous Learning/Exploration**:
- Topics explored or researched
- Deep-dives, comparisons, or analyses
- Key insights and patterns

**Pending Action Items**:
- Concrete next steps or tasks
- Unfinished work or follow-ups
- Actionable items with context

---

**What would you like to work on today?**

Some options:
1. [Continue previous work]
2. [Explore related topics]
3. [New directions based on context]
4. [Other relevant options]
```

4. **Make it rich and contextual** - provide enough detail so the user immediately understands where they left off

## Usage

This skill is automatically invoked on SessionStart when previous sessions exist.
