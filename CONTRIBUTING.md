# Contributing to AICBot

Thank you for your interest in contributing to AICBot! This document provides guidelines and
information to help you contribute effectively.

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher (or yarn v1.22.0+)
- **Git**: v2.30.0+
- **Docker**: v20.0.0+ (for containerized development)
- **VS Code**: Recommended IDE with suggested extensions

### Initial Setup

1. **Fork the Repository**

   ```bash
   # Fork the repository on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/aicbot.git
   cd aicbot
   ```

2. **Add Upstream Remote**

   ```bash
   git remote add upstream https://github.com/original-org/aicbot.git
   ```

3. **Install Dependencies**

   ```bash
   npm install
   ```

4. **Set Up Environment**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration (use test values for development)
   ```

5. **Start Development Servers**
   ```bash
   npm run dev
   ```

## 📋 Development Workflow

### 1. Create a Feature Branch

Always create a new branch for your work:

```bash
# Sync with upstream main
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name
# or for bug fixes
git checkout -b fix/your-bug-fix
```

### Branch Naming Conventions

- `feature/feature-name`: New features
- `fix/bug-description`: Bug fixes
- `docs/documentation-update`: Documentation changes
- `refactor/code-improvement`: Code refactoring
- `test/add-tests`: Adding or improving tests
- `chore/maintenance`: Maintenance tasks

### 2. Development Guidelines

#### Code Style

We use ESLint and Prettier for code formatting. Configuration is provided in the repository:

```bash
# Check code style
npm run lint

# Fix code style automatically
npm run lint:fix

# Format code
npm run format
```

#### Code Standards

- **JavaScript/TypeScript**: Use modern ES6+ syntax
- **React**: Functional components with hooks
- **CSS**: CSS Modules or styled-components
- **File Naming**: kebab-case for files, PascalCase for components
- **Variable Naming**: camelCase for variables, UPPER_CASE for constants

#### Example Code Structure

```jsx
// components/MessageInput/MessageInput.jsx
import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import styles from './MessageInput.module.css';

/**
 * Message input component for chat interface
 * @param {Object} props - Component props
 * @param {Function} props.onSend - Function called when message is sent
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {string} props.placeholder - Input placeholder text
 */
const MessageInput = ({ onSend, disabled = false, placeholder }) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = e => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      inputRef.current?.focus();
    }
  };

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        className={styles.input}
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={4000}
      />
      <Button type="submit" disabled={disabled || !message.trim()} variant="primary">
        Send
      </Button>
    </form>
  );
};

MessageInput.propTypes = {
  onSend: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
};

export default MessageInput;
```

### 3. Testing

#### Testing Requirements

All contributions must include appropriate tests:

- **Unit Tests**: For individual functions and components
- **Integration Tests**: For API endpoints and service integration
- **E2E Tests**: For critical user flows

#### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- MessageInput.test.js
```

#### Writing Tests

```jsx
// components/MessageInput/MessageInput.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MessageInput from './MessageInput';

describe('MessageInput', () => {
  const mockOnSend = jest.fn();

  beforeEach(() => {
    mockOnSend.mockClear();
  });

  test('renders input and send button', () => {
    render(<MessageInput onSend={mockOnSend} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  test('calls onSend when form is submitted with message', async () => {
    const user = userEvent.setup();
    render(<MessageInput onSend={mockOnSend} />);

    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button', { name: /send/i });

    await user.type(input, 'Hello world');
    await user.click(button);

    expect(mockOnSend).toHaveBeenCalledWith('Hello world');
    expect(input).toHaveValue('');
  });

  test('disables input and button when disabled prop is true', () => {
    render(<MessageInput onSend={mockOnSend} disabled />);

    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
  });
});
```

#### Coverage Requirements

- Maintain minimum 80% code coverage
- 100% coverage for critical security-related code
- All new features must have corresponding tests

### 4. Documentation

Documentation is a critical part of contributions:

#### Code Documentation

- Use JSDoc comments for functions and components
- Document complex logic with inline comments
- Update README files for new features

#### README Updates

When adding new features:

1. Update the main README.md if it affects the overall application
2. Update package-specific READMEs for backend/frontend changes
3. Add API documentation for new endpoints
4. Update configuration documentation for new environment variables

#### Example Documentation

```javascript
/**
 * Authenticates a user with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} Authentication response with user data and token
 * @throws {Error} When authentication fails
 * @example
 * try {
 *   const result = await authenticate('user@example.com', 'password123');
 *   console.log('User authenticated:', result.user);
 * } catch (error) {
 *   console.error('Authentication failed:', error.message);
 * }
 */
const authenticate = async (email, password) => {
  // Implementation...
};
```

## 🔄 Commit Guidelines

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without changing functionality
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes

#### Examples

```bash
feat(chat): add message streaming support

Implement real-time message streaming using WebSocket connections.
Updates MessageInput component to handle streaming responses and adds
TypingIndicator component for better UX.

Closes #123

fix(auth): resolve JWT token expiration issue

Update token refresh logic to handle edge cases where tokens expire
mid-request. Add retry mechanism for failed requests.

docs(api): update authentication endpoints documentation

Add examples for token refresh and error handling. Update response
schemas to match current API implementation.
```

### Pre-commit Hooks

We use Husky for pre-commit hooks:

```bash
# Install husky hooks
npm run prepare

# Hooks will automatically run:
# - lint-staged (linting and formatting)
# - type checking (if using TypeScript)
# - unit tests for changed files
```

## 📤 Pull Request Process

### 1. Before Submitting

Ensure your contribution is ready:

