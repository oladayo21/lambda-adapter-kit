# GitHub Actions Setup

This document explains how to set up the GitHub Actions workflows for automated CI/CD.

## Required Secrets

To enable automatic publishing to npm, you need to set up the following secrets in your GitHub repository:

### NPM_TOKEN

1. Go to [npmjs.com](https://www.npmjs.com) and log in to your account
2. Click on your profile picture → "Access Tokens"
3. Click "Generate New Token" → "Classic Token"
4. Select "Automation" scope (allows publishing from CI/CD)
5. Copy the generated token
6. In your GitHub repository, go to Settings → Secrets and variables → Actions
7. Click "New repository secret"
8. Name: `NPM_TOKEN`
9. Value: Paste the npm token
10. Click "Add secret"

## Workflows Overview

### 1. CI/CD Pipeline (`ci-cd.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch  
- GitHub releases

**Runtime:** Node.js 22 LTS (latest AWS Lambda supported version)  
**Package Manager:** pnpm latest

**Jobs:**
- **test**: Runs type checking, linting, tests, and build
- **coverage**: Generates test coverage reports
- **publish**: Publishes to npm when a GitHub release is created

### 2. Release Workflow (`release.yml`)

**Triggers:**
- Manual workflow dispatch with version bump options

**Features:**
- Bumps package version (patch/minor/major/prerelease)
- Generates changelog from git commits
- Creates git tag and GitHub release
- Triggers the publish workflow automatically

### 3. PR Checks (`pr-checks.yml`)

**Triggers:**
- Pull requests to `main` branch

**Features:**
- Validates code quality and tests
- Security audit
- Package size analysis

## Publishing Process

### Automatic Publishing

1. **Create a release using the Release workflow:**
   - Go to Actions tab in GitHub
   - Select "Release" workflow
   - Click "Run workflow"
   - Choose version bump type (patch/minor/major)
   - Click "Run workflow"

2. **The workflow will:**
   - Run all tests
   - Bump package.json version
   - Create git tag
   - Create GitHub release
   - Automatically trigger npm publish

### Manual Publishing

If you prefer manual releases:

1. **Bump version locally:**
   ```bash
   pnpm version patch  # or minor, major
   ```

2. **Push tag:**
   ```bash
   git push origin main --tags
   ```

3. **Create GitHub release:**
   - Go to GitHub → Releases → "Create a new release"
   - Select the tag you just pushed
   - Add release notes
   - Publish release

4. **npm publish happens automatically** when GitHub release is created

## Version Strategy

- **patch**: Bug fixes (0.1.0 → 0.1.1)
- **minor**: New features, backward compatible (0.1.0 → 0.2.0)  
- **major**: Breaking changes (0.1.0 → 1.0.0)
- **prerelease**: Pre-release versions (0.1.0 → 0.1.1-0)

## Security Features

- **npm provenance**: Enabled for supply chain security
- **Dependency auditing**: Runs on every PR
- **Minimal permissions**: Workflows use least-privilege principle
- **Artifact verification**: Build artifacts are uploaded and verified

## Troubleshooting

### npm publish fails

1. **Check NPM_TOKEN secret** is correctly set
2. **Verify npm account permissions** for the package name
3. **Check if version already exists** on npm
4. **Review workflow logs** for specific error messages

### Version conflicts

1. **Ensure no pending changes** before running release workflow
2. **Check if tag already exists** locally or remotely
3. **Verify package.json version** matches git tag

### Test failures

1. **All tests must pass** before publishing
2. **Check test output** in workflow logs
3. **Run tests locally** to debug: `pnpm test`
4. **Verify build works**: `pnpm build`

## Local Development

Always test workflows locally before pushing:

```bash
# Install dependencies
pnpm install

# Run all checks (same as CI)
pnpm typecheck
pnpm lint  
pnpm test:run
pnpm build

# Test version bump (don't commit)
pnpm version patch --no-git-tag-version
git checkout package.json  # reset changes
```