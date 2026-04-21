---
name: memory:seeding
description: Deep-analyze project source or requirements docs to generate initial memory files for the knowledge base
---

# memory:seeding

Generate an initial set of high-quality memory files by deep-analyzing the project's source code or requirements documents. This skill is interactive — it asks the user at every decision point.

## Instructions

Follow the brainstorming interaction discipline:
- One question at a time — do NOT ask multiple questions in one message
- Multiple choice preferred — easier for the user to decide
- Propose then confirm — never act without user approval
- Incremental validation — get approval at each step before moving on

### Phase 1: Setup

**Step 1: Determine mode**

Ask the user:

> This project appears to have [source code / no source code]. How would you like to seed the knowledge base?
>
> - **A) Source-based** — I'll deep-analyze the existing codebase to generate memory files
> - **B) Document-based** — You provide requirements documents (SRS, PRD, user stories, etc.) and I'll extract knowledge from them

If the project has source code, recommend option A. If empty, recommend option B.

**Step 2 (source mode): Confirm scan depth**

> What scan depth would you like?
>
> - **A) Light** — project structure + sample files (faster, lower token cost)
> - **B) Deep** — read more files, trace patterns, analyze relationships (thorough, higher token cost)

**Step 2 (document mode): Collect documents**

> Please provide your requirements documents. I accept:
>
> - **File path** — point to files in the repo (e.g., `docs/requirements.md`)
> - **Paste** — paste content directly into the conversation
> - **URL** — link to external docs (Confluence, Google Docs, etc.)
>
> You can provide multiple sources.

### Phase 2: Analysis

**Step 3: Run analysis**

**For source-based mode:**

1. Detect the tech stack by reading manifest/config files (package.json, go.mod, *.csproj, etc.)
2. Load the matching language knowledge file from `.claude/commands/memory-seeding-knowledge/` — read it using the Read tool
3. Follow the knowledge file's guidance to sample the right files and identify:
   - Architecture patterns
   - Domain entities and business logic
   - Coding conventions and constraints
4. If no matching language knowledge file exists, proceed with general analysis using the embedded heuristics below

**For document-based mode:**

Read the provided documents and extract knowledge using these heuristics:

**Technical signals:**
- Technology names, frameworks, libraries, tools mentioned
- Architecture descriptions, system components
- Integration points, APIs, protocols, data formats
- Infrastructure, deployment, performance requirements

**Domain signals:**
- Business concepts, terminology, definitions
- Workflows, processes, state transitions, lifecycles
- Entities, relationships, data structures
- Business rules, conditions, edge cases

**Rules signals:**
- Mandatory language: "must", "shall", "required", "always"
- Prohibitive language: "must not", "shall not", "prohibited", "never"
- Compliance, security, legal requirements
- Standards, conventions, quality attributes

**Step 4: Present findings**

Present a structured summary to the user:

> Here's what I found:
>
> **Technical:** [list of technical topics discovered]
> **Domain:** [list of domain concepts discovered]
> **Rules:** [list of constraints discovered]
>
> Does this look accurate? Anything to correct or add?

Wait for user confirmation before proceeding.

### Phase 3: Topic Selection

**Step 5: Recommend topics with store categorization**

> I recommend capturing these topics as memory files:
>
> | # | Topic | Store | Reason |
> |---|---|---|---|
> | 1 | [topic] | technical/ | [why] |
> | 2 | [topic] | domain/ | [why] |
> | 3 | [topic] | rules/ | [why] |
> | ... | ... | ... | ... |
>
> Which ones should we proceed with? (Enter numbers, or "all")

**Step 6: Prioritize**

If more than 5 topics selected:

