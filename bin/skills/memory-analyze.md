---
name: memory:analyze
description: Interactively analyze project source or requirements docs — deep Q&A, SRP-enforced topic decomposition, spec and plan generation for memory file creation
---

# memory:analyze

Interactively analyze a project's source code or requirements documents to produce a spec and plan for memory file creation. Enforces Single Responsibility Principle at every stage through deep Q&A.

## Interaction Discipline

- One question at a time — do NOT ask multiple questions in one message
- Multiple choice preferred — easier for the user to decide
- Propose then confirm — never act without user approval
- Incremental validation — get approval at each step before moving on
- Keep asking until confident — never move to the next phase with vague understanding

## Instructions

### Phase 1: Setup

**Step 1: Determine mode**

Ask the user:

> This project appears to have [source code / no source code]. How would you like to analyze it?
>
> - **A) Source-based** — I'll deep-analyze the existing codebase
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

1. Detect the tech stack by reading manifest/config files (package.json, go.mod, *.csproj, pom.xml, build.gradle, build.gradle.kts, requirements.txt, pyproject.toml, etc.)
2. Confirm the detected tech stack with the user:

> I detected the following tech stack: **[tech stack]**
> Is this correct? Anything to add or change?

Wait for user confirmation. Update the tech stack based on user feedback.

3. Sample key files following priority order: entry point, one controller/handler, one service, one model, configuration files
4. Identify:
   - Architecture patterns (layered, hexagonal, CQRS, microservices, etc.)
   - Domain entities and business logic
   - Coding conventions and constraints
   - Infrastructure and deployment patterns

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

**Tech stack resolution:** After reading the documents, resolve the project's tech stack:

1. If technology names were found in the documents, propose them for confirmation:

> I noticed mentions of **[tech list]** in the documents. Is this the project's tech stack?

2. If no technology names were found, ask directly:

> What is the project's tech stack? (languages, frameworks, key libraries)

Wait for user confirmation before proceeding.

**Step 4: Present findings**

Present a structured summary to the user:

> Here's what I found:
>
> **Tech Stack:** [confirmed tech stack from Step 3]
> **Technical:** [list of technical patterns/components discovered]
> **Domain:** [list of domain concepts discovered]
> **Rules:** [list of constraints discovered]
>
> Does this look accurate? Anything to correct or add?

Wait for user confirmation before proceeding.

### Phase 3: Topic Decomposition

This is the critical phase. SRP is enforced through interactive questioning — challenge broad topics immediately and deep-dive each topic with thorough Q&A.

**Step 5: Propose initial topics with SRP challenge**

Present proposed topics as a table:

> I recommend capturing these topics as memory files:
>
> | # | Topic | Store | Description | Reason |
> |---|---|---|---|---|
> | 1 | [topic] | [store] | [description] | [why this is single-responsibility] |

**SRP check:** For any topic that covers multiple concerns, proactively split it and explain why:

> "[Topic X] covers [A], [B], and [C] — those are [N] concerns that change for different reasons. I recommend splitting into: 1) [A-specific], 2) [B-specific], 3) [C-specific]."

Ask:

> Which topics should we proceed with? Any to add, remove, or split differently?

Wait for user confirmation.

**Step 6: Deep-dive each topic (one at a time)**

For each approved topic, ask a series of questions — **one per message** — to nail down scope and content. Adapt questions based on store type:

**For technical topics, ask about:**
- What architecture pattern does this use? (e.g., layered, hexagonal, event-driven)
- What are the key components/classes involved?
- What are the common usage patterns a developer would need?
- What are the trade-offs or pitfalls someone should know?
- Are there project-specific conventions that differ from framework defaults?
- What related topics should this file explicitly NOT cover? (boundary definition)

**For domain topics, ask about:**
- What is the core business concept in one sentence?
- What are the key terms/glossary entries?
- What are the states/workflows/lifecycles involved?
- What business rules govern this concept?
- What edge cases or exceptions exist?
- What related domain concepts should this file explicitly NOT cover?

**For rules topics, ask about:**
- What are the MUST requirements?
- What are the MUST NOT prohibitions?
- What is the reasoning behind each rule? (so AI can judge edge cases)
- Can you give a concrete DO/DON'T example?
- Are there exceptions where the rule can be relaxed?
- What related rules should this file explicitly NOT cover?

Keep asking until confident about every topic. Never move to the spec phase with vague or incomplete understanding.

**Step 7: Boundary confirmation**

After deep-diving all topics, present a summary of scope boundaries:

