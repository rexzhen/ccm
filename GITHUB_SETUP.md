# GitHub Repository Setup Guide

Step-by-step guide to create and publish your CCM plugin to GitHub.

## Prerequisites

- GitHub account
- Git installed
- GitHub CLI (`gh`) installed (optional but recommended)

## Option 1: Using GitHub CLI (Recommended)

```bash
cd ccm

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: CCM plugin v1.0.0

- Context-aware session management
- Auto-save and auto-load functionality
- Search and list commands
- Project-specific and global session support
- Complete documentation"

# Create GitHub repository and push
gh repo create claude-code-memory-management \
  --public \
  --source=. \
  --description="Context-aware session management for Claude Code" \
  --remote=origin \
  --push

# Add topics/tags
gh repo edit --add-topic claude,claude-code,session-management,memory,plugin
```

## Option 2: Using GitHub Web Interface

### Step 1: Initialize Local Repository

```bash
cd ccm

git init
git add .
git commit -m "Initial commit: CCM plugin v1.0.0"
```

### Step 2: Create Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `claude-code-memory-management`
3. Description: `Context-aware session management for Claude Code`
4. Choose: Public
5. **Do NOT** initialize with README (you already have one)
6. Click "Create repository"

### Step 3: Push Your Code

GitHub will show you commands. Use these:

```bash
git remote add origin https://github.com/rexzhen/ccm.git
git branch -M main
git push -u origin main
```

## Post-Creation Setup

### Add Topics/Tags

On your GitHub repository page:
1. Click "⚙️ Settings" (or the gear icon near About)
2. Add topics: `claude`, `claude-code`, `plugin`, `session-management`, `memory`

### Create Release

```bash
# Tag the release
git tag -a v1.0.0 -m "Release v1.0.0: Initial public release"
git push origin v1.0.0

# Or via GitHub CLI
gh release create v1.0.0 \
  --title "v1.0.0 - Initial Release" \
  --notes "First stable release of CCM plugin with full session management features"
```

### Set Up GitHub Pages (Optional)

If you want a website for documentation:

```bash
gh repo edit --enable-pages --pages-branch main --pages-path docs
```

### Enable Issues and Discussions

```bash
# Enable discussions
gh repo edit --enable-discussions

# Issues are enabled by default
```

## Update URLs in Files

Now that you have a GitHub URL, update these files:

### 1. Update README.md

Replace `yourusername` with your actual GitHub username:
```bash
sed -i '' 's/yourusername/YOUR_ACTUAL_USERNAME/g' README.md
```

### 2. Update plugin.json

```bash
# Edit .claude-plugin/plugin.json
# Update the author.url and repository.url with your actual GitHub username
```

### 3. Commit the updates

```bash
git add .
git commit -m "Update repository URLs"
git push
```

## Installation URL for Users

Once published, users can install with:

```bash
git clone https://github.com/rexzhen/ccm ~/.claude/plugins/ccm
```

## Repository Settings Recommendations

### Branch Protection

1. Go to Settings → Branches
2. Add rule for `main` branch
3. Enable:
   - Require pull request reviews before merging
   - Require status checks to pass
   - Require branches to be up to date

### About Section

Add to your repository's About section:
- **Description**: Context-aware session management for Claude Code
- **Website**: Your documentation URL (if any)
- **Topics**: claude, claude-code, plugin, session-management, memory, ai-assistant

### README Badge

Add badges to README.md:

```markdown
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)
![GitHub stars](https://img.shields.io/github/stars/rexzhen/ccm)
```

## Promoting Your Plugin

### 1. Create Announcement

Post on:
- Claude Code community forums
- Reddit: r/ClaudeAI
- Twitter/X with hashtags: #ClaudeCode #AI #DevTools
- LinkedIn

### 2. Write a Blog Post

Example outline:
```markdown
# Introducing CCM: Session Memory for Claude Code

## The Problem
Context loss between Claude Code sessions...

## The Solution
CCM plugin with automatic session management...

## How It Works
[Screenshots and examples]

## Getting Started
[Installation instructions]

## Conclusion
Try it out and let me know what you think!
```

### 3. Submit to Plugin Directories

- Awesome Claude Code (if exists)
- Awesome AI Tools lists
- Product Hunt (for more visibility)

## Maintenance

### Regular Updates

```bash
# Make changes
git add .
git commit -m "Add feature X"

# Update version in package.json and plugin.json
# Then tag and release
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0

gh release create v1.1.0 \
  --title "v1.1.0 - New Features" \
  --notes "- Added feature X
- Fixed bug Y
- Improved performance"
```

### Responding to Issues

```bash
# List open issues
gh issue list

# View specific issue
gh issue view 123

# Comment on issue
gh issue comment 123 --body "Thanks for reporting!"

# Close issue
gh issue close 123
```

## Next Steps

1. ✅ Create GitHub repository
2. ✅ Push code
3. ✅ Create v1.0.0 release
4. ✅ Update URLs in files
5. ✅ Add topics and description
6. ✅ Write announcement post
7. ✅ Share with community

## Quick Commands Reference

```bash
# Clone your repo
git clone https://github.com/rexzhen/ccm

# Create branch
git checkout -b feature/new-feature

# Push branch
git push -u origin feature/new-feature

# Create PR
gh pr create --title "Add new feature" --body "Description"

# Merge PR
gh pr merge 123 --squash

# Create release
gh release create v1.1.0 --generate-notes
```

## Support

After publishing:
- Monitor GitHub Issues
- Respond to Pull Requests
- Update documentation as needed
- Release new versions with improvements

Good luck with your plugin! 🚀
