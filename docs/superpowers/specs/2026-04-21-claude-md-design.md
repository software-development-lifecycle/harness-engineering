# CLAUDE.md Design

## Summary

Add a `CLAUDE.md` file at the project root to make the Harness Engineering repo Claude Code-aware. The file gives Claude Code minimal context to work effectively — what the project is, where key docs live, and what conventions to follow.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Approach | Minimal pointer (Approach A) | Avoids duplicating the best-practices guide; low maintenance |
| Length | ~25-30 lines | Enough context without bloating the initial prompt |
| Language | English | CLAUDE.md is consumed by Claude Code, not human guideline prose |
| Content scope | Map, not knowledge dump | Point to authoritative docs rather than inlining rules |

## File

**Location:** `CLAUDE.md` (project root)

## Content Structure

### Section 1: Project Overview (~3 lines)

- Harness Engineering is a methodology for managing AI memory in software development
- This repo contains methodology docs, guidelines, templates, and a reference memory structure
- Core idea: AI loses memory each session; this system provides structured external memory to reload the right context

### Section 2: Key Documents (~5 lines)

A pointer table with 4 entries:

| Document | Path | When to read |
|---|---|---|
| README | `README.md` | Project overview and structure |
| Best Practices | `guideline/memory-management-best-practices.md` | Before creating or editing any memory files |
| Templates | `guideline/templates/` | When scaffolding new memory files |
| HARNESS.yaml | `memory/HARNESS.yaml` | To understand the memory store layout |

### Section 3: Project Structure (~8 lines)

Brief description of top-level directories:
- `guideline/` — methodology documentation, best practices guide, and templates (technical/domain/rules)
- `memory/` — reference memory structure with HARNESS.yaml and 3 stores, each containing a `_registry.yaml`
- `docs/superpowers/` — design specs and implementation plans

### Section 4: Working Conventions (~8 lines)

- Documentation language: Vietnamese for guideline prose, English for code examples and YAML frontmatter
- Branch strategy: `develop` for active work, `main` for stable releases
- Commit style: conventional commits (`feat:`, `fix:`, `docs:`)
- Memory files use YAML frontmatter metadata header (see `guideline/templates/` for format)
- When adding or editing memory content, always update the corresponding `_registry.yaml` to stay in sync
- Follow SOLID principles for memory as described in the best-practices guide

## Out of Scope

- `.claude/settings.json` configuration (tool permissions, hooks)
- Inlining memory management rules or SOLID principles (these live in the best-practices guide)
- Auto-loading memory files on session start (would require hooks, separate concern)