> Here's the scope boundary for each topic:
>
> **[Topic 1]:**
> - IN: [what this file covers]
> - OUT: [what it explicitly does not cover]
>
> **[Topic 2]:**
> - IN: ...
> - OUT: ...

Explicitly flag overlaps:

> **Overlap check:** "Topic A and Topic B both mention X — which one owns it?"

Wait for user to confirm all boundaries.

### Phase 4: Spec

**Step 8: Write spec**

Write the analysis spec to `docs/memory-plan/YYYY-MM-DD-<project>-analysis.md`:

```markdown
# Memory Analysis: [Project Name]

## Project Summary
[1-2 sentences]

## Tech Stack
[Languages, frameworks, infrastructure]

## Analysis Mode
[Source-based / Document-based, scan depth]

## Approved Topics

| # | Topic | Store | Description | Reason |
|---|---|---|---|---|
| 1 | [topic] | [store] | [description] | [why single-responsibility] |

## Topic Details

### 1. [Topic Name]
**Scope IN:** [what this file covers]
**Scope OUT:** [what this file explicitly does not cover]
**Key aspects:**
- [details gathered from Q&A]
**Boundary notes:** [overlap resolutions with other topics]
```

**Step 9: Spec self-review**

Before presenting to the user, check:
1. **Placeholder scan:** any TBD, TODO, vague sections? Fix them.
2. **Internal consistency:** do topics contradict each other?
3. **SRP re-validation:** apply the "A and B" test to every topic again. If any topic description requires "and" connecting unrelated concerns, split it.
4. **Boundary check:** are scope IN/OUT boundaries clear and non-overlapping?

Fix issues inline.

**Step 10: User reviews spec**

> Spec written to `docs/memory-plan/YYYY-MM-DD-<project>-analysis.md`. Please review and let me know if you want to make any changes.

Wait for user approval. If changes requested, revise and re-run self-review.

### Phase 5: Plan

**Step 11: Write plan**

Write the building plan to `docs/memory-plan/YYYY-MM-DD-<project>-plan.md`:

```markdown
# Memory Building Plan: [Project Name]

> **For agentic workers:** Use memory:building skill to execute this plan.

**Goal:** [One sentence]
**Tech Stack:** [Key technologies — tells memory:building which knowledge files to load]
**Spec:** `docs/memory-plan/YYYY-MM-DD-<project>-analysis.md`

---

### Task N: [Topic Name]

**File:** `memory/[store]/[path].md`
**Store:** [technical/domain/rules]
**Template:** [technical/domain/rules]
**Knowledge file:** `memory-building-knowledge/[lang].md` or "none"

**Content outline:**
- [Section]: [content from Q&A]
- [Section]: [content from Q&A]

**Scope boundaries:**
- IN: [from spec]
- OUT: [from spec]

**Registry entry:**
```yaml
[category]:
  - id: [id]
    path: [path]
    desc: "[desc]"
```
```

**Step 12: Plan self-review**

1. Every topic in the spec has a corresponding task
2. File paths are valid and consistent
3. Registry entries have unique IDs within each store
4. Knowledge file references match the tech stack
5. No task duplicates or overlaps

**Step 13: User reviews plan**

> Plan written to `docs/memory-plan/YYYY-MM-DD-<project>-plan.md`. Please review and let me know if you want to make any changes.

Wait for user approval.

### Phase 6: Handoff

**Step 14: Invoke memory:building**

After plan is approved, invoke the `memory-building` skill to execute the plan.

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

```yaml
[category]:
  - id: [unique-id]
    path: [relative-path-to-file]
    desc: "[short description]"
```

### Quality Criteria

Every memory file MUST be:
- **Specific** — no vague statements like "follow team conventions"
- **AI-readable** — written for AI to read, not humans; use strong language (MUST/MUST NOT)
- **Example-driven** — include DO/DON'T code examples where applicable
- **Single-topic** — one file covers one topic only; must pass the "A and B" test
- **Concise** — no background history, no filler, no long explanations of "why we chose this"
- **Self-sufficient** — description in frontmatter must be enough to decide relevance without opening the file

## Scope

This skill:
- Analyzes source code OR requirements documents (not both in one run)
- Enforces SRP at every stage (Q&A challenge + spec self-review)
- Produces a spec and plan as persistent artifacts in `docs/memory-plan/`
- Always asks the user before writing anything
- No cap on number of topics — interactive Q&A is the quality gate

This skill does NOT:
- Build memory files (that is memory:building's job)
- Scan the full codebase exhaustively (uses targeted sampling)
- Make decisions without asking
- Skip the spec or plan checkpoint