> That's [N] topics. I suggest starting with these 5 as highest priority:
>
> 1. [topic] — [reason it's most important]
> 2. [topic] — [reason]
> 3. [topic] — [reason]
> 4. [topic] — [reason]
> 5. [topic] — [reason]
>
> We can always run memory:seeding again for the rest. Agree?

### Phase 4: Drafting

**Step 7: Draft each file (one at a time)**

For each approved topic, generate a complete memory file following the correct template.

Present the draft:

> Here's the draft for **[topic]** (`memory/[store]/[path]`):
>
> ```markdown
> [complete file content including frontmatter]
> ```
>
> Review and let me know what to change, or say "approve" to write it.

**Step 8: Write approved file**

After user approves:
1. Create any necessary subdirectories in `memory/[store]/`
2. Write the memory file
3. Add an entry to the store's `_registry.yaml`
4. Confirm: "Written to `memory/[store]/[path]`. Registry updated."

**Step 9: Repeat steps 7-8 for each approved topic**

### Phase 5: Summary

**Step 10: Final report**

> Done. Created [N] memory files:
>
> | File | Store | Description |
> |---|---|---|
> | `memory/[store]/[path]` | [store] | [desc] |
> | ... | ... | ... |
>
> **Suggested next steps:**
> - Review the generated files and refine as needed
> - Run `memory:seeding` again as the project evolves
> - Run `memory:interview` to capture tribal knowledge not in the code
> - Run `memory:extract` if you have additional requirements documents

## Embedded Knowledge

### Categorization Logic

| Signal | Store |
|---|---|
| Language pattern, framework usage, infrastructure, tooling | `technical/` |
| Business workflow, entity, terminology, domain rule | `domain/` |
| Coding convention, security constraint, API standard, team rule | `rules/` |

### Template Formats

**Technical memory file:**
```yaml
---
id: [unique-id]
store: technical
title: [Title]
description: "[Brief description for registry]"
last_updated: [YYYY-MM-DD]
---
```
```markdown
# [Topic Name]

## When to Use
[Situations where this knowledge applies]

## How It Works
[Core concept, mechanism, or architecture]

## Patterns
[Common usage patterns with code examples]

## Trade-offs
[When to choose this over alternatives]

## Notes
[Edge cases, pitfalls — remove if nothing to add]
```

**Domain memory file:**
```yaml
---
id: [unique-id]
store: domain
title: [Title]
description: "[Brief description for registry]"
last_updated: [YYYY-MM-DD]
---
```
```markdown
# [Concept / Workflow Name]

## Glossary
[Key terms: **Term** — definition]

## Definition
[What this concept is, in 1-2 sentences]

## Workflow / States
[Business flow or state machine]

## Business Rules
[Domain-specific logic and conditions]
```

**Rules memory file:**
```yaml
---
id: [unique-id]
store: rules
title: [Title]
description: "[Brief description for registry]"
last_updated: [YYYY-MM-DD]
---
```
```markdown
# [Constraint Name]

## MUST
[Mandatory requirements — concrete, verifiable]

## MUST NOT
[Prohibited practices — with brief risk explanation]

## Examples
### DO
[Correct usage with code examples]

### DON'T
[Incorrect usage with explanation]

## Exceptions
[Cases where rules may be relaxed — remove if none]
```

### Registry Entry Format

When updating `_registry.yaml`, add entries in this format:
```yaml
[category]:
  - id: [unique-id]
    path: [relative-path-to-file]
    desc: "[short description]"
```

### Quality Criteria

Every generated memory file MUST be:
- **Specific** — no vague statements like "follow team conventions"
- **AI-readable** — written for AI to read, not humans; use strong language (MUST/MUST NOT)
- **Example-driven** — include DO/DON'T code examples where applicable
- **Single-topic** — one file covers one topic only
- **Concise** — no background history, no filler, no long explanations of "why we chose this"
- **Self-sufficient** — description in frontmatter must be enough to decide relevance without opening the file

## Scope

This skill:
- Analyzes source code OR requirements documents (not both in one run)
- Generates 3-5 memory files per run
- Always asks the user before writing anything
- Updates registries when writing files

This skill does NOT:
- Scan the full codebase exhaustively (uses targeted sampling)
- Generate more than 5 files per run (run again for more)
- Write files without user approval
- Make decisions without asking
