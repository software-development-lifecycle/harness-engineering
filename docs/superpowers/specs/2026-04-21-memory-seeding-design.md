# memory:seeding — Design Spec

## Overview

`memory:seeding` is the core skill in the `memory:` toolkit. It deep-analyzes the project — from existing source code or requirements documents — and generates an initial set of high-quality memory files through an interactive, user-guided process.

The skill follows the same interaction discipline as the brainstorming pattern: one question at a time, propose then confirm, never act without approval.

## Design Principles

- **Self-contained:** the skill embeds its own analysis rules, categorization logic, template formats, and quality criteria. No runtime dependency on methodology docs, guideline files, or other skills.
- **Language-aware:** the skill loads language/framework-specific knowledge files to perform accurate, targeted analysis — not generic heuristics.
- **Interactive throughout:** the skill asks the user at every decision point. It proposes, the user decides. Like a knowledgeable colleague, not an autopilot.
- **Quality over quantity:** generates 3-5 high-quality draft memory files — a minimal seed, not a comprehensive dump.
- **Project-level:** installed as a package at `.claude/commands/memory-seeding/`. Teams can customize the main skill and add/edit language knowledge files.

## Toolkit Context

| Skill | Purpose | Relationship to seeding |
|---|---|---|
| `memory:scan` | Quick project overview, suggest next steps | May recommend running seeding |
| `memory:seeding` | Deep analysis to generate memory files | **This spec** |
| `memory:extract` | Extract knowledge from requirements docs | Future — seeding handles docs inline for now |
| `memory:interview` | Interactive Q&A to fill knowledge gaps | Future — seeding handles interview inline for now |

Each skill is self-contained with its own embedded knowledge. No skill depends on another skill's knowledge or on external methodology documentation at runtime. This is a **core architectural rule** for the entire toolkit.

## Installation

`init.sh` installs the skill package into the project:

```
.claude/commands/
├── memory-scan.md
└── memory-seeding/
    ├── memory-seeding.md       # main skill file
    └── knowledge/
        ├── csharp.md
        ├── nodejs.md
        ├── python.md
        ├── go.md
        ├── java.md
        └��─ ...
```

The main skill file is the entry point. Language knowledge files are loaded on demand based on detected tech stack.

## Prerequisites

- `init.sh` has been run (`memory/` folder exists with HARNESS.yaml and registries)

## Two Modes

The skill operates in one of two modes based on the project state:

### Source-based mode (existing codebase)

For projects with existing source code. The skill deep-analyzes the codebase using language-specific knowledge to discover topics for memory files.

### Document-based mode (empty project + requirements)

For new projects without source code. The user provides requirements documents (file path, pasted content, or external URL) and the skill extracts knowledge from them.

Steps 3-7 of the interaction flow are identical in both modes — only the input source differs.

## Interaction Flow

Follows the brainstorming discipline: one question at a time, multiple choice preferred, propose then confirm, incremental validation.

### Phase 1: Setup

```
Step 1: "Is this an existing codebase or a new project?"
        → Determines source-based or document-based mode

Step 2 (source mode):
        "What scan depth would you like?"
        - Light: project structure + sample files (faster, lower token cost)
        - Deep: read more files, trace patterns, analyze relationships (thorough, higher cost)

Step 2 (document mode):
        "Please provide your requirements documents."
        - File path: point to files in the repo
        - Paste: paste content directly
        - URL: link to external docs (Confluence, Google Docs, etc.)
        - Multiple sources accepted
```

### Phase 2: Analysis

```
Step 3: Skill runs analysis
        - Source mode: uses language-specific knowledge file for targeted analysis
        - Document mode: reads and extracts knowledge from provided docs

Step 4: Present findings
        "Here's what I found: [structured summary]. Does this look accurate?"
        → User confirms or corrects
```

### Phase 3: Topic Selection

```
Step 5: Recommend topics with store categorization
        "I recommend capturing these topics:
         - [topic A] → technical/
         - [topic B] → domain/
         - [topic C] → rules/
         - ...
         Which ones should we proceed with?"
        → User selects/adjusts

Step 6: Prioritize
        "I suggest starting with these [3-5] as highest priority:
         1. [topic] — [reason]
         2. [topic] — [reason]
         3. [topic] — [reason]
         Agree?"
        → User confirms or reorders
```

### Phase 4: Drafting (repeat per file)

```
Step 7: Present draft
        "Here's the draft for [topic]:
         [full markdown content following the embedded template]
         Review and let me know what to change."
        → User approves, requests edits, or skips

Step 8: Write approved file
        - Write memory file to the correct store directory
        - Update the store's _registry.yaml
        - Confirm to user: "Written to memory/[store]/[path]. Registry updated."

Step 9: Repeat steps 7-8 for each approved topic
```

### Phase 5: Summary

