# Contributing to lambda-adapter-kit

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

### Prerequisites

- Node.js 20+ (recommended: 22 LTS)
- pnpm (recommended package manager)
- Git

### Getting Started

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/your-username/lambda-adapter-kit.git
   cd lambda-adapter-kit
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Run tests to verify setup:**
   ```bash
   pnpm test
   ```

## Development Workflow

### Code Style

This project uses [Biome](https://biomejs.dev/) for linting and formatting:

```bash
# Check code style
pnpm lint

# Fix auto-fixable issues
pnpm lint:fix

# Format code
pnpm format
```

### Testing

We use [Vitest](https://vitest.dev/) for testing:

```bash
# Run tests in watch mode
pnpm test

# Run tests once
pnpm test:run

# Run tests with coverage
pnpm test:coverage
```

### Type Checking

```bash
# Type check TypeScript
pnpm typecheck
```

### Building

```bash
# Build the library
pnpm build

# Build in watch mode
pnpm dev
```

## Making Changes

### Branching Strategy

- `main` - Production branch
- `feature/your-feature` - Feature branches
- `fix/issue-description` - Bug fix branches

### Commit Messages

We follow conventional commit format:

```
type(scope): description

- feat: new feature
- fix: bug fix  
- docs: documentation changes
- test: test changes
- refactor: code refactoring
- chore: build process or auxiliary tool changes
```

Examples:
```
feat(converter): add support for API Gateway v2 events
fix(handler): handle missing content-type header
docs: update README with new converter examples
test(converter): add tests for binary content detection
```

### Code Guidelines

#### Comments
- Add comments only where necessary to understand complex logic
- Focus on explaining "why" rather than "what"
- Document integration points and AWS Lambda specifics

#### TypeScript
- Use strict TypeScript settings
- Add proper type annotations for public APIs
- Prefer interfaces over types for public APIs

#### Testing
- Write tests for all new functionality
- Include edge cases and error scenarios
- Use descriptive test names
- Follow existing test patterns

### Adding New Features

1. **Create feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the guidelines above

3. **Add tests** for your new functionality

4. **Update documentation** if needed

5. **Run all checks:**
   ```bash
   pnpm typecheck
   pnpm lint
   pnpm test:run
   pnpm build
   ```

6. **Commit and push:**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature-name
   ```

7. **Create pull request** on GitHub

## Project Structure

```
src/
├── index.ts         # Main adapter implementation
├── handler.ts       # Lambda handler utilities
├── converter.ts     # Event conversion utilities
└── utils.ts         # Utility functions

test/
├── utils.test.ts      # Utility function tests
└── converter.test.ts  # Event conversion tests

.github/
├── workflows/         # GitHub Actions workflows
└── SETUP.md          # Workflow setup guide

docs/                 # Additional documentation
```

## Pull Request Process

### Before Submitting

- [ ] All tests pass locally
- [ ] Code follows style guidelines
- [ ] New functionality has tests
- [ ] Documentation is updated
- [ ] No breaking changes (or clearly documented)

### PR Template

When creating a PR, include:

1. **Description**: What does this PR do?
2. **Motivation**: Why is this change needed?
3. **Testing**: How was this tested?
4. **Breaking Changes**: Any breaking changes?
5. **Checklist**: Complete the checklist above

### Review Process

1. **Automated checks** must pass (CI/CD)
2. **Code review** by maintainers
3. **Approval** required before merge
4. **Squash merge** preferred for clean history

## Release Process

Releases are automated via GitHub Actions:

1. **Manual release** via GitHub Actions workflow
2. **Version bumping** (patch/minor/major)
3. **Automated publishing** to npm
4. **GitHub release** with changelog

See [.github/SETUP.md](.github/SETUP.md) for details.

## Getting Help

- **Issues**: Open an issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check README and inline code docs

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers get started
- Follow GitHub's community guidelines

## Recognition

Contributors will be recognized in:
- Git commit history
- GitHub contributors list
- Release notes (for significant contributions)

Thank you for contributing! 🎉