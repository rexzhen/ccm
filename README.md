# Claude Code Memory Management (CCM)

![CCM Social Preview](assets/images/social-preview.png)

![Version](https://img.shields.io/badge/version-1.0.4-blue)
![License](https://img.shields.io/badge/license-MIT-green)

> **Ever wished Claude Code remembered your previous conversations?**
>
> CCM automatically saves every session, loads context when you return, and helps you search past conversations—so you never lose progress or repeat yourself.

## 💭 What Problem Does This Solve?

**Without CCM:**
- 😞 Each new session starts from scratch—Claude has no memory of previous work
- 🔍 Can't search through past conversations to find what you discussed
- 📝 Need to manually copy important decisions or code snippets before exiting
- 🔄 Repeat explanations every time you start a new session

**With CCM:**
- ✅ Automatic session continuity—previous context loads on startup
- 🔍 Search your entire conversation history across all projects
- 💾 Zero effort—everything saved automatically when you exit
- 🎯 Context-aware—each project has its own conversation history

**Perfect for:**
- Long-running projects with multiple sessions
- Teams wanting to track decision history
- Developers switching between multiple projects
- Anyone who values conversation continuity

## ✨ Features

- 🔄 **Auto-save**: Sessions automatically saved when you exit Claude Code
- 📋 **Auto-load**: Latest summary displayed at session start
- 🎯 **Context-aware**: Detects project vs global context automatically
- 🔍 **Search**: Search past conversations in current context
- 📁 **Organized**: Clean directory structure per project
- 🧹 **Auto-cleanup**: Automatically manages disk space with 500 MB default limit
- 🚀 **Zero dependencies**: Pure Node.js, no installation required

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/rexzhen/ccm ~/ccm-plugin

# Add as a marketplace
claude plugin marketplace add ~/ccm-plugin

# Install the plugin
claude plugin install ccm
```

That's it! The plugin is now active and will automatically manage your sessions.

### Usage

**Automatic operation (no commands needed):**
1. Start Claude Code → Last session summary loads automatically
2. Have your conversation → Transcript captured automatically
3. Exit Claude Code → Session saved automatically with cleanup

**Manual commands:**
```bash
/ccm-save "Custom message"    # Manually save session
/ccm-history                   # Browse recent sessions
/ccm-history "search query"    # Search past sessions
```

## 📖 Documentation

- **[How It Works](docs/HOW-IT-WORKS.md)** - Architecture, storage behavior, and project detection
- **[Usage Examples](docs/EXAMPLES.md)** - Real-world scenarios and workflows
- **[FAQ](docs/FAQ.md)** - Common questions and troubleshooting

## 💡 Key Concepts

### Automatic Context Detection

CCM automatically detects your working environment:

```
First session in new folder → Uses ~/.claude/sessions/ (global)
After .claude created       → Switches to <project>/.claude/sessions/
                             (automatic, seamless transition)
```

**Why this matters:**
- Works immediately without setup
- Seamlessly transitions when project is initialized
- Each context has independent 500 MB storage limit
- Zero configuration needed

### Storage Management

- **Default limit**: 500 MB per context (project or global)
- **Auto-cleanup**: Runs on session exit, deletes oldest sessions first
- **Configurable**: Edit `.claude-plugin/config.json` to adjust limit
- **Zero maintenance**: Completely automatic

[Learn more about storage management →](docs/HOW-IT-WORKS.md#storage-management)

## 🎯 Common Scenarios

### Working on Multiple Projects

```bash
cd ~/project-a && claude  # Sessions in project-a/.claude/sessions/
cd ~/project-b && claude  # Sessions in project-b/.claude/sessions/
```

Each project maintains its own independent session history.

### Quick Questions Outside Projects

```bash
cd ~ && claude  # Sessions in ~/.claude/sessions/ (global)
```

Global sessions don't clutter project history.

### First Time in a New Directory

Day 1: No `.claude` folder yet → Uses global sessions
Day 2: `.claude` created automatically → Switches to project sessions

[See more examples →](docs/EXAMPLES.md)

## 🛠️ Configuration

Edit `.claude-plugin/config.json` to customize:

```json
{
  "maxStorageMB": 500,           // Storage limit in MB
  "cleanupEnabled": true,        // Auto-cleanup on/off
  "preserveLatestSummary": true  // Always keep latest.md
}
```

**Common configurations:**
- Conservative: `"maxStorageMB": 100`
- Generous: `"maxStorageMB": 1000`
- Disable cleanup: `"cleanupEnabled": false` (not recommended)

## 📂 Directory Structure

### Project Sessions
```
your-project/
├── .claude/
│   └── sessions/
│       ├── 2026-01-31T14-30-22-000Z.jsonl
│       ├── summaries/
│       │   └── latest.md
│       └── archives/
└── .gitignore  # Add .claude/sessions/ here
```

### Global Sessions
```
~/.claude/
└── sessions/
    ├── 2026-01-31T14-30-22-000Z.jsonl
    ├── summaries/
    │   └── latest.md
    └── archives/
```

## 🔧 Troubleshooting

**Sessions not loading?**
```bash
/ccm-history  # Check current context and session location
```

**Want project-specific sessions?**
```bash
# Create .claude directory
mkdir .claude
# Or use Claude Code's init
/init
```

**Storage issues?**
```bash
# Check config
cat ~/.claude/plugins/ccm/.claude-plugin/config.json

# Adjust storage limit (e.g., to 1 GB)
# Edit config.json: "maxStorageMB": 1000
```

[More troubleshooting →](docs/FAQ.md#troubleshooting)

## 🗑️ Uninstallation

```bash
# Uninstall plugin
claude plugin uninstall ccm

# Optional: Remove session history
rm -rf ~/.claude/sessions/              # Global sessions
rm -rf <project>/.claude/sessions/      # Project sessions
```

**Note:** Uninstalling the plugin does NOT delete your session history. Sessions remain on disk unless explicitly removed.

[Complete uninstall guide →](docs/FAQ.md#uninstallation)

## 📚 Additional Resources

- **[FAQ](docs/FAQ.md)** - Frequently asked questions
- **[How It Works](docs/HOW-IT-WORKS.md)** - Technical details and architecture
- **[Examples](docs/EXAMPLES.md)** - Real-world usage scenarios
- **[GitHub Issues](https://github.com/rexzhen/ccm/issues)** - Report bugs or request features

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 👤 Author

Rex Zhen
- GitHub: [@rexzhen](https://github.com/rexzhen)
- Email: rex.zhen@gmail.com

## 📋 Changelog

### v1.0.4 (In Progress)
- Add automatic storage management with 500 MB default limit
- Implement configurable storage limits per context
- Add automatic cleanup on session exit
- Enhanced documentation with separate doc files
- Add FAQ, How It Works, and Examples documentation
- Add problem/solution section to README
- Add comprehensive uninstallation guide

### v1.0.4 (2026-02-01)
- Enhanced session management and summary generation
- Improved context-aware behavior

### v1.0.3 (2026-02-01)
- Fresh start with clean, simplified command structure
- Two main commands: `/ccm-save` and `/ccm-history`
- Automatic session save/load via hooks
- Full conversation transcript capture

---

**⭐ If you find CCM useful, please star the repository!**

[Report an Issue](https://github.com/rexzhen/ccm/issues) | [Request a Feature](https://github.com/rexzhen/ccm/issues/new)
