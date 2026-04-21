# Harness Engineering

A methodology for managing AI memory in software development. AI loses memory each session — this system provides structured external memory (technical, domain, rules) to reload the right context.

This repo contains the methodology documentation, guidelines, templates, and a reference memory structure.

## Key Documents

| Document | Path | When to read |
|---|---|---|
| README | `README.md` | Project overview and structure |
| Best Practices | `guideline/memory-management-best-practices.md` | Before creating or editing any memory files |
| Templates | `guideline/templates/` | When scaffolding new memory files |
| HARNESS.yaml | `memory/HARNESS.yaml` | To understand the memory store layout |

## Project Structure

- `guideline/` — methodology documentation, best practices guide, templates, and supporting assets (images, diagrams)
- `guideline/templates/` — scaffold templates and worked examples for each memory store
- `memory/` — reference memory structure with `HARNESS.yaml` and 3 stores, each containing a `_registry.yaml`
- `docs/superpowers/` — design specs and implementation plans

## Working Conventions

- **Documentation language:** English for all content
- **Branch strategy:** `develop` for active work, `main` for stable releases
- **Commit style:** conventional commits (`feat:`, `fix:`, `docs:`)
- **Memory file format:** YAML frontmatter metadata header (see `guideline/templates/` for format)
- **Registry sync:** when adding or editing memory content, always update the corresponding `_registry.yaml`
- **SOLID for memory:** follow the principles described in `guideline/memory-management-best-practices.md`
