# memory:interview — Design Spec

> **NOTE:** References to `memory:seeding` in this document now refer to `memory:analyze`. See [Memory Skills Redesign](../../memory-plan/2026-04-22-memory-skills-redesign-spec.md).

## Overview

`memory:interview` is a standalone skill that captures tribal knowledge — the expertise that lives in people's heads but not in code or documents. Through structured, adaptive Q&A it helps teams turn conversations into properly formatted memory files.

## Design Principles

- **Self-contained:** embeds its own question bank, gap detection logic, categorization rules, template formats, and quality criteria. No runtime dependency on methodology docs, guideline files, or other skills.
- **Adaptive:** starts with a question bank but adapts follow-up questions based on user answers. Not a rigid script — a guided conversation.
- **Interactive throughout:** follows the brainstorming discipline — one question at a time, multiple choice preferred, propose then confirm, incremental validation.
- **Gap-aware:** reads existing registries to focus on what's missing, not what's already captured.
- **Project-level:** installed as a single file at `.claude/commands/memory-interview.md`. Teams can customize.

## Toolkit Context

| Skill | Purpose | Relationship to interview |
|---|---|---|
| `memory:scan` | Quick project overview | May reveal thin stores that need interview |
| `memory:seeding` | Initial knowledge base setup | Interview fills gaps seeding couldn't cover |
| `memory:extract` | Extract knowledge from documents | Interview captures what docs don't contain |
| `memory:interview` | Capture tribal knowledge via Q&A | **This spec** |

Each skill is self-contained with its own embedded knowledge. No skill depends on another skill's knowledge or on external methodology documentation at runtime. This is a **core architectural rule** for the entire toolkit.

## Installation

`init.sh` installs the skill into the project:

```
.claude/commands/
├── memory-scan.md
├── memory-extract.md
├── memory-interview.md          # single file, no subfolders
└── memory-seeding/
    ├── memory-seeding.md
    └── knowledge/
        └── ...
```

## Prerequisites

- `init.sh` has been run (`memory/` folder exists with HARNESS.yaml and registries)

## Interaction Flow

The entire skill is a conversation. Follows brainstorming discipline: one question at a time, multiple choice preferred, propose then confirm, incremental validation.

### Phase 1: Context

```
Step 1: "What area would you like to capture knowledge about?"
        - Technical (how things are built)
        - Domain (what the business does)
        - Rules (constraints and conventions)
        - Not sure — help me figure it out

Step 2: Check existing registries
        - Read _registry.yaml for the selected store(s)
        - "I see you already have [X entries] in [store]:
           [list existing topics]
           I'll focus on gaps."
        - If "not sure" selected: check all 3 registries,
          identify the thinnest store, suggest starting there
```

### Phase 2: Interview

```
Step 3: Ask questions one at a time
        - Start with a question from the embedded question bank
          for the selected store
        - Adapt follow-up questions based on the answer
        - Use multiple choice when possible, open-ended when needed

Step 4: Periodic checkpoint (every 3-4 answers)
        "So far I've gathered:
         - [topic A] — [brief summary]
         - [topic B] — [brief summary]
         Is this accurate? Anything to correct?"
        → User confirms or corrects

Step 5: Continue until:
        - User says "that's enough" or "let's stop"
        - Skill has gathered enough for 3-5 memory files
        - Skill runs out of productive questions for the area
        When stopping: "I think we have enough for [N] memory files.
        Ready to move to drafting?"
```

### Phase 3: Drafting

```
Step 6: Recommend memory files
        "Based on our conversation, I recommend these memory files:
         - [topic A] → [store] — [reason]
         - [topic B] → [store] — [reason]
         - [topic C] → [store] — [reason]
         Which should we create?"
        → User selects

Step 7: Present draft (one at a time)
        "Here's the draft for [topic]:
         [full markdown content following embedded template]
         Review and let me know what to change."
        → User approves, requests edits, or skips

Step 8: Write approved file
        - Write memory file to the correct store directory
        - Update the store's _registry.yaml
        - Confirm: "Written to memory/[store]/[path]. Registry updated."

Step 9: Repeat steps 7-8 for each selected topic
```

### Phase 4: Summary

```
Step 10: Final report
         "Done. Created X files from our conversation:
          - memory/technical/[file] — [desc]
          - memory/domain/[file] — [desc]
          - memory/rules/[file] — [desc]

          Gaps still remaining:
          - [store] has no coverage of [area]
          - [store] could use more detail on [topic]

          Run memory:interview again anytime to capture more knowledge."
```

