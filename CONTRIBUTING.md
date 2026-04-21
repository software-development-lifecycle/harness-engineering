# Contributing to Harness Engineering

## How to Contribute

1. Fork or clone the repository
2. Create a branch from `develop`
3. Submit a pull request to `develop`

## Branch Strategy

- `develop` — active work; all pull requests target this branch
- `main` — stable releases only; merges require project owner approval

## Commit Conventions

Use [conventional commits](https://www.conventionalcommits.org/):

- `feat:` — new feature or content
- `fix:` — bug fix or correction
- `docs:` — documentation changes

Keep messages concise (1-2 sentences). Focus on the "why", not the "what".

## Memory Files

When creating or editing memory files:

- Follow the guidelines in `guideline/memory-management-best-practices.md`
- Always update the corresponding `_registry.yaml` when adding, modifying, or removing memory files
- Use templates from `guideline/templates/` for scaffolding new files

## Review Process

- All changes go through pull request review before merging to `develop`
- Merges from `develop` to `main` require approval from the project owner