- [ ] Code follows project style guidelines
- [ ] All tests pass (`npm test`)
- [ ] Test coverage is maintained or improved
- [ ] Documentation is updated
- [ ] Commit messages follow conventional commits
- [ ] No console.log statements in production code
- [ ] No TODO comments without associated issues

### 2. Creating a Pull Request

1. **Push to Your Fork**

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Use GitHub's Pull Request interface
   - Choose correct base branch (usually `main`)
   - Link related issues using `Closes #123` or `Fixes #123`
   - Fill out the PR template completely

3. **PR Template**

```markdown
## Description

Brief description of changes and their purpose.

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as
      expected)
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass (if applicable)
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Environment variables documented (if applicable)
- [ ] Security considerations addressed

## Additional Notes

Any additional context or considerations for reviewers.
```

### 3. Review Process

#### What to Expect

1. **Automated Checks**: CI will run tests, linting, and type checking
2. **Code Review**: At least one maintainer will review your changes
3. **Feedback**: Address review comments promptly
4. **Approval**: Once approved, your PR will be merged

#### Review Guidelines

- Be responsive to review feedback
- Explain complex decisions in comments
- Update tests based on review suggestions
- Keep PRs focused and reasonably sized

#### Merge Requirements

- All automated checks must pass
- At least one maintainer approval
- No merge conflicts
- Documentation is complete

## 🏗️ Project Structure

### Monorepo Organization

This project uses a monorepo structure:

```
aicbot/
├── packages/
│   ├── backend/     # Node.js API server
│   └── frontend/    # React PWA application
├── docs/           # Additional documentation
├── scripts/        # Build and utility scripts
└── docker/         # Docker configurations
```

### Working with Packages

#### Backend Development

```bash
cd packages/backend
npm run dev          # Start backend in development
npm test             # Run backend tests
npm run lint         # Lint backend code
```

#### Frontend Development

```bash
cd packages/frontend
npm start           # Start frontend in development
npm test            # Run frontend tests
npm run lint        # Lint frontend code
```

#### Root-level Commands

```bash
npm run dev:backend     # Start backend only
npm run dev:frontend    # Start frontend only
npm run dev             # Start both frontend and backend
npm run test            # Run all tests
npm run lint            # Lint all packages
npm run build           # Build all packages
```

## 🛠️ Development Tools

### Recommended VS Code Extensions

Install these extensions for optimal development experience:

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-jest",
    "humao.rest-client",
    "ms-vscode-remote.remote-containers"
  ]
}
```

### VS Code Settings

Add these settings to your `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

### Debug Configuration

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/packages/backend/src/app.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "restart": true,
      "runtimeExecutable": "nodemon"
    },
    {
      "name": "Debug Frontend",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}/packages/frontend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["start"]
    }
  ]
}
```

## 🔒 Security Guidelines

### Security Considerations

- Never commit API keys, secrets, or sensitive data
- Use environment variables for configuration
- Validate all user inputs
- Follow OWASP security guidelines
- Report security vulnerabilities privately

### Security Best Practices

```javascript
// Good: Input validation
const messageSchema = Joi.object({
  message: Joi.string().required().max(4000).sanitize(),
  userId: Joi.string().uuid().required(),
});

// Bad: Direct string concatenation in queries
const query = `SELECT * FROM users WHERE name = '${userName}'`; // SQL injection risk

// Good: Parameterized queries
const query = 'SELECT * FROM users WHERE name = ?';
db.query(query, [userName]);
```

### Reporting Security Issues

If you discover a security vulnerability:

1. Do not open a public issue
2. Email security@aicbot.com with details
3. Include steps to reproduce
4. We'll respond within 48 hours
5. We'll credit you in our security acknowledgments

## 🐛 Bug Reports

### Bug Report Template

When reporting bugs, use this template:

```markdown
**Bug Description** Clear and concise description of the bug

**Steps to Reproduce**

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior** What you expected to happen

**Actual Behavior** What actually happened

**Screenshots** Add screenshots to help explain your problem

**Environment**

- OS: [e.g. macOS 13.0]
- Browser: [e.g. Chrome 108]
- Version: [e.g. 1.2.3]

**Additional Context** Add any other context about the problem here
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Feature Description** Clear and concise description of the feature

**Problem Statement** What problem does this feature solve?

**Proposed Solution** How you envision this feature working

**Alternatives Considered** Other approaches you've considered

**Additional Context** Any additional context or screenshots
```

## 📚 Resources

### Learning Resources

- [React Documentation](https://react.dev)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [JavaScript Style Guide](https://standardjs.com)
- [Git Workflow Guide](https://www.atlassian.com/git/tutorials/comparing-workflows)

### Project Documentation

- [API Documentation](./packages/backend/README.md)
- [Frontend Documentation](./packages/frontend/README.md)
- [Deployment Guide](./docs/deployment.md)
- [Architecture Overview](./README.md#architecture)

## 🤝 Community

### Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Discord**: Join our community Discord (link in README)
- **Email**: dev@aicbot.com for private questions

### Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please read and follow our
[Code of Conduct](./CODE_OF_CONDUCT.md).

## 🏆 Recognition

### Contributors

All contributors are recognized in:

- README.md contributors section
- Release notes for their contributions
- Annual contributor appreciation post

### Types of Contributions

We value all types of contributions:

- Code contributions
- Documentation improvements
- Bug reports and triage
- Feature suggestions
- Community support
- Design contributions
- Translation work

## 📈 Release Process

### Version Management

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Schedule

- **Major releases**: As needed, with extensive testing
- **Minor releases**: Bi-weekly or when feature set is complete
- **Patch releases**: As needed for critical bugs

### Changelog

All significant changes are documented in [CHANGELOG.md](./CHANGELOG.md).

---

Thank you for contributing to AICBot! Your contributions help make this project better for everyone.
🎉
