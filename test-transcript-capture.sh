#!/bin/bash

# Test script for CCM transcript capture functionality
# This verifies that the plugin correctly captures and processes conversation transcripts

set -e

echo "======================================================================"
echo "CCM Plugin - Transcript Capture Test"
echo "======================================================================"
echo ""

# Create test transcript
TEST_TRANSCRIPT="/tmp/ccm-test-transcript.jsonl"
cat > "$TEST_TRANSCRIPT" << 'EOF'
{"role":"user","content":"Can you help me write a Python function to calculate factorial?"}
{"role":"assistant","content":"Sure! Here's a Python function to calculate factorial:\n\n```python\ndef factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n```"}
{"role":"user","content":"Great! Can you add error handling for negative numbers?"}
{"role":"assistant","content":"Of course! Here's the improved version:\n\n```python\ndef factorial(n):\n    if n < 0:\n        raise ValueError('Factorial is not defined for negative numbers')\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n```"}
EOF

echo "✓ Created test transcript"
echo ""

# Create test hook input
TEST_HOOK_INPUT="/tmp/ccm-test-hook-input.json"
cat > "$TEST_HOOK_INPUT" << EOF
{
  "session_id": "test-$(date +%s)",
  "transcript_path": "$TEST_TRANSCRIPT",
  "cwd": "$(pwd)",
  "permission_mode": "default",
  "hook_event_name": "SessionEnd",
  "reason": "test"
}
EOF

echo "✓ Created test hook input"
echo ""

# Test session save with transcript
echo "Testing session save with transcript capture..."
RESULT=$(cat "$TEST_HOOK_INPUT" | node scripts/session-manager.js save "Test: Factorial function")

if echo "$RESULT" | grep -q "Session saved"; then
    echo "✓ Session saved successfully"
else
    echo "✗ Failed to save session"
    exit 1
fi
echo ""

# Load and verify summary
echo "Loading session summary..."
SUMMARY=$(node scripts/session-manager.js load)

if echo "$SUMMARY" | grep -q "Conversation Highlights"; then
    echo "✓ Conversation highlights found in summary"
else
    echo "✗ Conversation highlights missing"
    exit 1
fi

if echo "$SUMMARY" | grep -q "factorial"; then
    echo "✓ Transcript content captured correctly"
else
    echo "✗ Transcript content not found"
    exit 1
fi

if echo "$SUMMARY" | grep -q "Total exchanges:"; then
    echo "✓ Exchange count displayed"
else
    echo "✗ Exchange count missing"
    exit 1
fi

echo ""
echo "======================================================================"
echo "All tests passed! ✓"
echo "======================================================================"
echo ""
echo "The CCM plugin is correctly capturing conversation transcripts."
echo "When you exit Claude Code, your full conversation will be saved"
echo "automatically and the summary will appear when you start a new session."
echo ""

# Cleanup
rm -f "$TEST_TRANSCRIPT" "$TEST_HOOK_INPUT"
