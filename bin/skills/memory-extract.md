---
name: memory:extract
description: Extract knowledge from any document into memory files — reusable for ongoing document intake
---

# memory:extract

Read requirements documents or any project documentation and extract knowledge into properly formatted memory files. This skill is interactive — it asks the user at every decision point.

## Instructions

Follow the brainstorming interaction discipline:
- One question at a time — do NOT ask multiple questions in one message
- Multiple choice preferred — easier for the user to decide
- Propose then confirm — never act without user approval
- Incremental validation — get approval at each step before moving on

### Phase 1: Input

**Step 1: Collect documents**

Ask the user:

> What documents would you like to extract knowledge from?
>
> - **File path** — point to files in the repo (e.g., `docs/requirements.md`)
> - **Paste** — paste content directly into the conversation
> - **URL** — link to external docs
>
> You can provide multiple sources. Send them all now or one at a time.

**Step 2: Processing mode**

If multiple documents are provided:

> You've provided [N] documents. Should I:
>
> - **A) Process together** — read all documents and extract knowledge holistically
> - **B) One at a time** — process each document separately, you review after each

### Phase 2: Extraction

**Step 3: Read and analyze**

Read the provided document(s) and extract knowledge using the embedded extraction heuristics (see Embedded Knowledge section below).

For each piece of knowledge found, categorize it into one of the 3 stores.

**Step 4: Present findings**

> I extracted these knowledge items from your documents:
>
> **Technical:**
> - [item] — [brief description]
> - [item] — [brief description]
>
> **Domain:**
> - [item] — [brief description]
> - [item] — [brief description]
>
> **Rules:**
> - [item] — [brief description]
> - [item] — [brief description]
>
> Does this look accurate? Anything to correct, remove, or add?

Wait for user confirmation before proceeding.

### Phase 3: Selection & Drafting

**Step 5: Select topics**

> Which topics should we create memory files for? (Enter numbers, or "all")

If more than 5 selected, suggest prioritizing:

> That's [N] topics. I suggest starting with the most important 3-5. We can always run memory:extract again for the rest. Which ones are highest priority?

**Step 6: Draft each file (one at a time)**

For each selected topic, generate a complete memory file following the correct template from the Embedded Knowledge section.

> Here's the draft for **[topic]** (`memory/[store]/[path]`):
>
> ```markdown
> [complete file content including frontmatter]
> ```
>
> Review and let me know what to change, or say "approve" to write it.

**Step 7: Write approved file**

After user approves:
1. Create any necessary subdirectories in `memory/[store]/`
2. Write the memory file
3. Add an entry to the store's `_registry.yaml`
4. Confirm: "Written to `memory/[store]/[path]`. Registry updated."

**Step 8: Repeat steps 6-7 for each selected topic**

### Phase 4: Summary

**Step 9: Final report**

> Done. Created [N] files from your documents:
>
> | File | Store | Description |
> |---|---|---|
> | `memory/[store]/[path]` | [store] | [desc] |
> | ... | ... | ... |
>
> If more documents arrive later, run `memory:extract` again.
> For knowledge that isn't in any document, try `memory:interview`.

## Embedded Knowledge

### Extraction Heuristics

How to recognize knowledge signals in any document content:

**Technical signals:**
- Technology names, frameworks, libraries, tools mentioned
- Architecture descriptions, system components, diagrams
- Integration points, APIs, protocols, data formats
- Infrastructure, deployment, hosting, performance requirements
- Technical constraints, compatibility requirements
- Non-functional requirements (scalability, availability, latency)

**Domain signals:**
- Business concepts, terminology, definitions
- Workflows, processes, state transitions, lifecycles
- Entities, relationships, data structures, models
- Business rules, conditions, edge cases
- User roles, personas, permissions, access levels
- Success criteria, acceptance criteria

**Rules signals:**
- Mandatory language: "must", "shall", "required", "always"
- Prohibitive language: "must not", "shall not", "prohibited", "never"
- Compliance, security, legal, regulatory requirements
- Standards, conventions, formatting requirements
- Acceptance criteria, quality attributes, SLAs
- Audit, logging, tracing requirements

### Categorization Logic

| Signal type | Store | Rationale |
|---|---|---|
| How to build — technology, patterns, infrastructure | `technical/` | Changes when tech stack changes |
| What it is — workflows, entities, business rules | `domain/` | Changes when business domain changes |
| Constraints — standards, security, conventions | `rules/` | Changes when project constraints change |

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
- **Specific** — rewrite vague document prose into precise, actionable statements
- **AI-readable** — written for AI to read; use strong language (MUST/MUST NOT) in rules
- **Example-driven** — include DO/DON'T examples where the source doc provides enough detail
- **Single-topic** — one file covers one topic only
- **Concise** — extract the knowledge, not the document's writing style or filler
- **Self-sufficient** — description must be enough to decide relevance without opening the file

## Scope

This skill:
- Reads documents from any source (file, paste, URL)
- Handles any document type or format
- Extracts and categorizes knowledge into 3 stores
- Generates memory files interactively with user review
- Can be run repeatedly as new documents arrive

This skill does NOT:
- Analyze source code (use memory:seeding for that)
- Follow a rigid document-type classification
- Write files without user approval
- Make decisions without asking
