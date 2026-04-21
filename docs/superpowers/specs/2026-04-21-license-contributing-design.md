# License & Contributing Design

## Summary

Add MIT license, a minimal contributing guide, and update the README to replace the license TODO. Three files touched: `LICENSE` (create), `CONTRIBUTING.md` (create), `README.md` (modify).

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| License | MIT | Permissive, simple, widely understood |
| Copyright holder | CongNT (ntcong85@gmail.com) | Personal project, not company-owned |
| Copyright year | 2026 | Current year |
| Contributing scope | Minimal | Small-team project; essentials only |
| Contributing language | English | Consistent with CLAUDE.md and getting-started guide |
| README update | Replace TODO with license link | Remove known incomplete item |

## Files

### 1. LICENSE (create)

**Location:** `LICENSE` at project root

Standard MIT license text with copyright line:

```
MIT License

Copyright (c) 2026 CongNT (ntcong85@gmail.com)
```

Followed by the standard MIT permission notice, warranty disclaimer, and liability clause. No modifications to the standard text.

### 2. CONTRIBUTING.md (create)

**Location:** `CONTRIBUTING.md` at project root

~30 lines, 5 sections:

**How to Contribute (~3 lines)**
- Fork or clone the repo
- Create a branch from `develop`
- Submit a PR to `develop`

**Branch Strategy (~3 lines)**
- `develop` — active work, all PRs target this branch
- `main` — stable releases only

**Commit Conventions (~5 lines)**
- Use conventional commits: `feat:`, `fix:`, `docs:`
- Keep messages concise (1-2 sentences)
- Focus on the "why", not the "what"

**Memory Files (~5 lines)**
- Follow `guideline/memory-management-best-practices.md` when creating or editing memory files
- Always update the corresponding `_registry.yaml` when adding, modifying, or removing memory files
- Use templates from `guideline/templates/` for scaffolding

**Review Process (~3 lines)**
- All changes go through PR review before merging to `develop`
- Merges to `main` require approval from the project owner

### 3. README.md (modify)

**Change:** Replace the existing license section:

```markdown
## License

TODO: Add license information.
```

With:

```markdown
## License

This project is licensed under the [MIT License](LICENSE).
```

## Out of Scope

- Code of conduct
- Issue templates
- PR templates
- CLA (Contributor License Agreement)
