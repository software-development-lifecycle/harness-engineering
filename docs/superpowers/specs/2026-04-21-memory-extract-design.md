# memory:extract — Design Spec

## Overview

`memory:extract` is a dedicated skill for extracting knowledge from any document into memory files. While `memory:seeding` handles documents as part of its initial setup flow, `memory:extract` is the **reusable tool** for ongoing document extraction — useful anytime new requirements, specs, or reference documents arrive.

## Design Principles

- **Self-contained:** embeds its own extraction heuristics, categorization logic, template formats, and quality criteria. No runtime dependency on methodology docs, guideline files, or other skills.
- **Document-agnostic:** handles any document content — SRS, PRD, user stories, API specs, meeting notes, or anything else. No assumptions about document type or format.
- **Interactive throughout:** follows the brainstorming discipline — one question at a time, propose then confirm, never act without approval.
- **Reusable:** designed to be run repeatedly as new documents arrive, not just during initial setup.
- **Project-level:** installed as a single file at `.claude/commands/memory-extract.md`. Teams can customize.

## Toolkit Context

| Skill | Purpose | Relationship to extract |
|---|---|---|
| `memory:scan` | Quick project overview | May suggest running extract for new docs |
| `memory:seeding` | Initial knowledge base setup | Uses document mode for first-time setup; extract is for ongoing use |
| `memory:extract` | Extract knowledge from any document | **This spec** |
| `memory:interview` | Interactive Q&A to fill gaps | Future — complementary to extract |

Each skill is self-contained with its own embedded knowledge. No skill depends on another skill's knowledge or on external methodology documentation at runtime. This is a **core architectural rule** for the entire toolkit.

## Installation

`init.sh` installs the skill into the project:

```
.claude/commands/
├── memory-scan.md
├── memory-extract.md            # single file, no subfolders
└── memory-seeding/
    ├── memory-seeding.md
    └── knowledge/
        └── ...
```

## Prerequisites

- `init.sh` has been run (`memory/` folder exists with HARNESS.yaml and registries)

## Interaction Flow

Follows the brainstorming discipline: one question at a time, multiple choice preferred, propose then confirm, incremental validation.

### Phase 1: Input

```
Step 1: "What documents would you like to extract knowledge from?"
        - File path: point to files in the repo
        - Paste: paste content directly into conversation
        - URL: link to external docs (Confluence, Google Docs, etc.)
        - Multiple sources accepted

Step 2: "Should I process them together as one body of knowledge,
         or one at a time?"
        → Together: skill reads all, extracts holistically
        → One at a time: skill processes each doc, user reviews after each
```

### Phase 2: Extraction

```
Step 3: Skill reads and analyzes the document(s)
        - Uses embedded extraction heuristics (see Embedded Knowledge)
        - Identifies knowledge items and categorizes them

Step 4: Present findings
        "I found these knowledge items:
         - [item A] → technical/ — [reason]
         - [item B] → domain/ — [reason]
         - [item C] → rules/ — [reason]
         - ...
         Does this look accurate?"
        → User confirms or corrects categorization
```

### Phase 3: Selection & Drafting

```
Step 5: "Which topics should we create memory files for?"
        → User selects from the list

Step 6: Present draft (one at a time)
        "Here's the draft for [topic]:
         [full markdown content following embedded template]
         Review and let me know what to change."
        → User approves, requests edits, or skips

Step 7: Write approved file
        - Write memory file to the correct store directory
        - Update the store's _registry.yaml
        - Confirm: "Written to memory/[store]/[path]. Registry updated."

Step 8: Repeat steps 6-7 for each selected topic
```

### Phase 4: Summary

```
Step 9: Final report
        "Done. Created X files from your documents:
         - memory/technical/[file] — [desc]
         - memory/domain/[file] — [desc]
         - memory/rules/[file] — [desc]

         If more documents arrive later, run memory:extract again."
```

## Embedded Knowledge

The skill carries all knowledge it needs in a single file. No language-specific subfiles needed — document extraction is universal.

### Extraction Heuristics

How to recognize knowledge signals in any document content:

**Technical signals:**
- Technology names, frameworks, libraries, tools mentioned
- Architecture descriptions, system components, diagrams
- Integration points, APIs, protocols, data formats
- Infrastructure, deployment, hosting, performance requirements
- Technical constraints, compatibility requirements

**Domain signals:**
- Business concepts, terminology, definitions
- Workflows, processes, state transitions, lifecycles
- Entities, relationships, data structures, models
- Business rules, conditions, edge cases
- User roles, personas, permissions

**Rules signals:**
- Mandatory language: "must", "shall", "required", "always"
- Prohibitive language: "must not", "shall not", "prohibited", "never"
- Compliance, security, legal, regulatory requirements
- Standards, conventions, formatting requirements
- Acceptance criteria, quality attributes, SLAs

### Categorization Logic

| Signal type | Store | Rationale |
|---|---|---|
| How to build it — technology, patterns, infrastructure | `technical/` | Changes when tech stack changes |
| What it is about — workflows, entities, business rules | `domain/` | Changes when business domain changes |
| Constraints on building — standards, security, conventions | `rules/` | Changes when project constraints change |

### Template Formats

Embedded structure for each store type:

**Technical template:**
```
---
id: [unique-id]
store: technical
title: [Title]
description: [Brief description]
last_updated: [YYYY-MM-DD]
---

# [Topic Name]
## When to Use
## How It Works
## Patterns
## Trade-offs
## Notes
```

**Domain template:**
```
---
id: [unique-id]
store: domain
title: [Title]
description: [Brief description]
last_updated: [YYYY-MM-DD]
---

# [Concept / Workflow Name]
## Glossary
## Definition
## Workflow / States
## Business Rules
```

**Rules template:**
```
---
id: [unique-id]
store: rules
title: [Title]
description: [Brief description]
last_updated: [YYYY-MM-DD]
---

# [Constraint Name]
## MUST
## MUST NOT
## Examples (DO / DON'T)
## Exceptions
```

### Quality Criteria

What makes a good extracted memory file:
- Specific and unambiguous — no vague requirements carried over from the source doc
- Written for AI to read — rewrite from document prose into structured, actionable format
- One topic per file (Single Responsibility)
- Includes DO/DON'T examples where the source doc provides enough detail
- Concise — extract the knowledge, not the document's writing style
- Description sufficient to decide relevance without opening the file

### Registry Format

```yaml
[category]:
  - id: [unique-id]
    path: [relative-path-to-file]
    desc: "[short description]"
```

## Scope Boundaries

### What this skill does
- Reads documents from any source (file, paste, URL)
- Extracts knowledge using universal extraction heuristics
- Categorizes findings into technical/domain/rules stores
- Interactively guides user through selection and review
- Writes approved memory files and updates registries

### What this skill does NOT do
- Analyze source code (that's memory:seeding's job)
- Assume document type or format
- Generate files without user approval
- Make decisions without asking the user
- Depend on external docs or other skills at runtime

## Customization

Since the skill is a single file at project level, teams can:
- **Adjust extraction heuristics** — add project-specific signal words or patterns
- **Modify categorization logic** — change how signals map to stores
- **Edit template formats** — adjust section structure per store
- **Change quality criteria** — set project-specific quality standards
- **Modify interaction flow** — add or remove steps as needed
