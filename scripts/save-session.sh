#!/bin/bash

# CCM Save Session Script with Intelligent Claude-powered Summary Generation
# Fixed version that:
# 1. Extracts transcript content IMMEDIATELY (before file deletion)
# 2. Properly inherits authentication from Claude session
# 3. Implements iterative history merging with quality validation
# 4. Ensures all processing completes before exit

# Temporarily disable set -e to capture errors
# set -e

# Debug logging
DEBUG_LOG="/tmp/ccm-save-debug.log"
echo "=== Save session started at $(date) ===" >> "$DEBUG_LOG" 2>&1 || echo "Failed to write to debug log" >&2

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(dirname "$SCRIPT_DIR")"

# Read hook input from stdin (provided by Claude Code)
HOOK_INPUT=""
if [ ! -t 0 ]; then
    HOOK_INPUT=$(cat)
    echo "Raw HOOK_INPUT: $HOOK_INPUT" >> "$DEBUG_LOG"
fi

# Parse transcript path from hook input
TRANSCRIPT_PATH=""
PROJECT_CWD=""
TRANSCRIPT_CONTENT=""

if [ -n "$HOOK_INPUT" ]; then
    TRANSCRIPT_PATH=$(echo "$HOOK_INPUT" | grep -o '"transcript_path":"[^"]*"' | cut -d'"' -f4 || echo "")
    PROJECT_CWD=$(echo "$HOOK_INPUT" | grep -o '"cwd":"[^"]*"' | cut -d'"' -f4 || echo "")
    echo "Parsed TRANSCRIPT_PATH: $TRANSCRIPT_PATH" >> "$DEBUG_LOG"
    echo "Parsed PROJECT_CWD: $PROJECT_CWD" >> "$DEBUG_LOG"

    # CRITICAL FIX #1: Extract transcript content IMMEDIATELY before it gets deleted
    if [ -n "$TRANSCRIPT_PATH" ] && [ -f "$TRANSCRIPT_PATH" ]; then
        TRANSCRIPT_CONTENT=$(cat "$TRANSCRIPT_PATH" 2>/dev/null || echo "")
        echo "Extracted transcript from $TRANSCRIPT_PATH: ${#TRANSCRIPT_CONTENT} bytes" >> "$DEBUG_LOG"
    else
        echo "No transcript path or file not found: $TRANSCRIPT_PATH" >> "$DEBUG_LOG"
    fi

    # If CWD not in hook input and we have transcript, extract from transcript file
    if [ -z "$PROJECT_CWD" ] && [ -n "$TRANSCRIPT_CONTENT" ]; then
        PROJECT_CWD=$(echo "$TRANSCRIPT_CONTENT" | head -10 | grep -o '"cwd":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
    fi
fi

# Step 1: Save session using session-manager.js (generates JSONL + basic summary)
if [ -n "$HOOK_INPUT" ]; then
    if [ -n "$PROJECT_CWD" ]; then
        SAVE_RESULT=$(CLAUDE_PROJECT_CWD="$PROJECT_CWD" bash -c "echo '$HOOK_INPUT' | node '$SCRIPT_DIR/session-manager.js' save")
    else
        SAVE_RESULT=$(echo "$HOOK_INPUT" | node "$SCRIPT_DIR/session-manager.js" save)
    fi
else
    SAVE_RESULT=$(node "$SCRIPT_DIR/session-manager.js" save "$@")
fi

# Extract session filepath from the result
SESSION_FILE=$(echo "$SAVE_RESULT" | grep -o '"location":"[^"]*"' | cut -d'"' -f4 || echo "")

if [ -z "$SESSION_FILE" ]; then
    echo "$SAVE_RESULT"
    exit 0
fi

# Determine session directory
SESSION_DIR=$(dirname "$SESSION_FILE")
SUMMARY_DIR="$SESSION_DIR/summaries"
LATEST_SUMMARY="$SUMMARY_DIR/latest.md"
DATE_SUMMARY="$SUMMARY_DIR/$(date +%Y-%m-%d).md"

# Step 2: Generate enhanced summary using Claude CLI
# If transcript content not available from hook, try reading from saved session file
if [ -z "$TRANSCRIPT_CONTENT" ] && [ -f "$SESSION_FILE" ]; then
    echo "Reading transcript from saved session: $SESSION_FILE" >> "$DEBUG_LOG"
    # Use jq to properly extract the transcript field from the JSON
    if command -v jq >/dev/null 2>&1; then
        TRANSCRIPT_CONTENT=$(jq -r '.transcript // empty' "$SESSION_FILE" 2>/dev/null || echo "")
    else
        # Fallback: use node to extract transcript
        TRANSCRIPT_CONTENT=$(node -e "const fs = require('fs'); try { const data = JSON.parse(fs.readFileSync('$SESSION_FILE', 'utf8').trim()); console.log(data.transcript || ''); } catch(e) {}" 2>/dev/null || echo "")
    fi
    echo "Read ${#TRANSCRIPT_CONTENT} bytes from session file" >> "$DEBUG_LOG"
fi

# Only proceed if we have transcript content
if [ -z "$TRANSCRIPT_CONTENT" ]; then
    echo "No transcript content available, exiting" >> "$DEBUG_LOG"
    echo "$SAVE_RESULT"
    echo '{"systemMessage":"⚠️  No transcript content available for enhancement"}' >&2
    exit 0
fi

echo "Transcript available: ${#TRANSCRIPT_CONTENT} bytes" >> "$DEBUG_LOG"

# Check if Claude CLI is available
if ! command -v claude >/dev/null 2>&1; then
    echo "Claude CLI not found" >> "$DEBUG_LOG"
    echo "$SAVE_RESULT"
    echo '{"systemMessage":"⚠️  Claude CLI not found. Install it for AI-powered summaries."}' >&2
    exit 0
fi

echo "Claude CLI found: $(command -v claude)" >> "$DEBUG_LOG"

# CRITICAL FIX #2: Properly detect and inherit authentication
# The credentials are already in the environment from the current Claude session
HAS_AUTH=false
AUTH_TYPE=""

# Check for Anthropic API key
if [ -n "$ANTHROPIC_API_KEY" ]; then
    HAS_AUTH=true
    AUTH_TYPE="Anthropic API"
# Check for AWS Bedrock credentials
else
    # First try to detect AWS profile from environment or default locations
    DETECTED_PROFILE="$AWS_PROFILE"

    # If no profile in env, try to find one in AWS config
    if [ -z "$DETECTED_PROFILE" ] && [ -f "$HOME/.aws/config" ]; then
        # Look for profiles that might have Claude/Bedrock
        DETECTED_PROFILE=$(grep -E "^\[profile " "$HOME/.aws/config" | head -1 | sed 's/\[profile \(.*\)\]/\1/' || echo "")
        # If no profile found, use 'default'
        if [ -z "$DETECTED_PROFILE" ]; then
            DETECTED_PROFILE="default"
        fi
    fi

    # Use Claude Code's profile if available
    if [ -n "$CLAUDE_CODE_AWS_PROFILE" ]; then
        DETECTED_PROFILE="$CLAUDE_CODE_AWS_PROFILE"
    fi

    # Set the profile
    if [ -n "$DETECTED_PROFILE" ]; then
        export AWS_PROFILE="$DETECTED_PROFILE"
    fi

    # Detect region from multiple sources
    DETECTED_REGION="$AWS_REGION"

    # Try AWS profile
    if [ -z "$DETECTED_REGION" ] && [ -n "$AWS_PROFILE" ]; then
        DETECTED_REGION=$(aws configure get region --profile "$AWS_PROFILE" 2>/dev/null || echo "")
    fi

    # Try default AWS config
    if [ -z "$DETECTED_REGION" ]; then
        DETECTED_REGION=$(aws configure get region 2>/dev/null || echo "")
    fi

    # Try common environment variables
    if [ -z "$DETECTED_REGION" ] && [ -n "$AWS_DEFAULT_REGION" ]; then
        DETECTED_REGION="$AWS_DEFAULT_REGION"
    fi

    # Fallback to us-east-1 if no region detected
    if [ -z "$DETECTED_REGION" ]; then
        DETECTED_REGION="us-east-1"
    fi

    export AWS_REGION="$DETECTED_REGION"

    # Check if we have valid credentials
    if [ -n "$AWS_PROFILE" ] || [ -n "$AWS_ACCESS_KEY_ID" ]; then
        HAS_AUTH=true
        AUTH_TYPE="AWS Bedrock (${AWS_PROFILE:-keys}, $DETECTED_REGION)"
    fi
fi

if [ "$HAS_AUTH" = false ]; then
    echo "No authentication detected" >> "$DEBUG_LOG"
    echo "$SAVE_RESULT"
    echo '{"systemMessage":"⚠️  No API credentials detected.\nEnsure Claude Code session is authenticated."}' >&2
    exit 0
else
    echo "Authentication detected: $AUTH_TYPE" >> "$DEBUG_LOG"
    echo "{\"systemMessage\":\"✓ Authentication detected: $AUTH_TYPE\"}" >&2
fi

# Export AWS credentials if they exist
if [ -n "$AWS_ACCESS_KEY_ID" ]; then
    export AWS_ACCESS_KEY_ID
    export AWS_SECRET_ACCESS_KEY
fi
if [ -n "$AWS_SESSION_TOKEN" ]; then
    export AWS_SESSION_TOKEN
fi

# Helper function to extract exchanges from transcript content
# NOTE: Transcript can be very large (50MB+), so we pass via temp file instead of command-line args
extract_exchanges() {
    local transcript="$1"
    local sample_size="${2:-all}"  # all, first, or last

    # Write transcript to temp file
    local temp_transcript=$(mktemp)
    echo "$transcript" > "$temp_transcript"

    node -e "
        const fs = require('fs');
        const transcriptFile = '$temp_transcript';
        const sampleSize = '$sample_size';

        try {
            const content = fs.readFileSync(transcriptFile, 'utf8');

            // Parse JSONL (one JSON object per line)
            let messages = [];
            if (content.includes('\\n') && !content.trim().startsWith('[')) {
                const lines = content.trim().split('\\n').filter(line => line.trim());
                messages = lines.map(line => {
                    try {
                        return JSON.parse(line);
                    } catch (e) {
                        return null;
                    }
                }).filter(m => m !== null);
            } else {
                const parsed = JSON.parse(content);
                messages = Array.isArray(parsed) ? parsed : [parsed];
            }

            // Extract user/assistant messages only
            const exchanges = [];
            for (const msg of messages) {
                if (msg.type === 'user' && msg.message && typeof msg.message.content === 'string') {
                    const clean = msg.message.content.replace(/<[^>]+>/g, '');
                    exchanges.push({ role: 'user', content: clean });
                } else if (msg.type === 'assistant' && msg.message && msg.message.content) {
                    let text = '';
                    if (Array.isArray(msg.message.content)) {
                        text = msg.message.content
                            .filter(c => c && c.type === 'text')
                            .map(c => c.text)
                            .join(' ');
                    } else if (typeof msg.message.content === 'string') {
                        text = msg.message.content;
                    }
                    if (text.trim()) {
                        exchanges.push({ role: 'assistant', content: text });
                    }
                }
            }

            console.log('Total exchanges: ' + exchanges.length);
            console.log('');

            // Sample based on request
            let sampled = [];
            if (sampleSize === 'first') {
                sampled = exchanges.slice(0, Math.min(6, exchanges.length));
            } else if (sampleSize === 'last') {
                sampled = exchanges.slice(-6);
            } else {
                // Sample: first 4, middle 2, last 4
                if (exchanges.length <= 10) {
                    sampled = exchanges;
                } else {
                    const mid = Math.floor(exchanges.length / 2);
                    sampled = [
                        ...exchanges.slice(0, 4),
                        ...exchanges.slice(mid - 1, mid + 1),
                        ...exchanges.slice(-4)
                    ];
                }
            }

            sampled.forEach(m => {
                console.log(m.role.toUpperCase() + ': ' + m.content.substring(0, 400) + (m.content.length > 400 ? '...' : ''));
                console.log('');
            });
        } catch (e) {
            console.log('Error extracting exchanges: ' + e.message);
        }
    " 2>/dev/null || echo "No exchanges available"

    # Clean up temp file
    rm -f "$temp_transcript"
}

# Helper function to check if summary is meaningful
is_summary_meaningful() {
    local summary="$1"

    # Check for indicators of non-meaningful summaries
    echo "$summary" | grep -qiE "(No meaningful work|just.*greeting|trivial.*session|no.*conversation|no.*work.*performed)" && return 1

    # Check if summary is too short (less than 100 chars suggests generic)
    [ ${#summary} -lt 100 ] && return 1

    # Check for generic phrases
    echo "$summary" | grep -qiE "(cat latest|session saved|hello|hi there)" && return 1

    return 0
}

# CRITICAL FIX #3: Implement iterative history merging with quality validation
# Start with current session only, then add history incrementally

TEMP_PROMPT=$(mktemp)
HISTORY_FILES=$(ls -t "$SESSION_DIR"/*.jsonl 2>/dev/null | grep -v "$(basename "$SESSION_FILE")" | head -10 || echo "")
HISTORY_ARRAY=($HISTORY_FILES)
HISTORY_COUNT=0
MAX_ITERATIONS=5
ITERATION=0
MEANINGFUL_SUMMARY=""

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
    ITERATION=$((ITERATION + 1))

    # Build prompt for this iteration
    cat > "$TEMP_PROMPT" <<'EOFPROMPT'
You are generating a session summary for Claude Code Memory Management (CCM).

Your task:
1. Review the provided context (previous summary + current session + history if provided)
2. Generate a merged, coherent summary that captures the meaningful work done
3. Be HONEST: If content is trivial (greetings, small talk, no actual work), say so explicitly

Requirements:
- Focus on ACTUAL WORK: code changes, problems solved, decisions made, features implemented
- Merge redundant information from previous summaries
- Remove trivial exchanges (greetings, "ok", "thanks", acknowledgments)
- If truly not meaningful, say "No meaningful work in this session"

Format:
## Summary
[2-4 sentences about what was accomplished. If trivial, state: "No meaningful work in this session. This was a [greeting/startup/brief exchange] with no significant development work."]

## Key Decisions
[Bullet points of important technical/architectural choices, or "None"]

## Outcomes
[What was completed or changed in the codebase, or "None"]

## Next Steps
[Actionable items for future work, or "None"]

IMPORTANT: Be honest. Don't fabricate content. If this was just a greeting or system startup, say so clearly.

---
EOFPROMPT

    # Add previous summary if exists and this is first iteration
    if [ $ITERATION -eq 1 ] && [ -f "$LATEST_SUMMARY" ]; then
        echo "## Previous Summary" >> "$TEMP_PROMPT"
        echo "" >> "$TEMP_PROMPT"
        cat "$LATEST_SUMMARY" >> "$TEMP_PROMPT"
        echo "" >> "$TEMP_PROMPT"
        echo "---" >> "$TEMP_PROMPT"
        echo "" >> "$TEMP_PROMPT"
    fi

    # Add current session exchanges
    echo "## Current Session" >> "$TEMP_PROMPT"
    echo "" >> "$TEMP_PROMPT"
    EXCHANGES=$(extract_exchanges "$TRANSCRIPT_CONTENT" "all")
    echo "$EXCHANGES" >> "$TEMP_PROMPT"
    echo "" >> "$TEMP_PROMPT"

    # Add history sessions based on iteration
    if [ $HISTORY_COUNT -gt 0 ]; then
        echo "---" >> "$TEMP_PROMPT"
        echo "## Recent History (last $HISTORY_COUNT sessions)" >> "$TEMP_PROMPT"
        echo "" >> "$TEMP_PROMPT"

        for i in $(seq 0 $((HISTORY_COUNT - 1))); do
            if [ $i -lt ${#HISTORY_ARRAY[@]} ]; then
                HIST_FILE="${HISTORY_ARRAY[$i]}"
                if [ -f "$HIST_FILE" ]; then
                    HIST_SUMMARY=$(node -e "
                        try {
                            const fs = require('fs');
                            const data = JSON.parse(fs.readFileSync('$HIST_FILE', 'utf8').trim());
                            const summary = data.enhancedSummary || data.summary || 'No summary';
                            const timestamp = data.timestamp || 'Unknown';
                            console.log('### Session ' + timestamp);
                            console.log(summary);
                            console.log('');
                        } catch (e) {
                            console.log('');
                        }
                    " 2>/dev/null || echo "")

                    if [ -n "$HIST_SUMMARY" ]; then
                        echo "$HIST_SUMMARY" >> "$TEMP_PROMPT"
                    fi
                fi
            fi
        done
    fi

    # Generate summary with Claude - explicitly pass AWS credentials
    # Use timeout to ensure we don't hang (60 seconds should be plenty)
    echo "About to call Claude CLI: iteration $ITERATION, prompt size: $(wc -c < "$TEMP_PROMPT") bytes" >> "$DEBUG_LOG"
    NEW_SUMMARY=$(timeout 60s bash -c "AWS_PROFILE='$AWS_PROFILE' AWS_REGION='$AWS_REGION' claude --print < '$TEMP_PROMPT'" 2>&1 || echo "ERROR: Claude CLI failed or timed out")
    echo "Claude CLI returned: ${#NEW_SUMMARY} chars, exit code: $?" >> "$DEBUG_LOG"

    echo "{\"systemMessage\":\"Debug: Iteration $ITERATION - Generated ${#NEW_SUMMARY} chars\"}" >&2

    # Check if summary is meaningful
    if [ -n "$NEW_SUMMARY" ] && is_summary_meaningful "$NEW_SUMMARY"; then
        MEANINGFUL_SUMMARY="$NEW_SUMMARY"
        echo "{\"systemMessage\":\"✓ Meaningful summary found on iteration $ITERATION\"}" >&2
        break
    else
        echo "{\"systemMessage\":\"✗ Summary not meaningful on iteration $ITERATION, retrying with more history...\"}" >&2
    fi

    # If not meaningful and we have more history, try adding more context
    if [ $HISTORY_COUNT -lt ${#HISTORY_ARRAY[@]} ] && [ $HISTORY_COUNT -lt 10 ]; then
        # Add 2 more history sessions and retry
        HISTORY_COUNT=$((HISTORY_COUNT + 2))
        continue
    else
        # No more history to add, or reached limit
        # Keep the summary even if not meaningful (it's honest)
        if [ -n "$NEW_SUMMARY" ]; then
            MEANINGFUL_SUMMARY="$NEW_SUMMARY"
        fi
        break
    fi
done

# Clean up temp file
rm -f "$TEMP_PROMPT"

# CRITICAL FIX #4: Save the summary (meaningful or explicit "not meaningful")
if [ -n "$MEANINGFUL_SUMMARY" ]; then
    # Add metadata footer
    FULL_SUMMARY="$MEANINGFUL_SUMMARY

---
**Session Time:** $(date '+%Y-%m-%d %H:%M:%S')
**Generated by:** CCM Plugin v1.0.4 (Claude-powered via $AUTH_TYPE)
**History merged:** $HISTORY_COUNT previous sessions
**Quality iterations:** $ITERATION
"

    # Save to summary files
    echo "$FULL_SUMMARY" > "$LATEST_SUMMARY"
    echo "$FULL_SUMMARY" > "$DATE_SUMMARY"

    # Update session file with enhanced summary
    if [ -f "$SESSION_FILE" ]; then
        TEMP_SESSION=$(mktemp)
        # Use Node.js to safely update JSON with escaped content
        node -e "
            const fs = require('fs');
            try {
                const data = JSON.parse(fs.readFileSync('$SESSION_FILE', 'utf8').trim());
                data.enhancedSummary = fs.readFileSync('$LATEST_SUMMARY', 'utf8');
                fs.writeFileSync('$TEMP_SESSION', JSON.stringify(data) + '\\n');
            } catch (e) {
                console.error('Failed to update session file:', e.message);
            }
        " 2>/dev/null && mv "$TEMP_SESSION" "$SESSION_FILE"
    fi

    echo "$SAVE_RESULT"
    echo "{\"systemMessage\":\"✨ Enhanced summary generated (${ITERATION} iterations, ${HISTORY_COUNT} history sessions)\"}" >&2
    exit 0
fi

# Fallback: output original result if something went wrong
echo "$SAVE_RESULT"
echo '{"systemMessage":"⚠️  Summary generation completed with basic summary only"}' >&2
exit 0
