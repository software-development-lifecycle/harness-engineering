# Dynamic Knowledge File Lookup — Design Spec

**Date:** 2026-04-23
**Status:** Approved
**Scope:** Replace hardcoded knowledge file list in memory-building with plan-driven dynamic lookup

## Summary

Currently, `memory-building.md` maintains a hardcoded list of language knowledge files. This doesn't scale — every new knowledge file requires editing the skill. This design changes the flow so that `memory:analyze` detects and confirms the tech stack with the user, writes it into the plan, and `memory:building` dynamically discovers the matching knowledge file by convention-based name matching.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Tech stack detection in document mode | Extract from docs first, ask user if not found (D-fallback) | Documents often mention technologies; only ask when nothing is found |
| Tech stack detection in source mode | Detect from config files, confirm with user | Already detects; just needs an explicit confirmation step |
| Knowledge file mapping | Convention-based name matching (tech keyword → filename) | Zero configuration, self-discovering, no maintenance |
| Plan output format | No change — already has `Tech Stack` field | Existing format is sufficient |
| Documentation updates | None — README and skills-guide list files for humans, not consumed by skills | Human docs don't need to change for this architectural fix |

## Changes

### 1. `memory-analyze.md` — Add tech stack confirmation

**Source mode (Phase 2, Step 3):** After detecting the tech stack from config files, add a confirmation step before proceeding to Step 4:

> I detected the following tech stack: **[tech stack]**
> Is this correct? Anything to add or change?

Wait for user confirmation. Update the tech stack based on user feedback.

**Document mode (Phase 2, Step 3):** Add tech stack resolution with fallback:

1. Extract technology mentions from the documents (language names, frameworks, libraries, tools)
2. If tech mentions found: propose for confirmation — "I noticed mentions of **[tech list]** — is this the project's tech stack?"
3. If no tech mentions found: ask directly — "What is the project's tech stack? (languages, frameworks, key libraries)"
4. Wait for user confirmation

The confirmed tech stack is written into the plan's `Tech Stack` field (already part of the plan template — no format change needed).

### 2. `memory-building.md` — Replace hardcoded list with dynamic discovery

**Remove:** The current Knowledge Files section listing specific files (`java.md`, `nodejs.md`, etc.)

**Replace with:** Dynamic discovery instructions:

1. Read the `Tech Stack` field from the plan
2. List files in `memory-building-knowledge/` directory
3. Match tech stack keywords to file names by convention (e.g. "Kotlin" → `kotlin.md`, "Java" → `java.md`, "Node.js" → `nodejs.md`, "C#" → `csharp.md`)
4. If a matching file exists, read it and use as guidance
5. If no matching file exists, proceed with general analysis using the plan's content outline

### Naming Convention

Knowledge files are named by the primary language/platform keyword in lowercase:

| Tech Stack Keyword | File Name |
|---|---|
| Java | `java.md` |
| Kotlin | `kotlin.md` |
| Node.js / TypeScript | `nodejs.md` |
| Python | `python.md` |
| C# / .NET | `csharp.md` |
| Go | `go.md` |

New knowledge files follow the same convention — lowercase keyword, no spaces, `.md` extension.

## Files Changed

| Action | File | What Changes |
|---|---|---|
| Modify | `bin/skills/memory-analyze.md` | Add tech stack confirmation in source mode; add tech stack detection + fallback in document mode |
| Modify | `bin/skills/memory-building.md` | Replace hardcoded knowledge file list with dynamic discovery instructions |

## Files NOT Changed

- `README.md` — human documentation, not consumed by skills
- `guideline/skills-guide.md` — human documentation, not consumed by skills
- `bin/init.sh` — already copies entire `memory-building-knowledge/` directory
- Plan output format — already has `Tech Stack` field

## Benefits

- **Adding a new knowledge file = dropping a `.md` file.** No other files need to change.
- **Removing the hardcoded list eliminates a scaling bottleneck.** The skill works with any number of knowledge files.
- **Tech stack is always user-confirmed.** Both source and document modes confirm before writing to the plan.

## Out of Scope

- Changes to knowledge file content or format
- Changes to plan output format
- Changes to human-facing documentation (README, skills guide)
- Fuzzy matching or alias support (convention-based naming is sufficient)
