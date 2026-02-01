# Contributing to CCM

Thank you for your interest in contributing to Claude Code Memory Management!

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/rexzhen/ccm.git
   cd claude-code-memory-management
   ```

2. **Test Your Changes**
   ```bash
   # Test the core script
   node scripts/session-manager.js info
   node scripts/session-manager.js load
   node scripts/session-manager.js save "Test message"

   # Test with Claude Code
   claude --plugin-dir /path/to/your/ccm
   ```

3. **Make Your Changes**
   - Keep code simple and readable
   - Add comments for complex logic
   - Follow existing code style
   - Ensure cross-platform compatibility

## Code Style

- Use 2 spaces for indentation
- Use descriptive variable names
- Add JSDoc comments for functions
- Keep functions focused and small
- Use ES6+ features where appropriate

## Testing Checklist

Before submitting a PR:

- [ ] Test on your local machine
- [ ] Test in both project and global contexts
- [ ] Verify all commands work (load, save, search, info, list)
- [ ] Check cross-platform compatibility (if possible)
- [ ] Update README.md if adding features
- [ ] Add comments to complex code

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clear commit messages
   - Keep commits focused and atomic

3. **Test thoroughly**
   - Test all modified functionality
   - Test in different scenarios

4. **Submit PR**
   - Provide clear description of changes
   - Reference any related issues
   - Include screenshots if UI-related

## Feature Ideas

Looking for something to work on? Here are some ideas:

- [ ] Add session tagging/labeling system
- [ ] Implement session archiving by date range
- [ ] Add session export to different formats (PDF, HTML)
- [ ] Create web-based session viewer
- [ ] Add AI-powered session summarization (optional Python integration)
- [ ] Implement session merging/combining
- [ ] Add session statistics and analytics
- [ ] Create session templates
- [ ] Add configuration file support
- [ ] Implement session encryption for sensitive data

## Bug Reports

Found a bug? Please open an issue with:

- Description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Your environment (OS, Node version, Claude Code version)
- Relevant logs or error messages

## Questions?

Feel free to open an issue with the "question" label.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
