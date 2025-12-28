# Code Formatting and Linting Setup

This project uses Prettier for code formatting and ESLint for linting, with automatic pre-commit hooks.

## Setup

### Prettier
- **Backend**: Configuration in `backend/.prettierrc.json`
- **Frontend**: Configuration in `frontend/.prettierrc.json`

### ESLint
- **Backend**: Configuration in `backend/.eslintrc.json`
- **Frontend**: Configuration in `frontend/.eslintrc.json`

### Pre-commit Hooks
- Uses **Husky** and **lint-staged** to automatically format and lint code before commits
- Configuration in `.lintstagedrc.json`

## Available Scripts

### Root Level
```bash
# Format all code
npm run format:all

# Lint all code
npm run lint:all

# Format backend only
npm run format:backend

# Format frontend only
npm run format:frontend
```

### Backend
```bash
# Format code
npm run format

# Check formatting (without fixing)
npm run format:check

# Lint code
npm run lint

# Lint and fix issues
npm run lint:fix
```

### Frontend
```bash
# Format code
npm run format

# Check formatting (without fixing)
npm run format:check

# Lint code
npm run lint

# Lint and fix issues
npm run lint:fix
```

## Pre-commit Behavior

When you commit code, the pre-commit hook will automatically:
1. Format staged files with Prettier
2. Run ESLint and auto-fix issues on staged files
3. Only allow the commit if all checks pass

## Manual Formatting

If you want to format all files manually:

```bash
# Backend
cd backend && npm run format

# Frontend
cd frontend && npm run format

# Both
npm run format:all
```

## Configuration Files

- `.prettierrc.json` - Prettier configuration
- `.prettierignore` - Files to ignore when formatting
- `.eslintrc.json` - ESLint configuration
- `.lintstagedrc.json` - lint-staged configuration (which files to check)
- `.husky/pre-commit` - Pre-commit hook script