## Embedded Knowledge

The skill carries all knowledge it needs in a single file.

### Question Bank

Starter questions per store. The skill picks from these based on context, then adapts follow-ups based on answers. These are not a rigid script — they're conversation starters.

**Technical questions:**
- What languages and frameworks does this project use?
- What's the architecture pattern? (monolith, microservices, serverless, modular monolith)
- How is data stored? What databases or data services?
- What are the key integration points with external systems?
- How is authentication/authorization handled?
- What's the deployment setup? (containers, cloud provider, CI/CD)
- Are there any performance-critical paths or bottlenecks?
- What patterns does the team use most? (repository, CQRS, event sourcing, etc.)
- What testing approach does the team follow?
- Are there any technologies the team is planning to adopt or migrate away from?

**Domain questions:**
- What does this product/system do in one sentence?
- Who are the main users or actors?
- What are the core workflows or processes?
- What business rules do people get wrong most often?
- What domain terminology would a new team member need to learn?
- What are the key entities and how do they relate?
- Are there state machines or lifecycles? (e.g., order states, user states)
- What edge cases or special scenarios come up frequently?
- Are there seasonal or time-dependent business rules?
- What changed recently in the business domain?

**Rules questions:**
- Are there coding conventions the team follows? (naming, formatting, structure)
- What security requirements exist?
- Are there API design standards?
- What are the "never do this" rules the team learned the hard way?
- Are there compliance or regulatory requirements?
- How does the team handle errors and logging?
- Are there performance standards or SLAs?
- What code review standards does the team follow?
- Are there restrictions on third-party dependencies?
- What conventions exist for database schema changes?

### Adaptive Follow-up Logic

The skill adapts based on answers:

- **Short answer** → ask for more detail: "Can you elaborate on [specific part]?"
- **Mentions a technology** → follow up on usage: "How does the team use [tech]? Any specific patterns?"
- **Mentions a problem** → dig into the rule: "What rule would prevent that? What should the team always/never do?"
- **Mentions a workflow** → map the states: "What are the steps? What triggers each transition?"
- **Says "I don't know"** �� move on: "No problem. Let's move to [next topic]."

### Gap Detection Logic

How to identify what's missing from existing registries:

| Existing coverage | Gap signal | Action |
|---|---|---|
| Technical has no auth entry | Auth knowledge missing | Ask auth questions |
| Domain has entities but no workflows | Workflow knowledge missing | Ask workflow questions |
| Rules registry is empty | No constraints captured | Start with rules questions |
| All stores have entries | Check for depth | Ask about edge cases, recent changes |

### Categorization Logic

| Signal in answer | Store | Rationale |
|---|---|---|
| Technology, framework, pattern, infrastructure | `technical/` | Changes when tech stack changes |
| Business concept, workflow, entity, terminology | `domain/` | Changes when business domain changes |
| Convention, constraint, standard, prohibition | `rules/` | Changes when project constraints change |

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

What makes a good interview-derived memory file:
- Transforms conversational answers into structured, AI-readable format
- Specific and unambiguous — paraphrase vague answers into precise statements
- Uses strong language (MUST/MUST NOT) in rules, not "should" or "try to"
- One topic per file (Single Responsibility)
- Concise — distill the knowledge, don't transcribe the conversation
- Includes DO/DON'T examples where the user provided enough detail
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
- Guides structured Q&A to capture tribal knowledge
- Reads existing registries to focus on gaps
- Adapts questions based on user answers
- Categorizes gathered knowledge into stores
- Generates draft memory files from conversation
- Writes approved files and updates registries

### What this skill does NOT do
- Analyze source code (that's memory:seeding's job)
- Read documents (that's memory:extract's job)
- Follow a rigid script (adapts to answers)
- Generate files without user approval
- Make decisions without asking the user
- Depend on external docs or other skills at runtime

## Customization

Since the skill is a single file at project level, teams can:
- **Edit the question bank** — add project-specific questions, remove irrelevant ones
- **Adjust adaptive logic** — change how follow-ups are determined
- **Modify gap detection** — define what "thin coverage" means for their project
- **Edit template formats** — adjust section structure per store
- **Change quality criteria** — set project-specific quality standards
- **Adjust the checkpoint frequency** — summarize every 2 answers or every 5