```
Step 10: Final report
         "Done. Created X files:
          - memory/technical/[file] — [desc]
          - memory/domain/[file] — [desc]
          - memory/rules/[file] — [desc]

          Suggested next steps:
          - Review the generated files and refine as needed
          - Run memory:seeding again as the project evolves
          - Consider adding more topics manually following the templates"
```

## Embedded Knowledge

The skill carries all knowledge it needs to operate. This is organized into two layers:

### Layer 1: Core knowledge (in main skill file)

Always available regardless of language/framework.

**Categorization logic — how to map findings to stores:**

| Signal | Store |
|---|---|
| Language pattern, framework usage, infrastructure, tooling | `technical/` |
| Business workflow, entity, terminology, domain rule | `domain/` |
| Coding convention, security constraint, API standard, team rule | `rules/` |

**Template formats — embedded structure for each store type:**

Technical template:
```
# [Topic Name]
## When to Use
## How It Works
## Patterns
## Trade-offs
## Notes
```

Domain template:
```
# [Concept / Workflow Name]
## Glossary
## Definition
## Workflow / States
## Business Rules
```

Rules template:
```
# [Constraint Name]
## MUST
## MUST NOT
## Examples (DO / DON'T)
## Exceptions
```

**Quality criteria — what makes a good memory file:**
- Specific and unambiguous, not vague
- Written for AI to read, not humans
- Uses strong language (MUST/MUST NOT) in rules
- Includes DO/DON'T examples where applicable
- One topic per file (Single Responsibility)
- Concise — no background history, no filler
- Description sufficient to decide relevance without opening the file

**Registry format:**
```yaml
[category]:
  - id: [unique-id]
    path: [relative-path-to-file]
    desc: "[short description]"
```

**Frontmatter format:**
```yaml
---
id: [unique-id]
store: [technical | domain | rules]
title: [Title]
description: [Brief description matching registry desc]
last_updated: [YYYY-MM-DD]
---
```

### Layer 2: Language knowledge files (loaded on demand)

Each knowledge file contains language/framework-specific expertise for deep analysis. Loaded after tech stack is detected.

**What a language knowledge file contains:**

1. **Project structure patterns** — where to find key files and what they mean
2. **Architecture indicators** — how to recognize common architecture patterns
3. **Domain signal locations** — where business logic typically lives
4. **Convention indicators** — how to detect existing coding conventions
5. **Framework-specific patterns** — common patterns for the detected framework
6. **What to sample** — which files give the most insight for minimal token cost

**Example: `knowledge/csharp.md` would contain:**

```markdown
## Project Structure
- *.sln, *.csproj → solution and project files
- Program.cs / Startup.cs → application entry point and configuration
- Controllers/ → API endpoints (ASP.NET)
- Services/ → business logic layer
- Models/ or Entities/ → data models
- Data/ or Infrastructure/ → data access layer
- Migrations/ → database schema history

## Architecture Indicators
- Controllers + Services + Repositories → layered architecture
- Features/ or Modules/ with vertical slices → vertical slice architecture
- MediatR usage → CQRS pattern
- Minimal API (app.MapGet) → minimal API pattern

## Domain Signal Locations
- Models/Entities → domain entities and relationships
- Services/ → business rules and workflows
- Enums/ → domain states and categories
- Validators/ → business validation rules

## Convention Indicators
- .editorconfig → formatting rules
- Directory.Build.props → shared build conventions
- GlobalUsings.cs → namespace conventions
- Nullable enable → null safety approach

## What to Sample (priority order)
1. *.csproj → dependencies and framework version
2. Program.cs → middleware pipeline and configuration
3. One controller → API patterns and conventions
4. One service → business logic patterns
5. One model/entity → data structure patterns
```

**Each language knowledge file follows this same structure** so the main skill can use them consistently.

## Scope Boundaries

### What this skill does
- Detects project mode (source-based or document-based)
- Deep-analyzes source code using language-specific knowledge
- Reads and extracts knowledge from requirements documents
- Interactively guides the user through topic selection and prioritization
- Generates 3-5 draft memory files following embedded templates
- Writes approved files and updates registries

### What this skill does NOT do
- Scan the full codebase exhaustively (uses targeted sampling guided by language knowledge)
- Generate more than 3-5 files per run (quality over quantity)
- Write files without user approval (every draft is reviewed)
- Make decisions without asking the user
- Depend on external methodology docs or other skills at runtime

## Customization

Since the skill lives at project level, teams can:

- **Edit the main skill file** — adjust interaction flow, change quality criteria, modify templates
- **Edit language knowledge files** — refine analysis rules for specific languages
- **Add new language knowledge files** — support additional languages/frameworks by adding a new file to `knowledge/`
- **Adjust the topic limit** — change the 3-5 default to suit team preference
- **Modify categorization logic** — adjust how findings map to stores

Adding a new language = adding a file to `knowledge/`. No existing files modified. (Open/Closed)
