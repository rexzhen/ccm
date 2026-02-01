# Pre-Publication Test Checklist

Run through this checklist before publishing to GitHub.

## ✅ File Structure Tests

- [ ] All files present
  ```bash
  ls -la
  # Should see: README.md, package.json, LICENSE, etc.
  ```

- [ ] Scripts are executable
  ```bash
  ls -l scripts/session-manager.js
  # Should show: -rwxr-xr-x (executable)
  ```

- [ ] Directory structure correct
  ```bash
  tree -L 2
  # Should match documented structure
  ```

## ✅ Functionality Tests

### Test 1: Context Detection
```bash
node scripts/session-manager.js info
```
**Expected:** Shows current context (project/global)

### Test 2: Session Save
```bash
node scripts/session-manager.js save "Test session"
```
**Expected:** 
- ✅ Session saved: [timestamp].json
- 📁 Location: [path]

### Test 3: Session Load
```bash
node scripts/session-manager.js load
```
**Expected:** Displays session summary

### Test 4: Search
```bash
node scripts/session-manager.js search "test"
```
**Expected:** Finds the test session created above

### Test 5: List
```bash
node scripts/session-manager.js list
```
**Expected:** Shows recent sessions including test session

### Test 6: Help
```bash
node scripts/session-manager.js
```
**Expected:** Shows usage information

## ✅ Integration Tests

### Test 7: Project Context
```bash
# In a git repository
cd /some/git/project
node /path/to/ccm/scripts/session-manager.js info
```
**Expected:** Shows project-specific mode

### Test 8: Global Context
```bash
# Outside any project
cd ~
node /path/to/ccm/scripts/session-manager.js info
```
**Expected:** Shows global mode

## ✅ File Content Tests

### Test 9: JSON Validity
```bash
# Validate all JSON files
for file in $(find . -name "*.json"); do
  echo "Checking $file"
  node -e "JSON.parse(require('fs').readFileSync('$file', 'utf8'))"
done
```
**Expected:** No errors

### Test 10: Markdown Syntax
```bash
# Check markdown files can be parsed
for file in $(find . -name "*.md"); do
  echo "Checking $file"
  head -1 "$file"
done
```
**Expected:** All files readable

## ✅ Documentation Tests

### Test 11: README Completeness
```bash
grep -q "Installation" README.md && echo "✓ Installation section present"
grep -q "Usage" README.md && echo "✓ Usage section present"
grep -q "Examples" README.md && echo "✓ Examples section present"
```

### Test 12: Links Work
```bash
# Check for broken relative links in markdown
grep -r "](\./" *.md
# Verify all referenced files exist
```

## ✅ GitHub Preparation

### Test 13: Git Initialization
```bash
git init
git add .
git status
```
**Expected:** All files staged, no errors

### Test 14: .gitignore Works
```bash
touch node_modules/test.txt
git status
```
**Expected:** node_modules not shown in git status

### Test 15: Commit Works
```bash
git commit -m "Test commit"
```
**Expected:** Commit successful

## ✅ Cross-Platform Tests (if possible)

### Test 16: Windows
```bash
# On Windows or WSL
node scripts/session-manager.js info
```

### Test 17: macOS
```bash
# On macOS (your system)
node scripts/session-manager.js info
```

### Test 18: Linux
```bash
# On Linux
node scripts/session-manager.js info
```

## ✅ Security Tests

### Test 19: No Sensitive Data
```bash
grep -r "password\|secret\|token\|key" . --exclude-dir=.git
```
**Expected:** Only documentation references, no actual secrets

### Test 20: File Permissions
```bash
find . -type f -perm -002
```
**Expected:** No world-writable files

## ✅ Performance Tests

### Test 21: Startup Time
```bash
time node scripts/session-manager.js info
```
**Expected:** < 1 second

### Test 22: Large Session Search
```bash
# Create 100 test sessions
for i in {1..100}; do
  node scripts/session-manager.js save "Test $i"
done

# Test search performance
time node scripts/session-manager.js search "Test"
```
**Expected:** < 2 seconds

## ✅ User Experience Tests

### Test 23: Clear Error Messages
```bash
# Test invalid command
node scripts/session-manager.js invalid
```
**Expected:** Helpful error message, not crash

### Test 24: Empty Search
```bash
node scripts/session-manager.js search "nonexistent_query_12345"
```
**Expected:** "No matching sessions found"

### Test 25: Help Accessibility
```bash
node scripts/session-manager.js --help
node scripts/session-manager.js -h
```
**Expected:** Shows help message

## ✅ Final Checks

- [ ] All tests passed
- [ ] No console errors
- [ ] Documentation accurate
- [ ] Examples work
- [ ] Ready for GitHub

## 🚀 Publish Checklist

After all tests pass:

1. [ ] Update version if needed
2. [ ] Create git repository
3. [ ] Push to GitHub
4. [ ] Create v1.0.0 release
5. [ ] Update URLs in README
6. [ ] Test installation from GitHub
7. [ ] Write announcement post

---

**Test Date:** _________________

**Tested By:** _________________

**Result:** ☐ PASS  ☐ FAIL

**Notes:**
___________________________________________
___________________________________________
___________________________________________
