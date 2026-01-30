# Git Conventions

## Branches
- Default branch: `main`
- Branch naming: `{type}/{short-description}`
  - Types: `feature`, `fix`, `chore`, `docs`, `refactor`, `hotfix`
  - Example: `feature/auth-flow`

## Commits
- Use Conventional Commits style: `{type}: {summary}`
  - Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`
  - Example: `feat: add sms classification endpoint`
- Keep summary in imperative mood, <= 72 chars

## PRs / Merges
- Prefer small, focused PRs
- Link related issues or tickets if available
- Include brief test notes in the PR description

## Repo Hygiene
- Do not commit secrets or credentials
- Keep generated artifacts out of git (see `.gitignore`)
