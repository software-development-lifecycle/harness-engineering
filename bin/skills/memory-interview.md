---
name: memory:interview
description: Capture tribal knowledge through structured Q&A — turns conversations into memory files
---

# memory:interview

Capture expertise that lives in people's heads through structured, adaptive Q&A. Turns conversational answers into properly formatted memory files.

## Instructions

Follow the brainstorming interaction discipline:
- One question at a time — do NOT ask multiple questions in one message
- Multiple choice preferred — easier for the user to decide
- Propose then confirm — never act without user approval
- Incremental validation — get approval at each step before moving on

This skill IS the interview — the entire flow is conversational.

### Phase 1: Context

**Step 1: Choose focus area**

Ask the user:

> What area would you like to capture knowledge about?
>
> - **A) Technical** — how things are built (languages, frameworks, patterns, infrastructure)
> - **B) Domain** — what the business does (workflows, entities, business rules, terminology)
> - **C) Rules** — constraints and conventions (coding standards, security, API design)
> - **D) Not sure** — help me figure out what's missing

**Step 2: Check existing knowledge**

Read the `_registry.yaml` file(s) for the selected store(s):
- If user chose A/B/C: read that store's registry
- If user chose D: read all three registries

Report what already exists:

> I see your [store] registry currently has [N entries / is empty]:
> [list existing entries if any]
>
> I'll focus on gaps. Let's start.

If user chose D and all registries are thin, suggest starting with the thinnest store.

### Phase 2: Interview

**Step 3: Ask questions**

Ask questions one at a time from the embedded question bank (see Embedded Knowledge). Start with the most fundamental question for the chosen store, then adapt follow-ups based on answers.

**Adaptive follow-up rules:**
- **Short answer** → ask for more detail: "Can you elaborate on [specific part]?"
- **Mentions a technology** → dig into usage: "How does the team use [tech]? Any specific patterns or conventions?"
- **Mentions a problem or incident** → extract the rule: "What rule would prevent that? What should the team always/never do?"
- **Mentions a workflow** → map the states: "What are the steps? What triggers each transition?"
- **Says "I don't know"** → move on: "No problem. Let's move to [next topic]."

**Step 4: Periodic checkpoint (every 3-4 answers)**

Pause and summarize:

> So far I've gathered:
>
> - **[topic A]** — [brief summary of what was learned]
> - **[topic B]** — [brief summary of what was learned]
> - **[topic C]** — [brief summary of what was learned]
>
> Is this accurate? Anything to correct?

Wait for user confirmation before continuing.

**Step 5: Know when to stop**

Stop the interview when:
- User says "that's enough", "let's stop", or similar
- You have gathered enough material for 3-5 memory files
- You run out of productive questions for the chosen area

When stopping:

> I think we have enough for [N] memory files. Ready to move to drafting?

### Phase 3: Drafting

**Step 6: Recommend memory files**

> Based on our conversation, I recommend these memory files:
>
> | # | Topic | Store | Key content |
> |---|---|---|---|
> | 1 | [topic] | [store] | [what it will cover] |
> | 2 | [topic] | [store] | [what it will cover] |
> | 3 | [topic] | [store] | [what it will cover] |
>
> Which should we create? (Enter numbers, or "all")

**Step 7: Draft each file (one at a time)**

For each selected topic, generate a complete memory file following the correct template.

Transform conversational answers into structured, AI-readable format:
- Rewrite vague answers into precise statements
- Use MUST/MUST NOT for rules (not "should" or "try to")
- Add DO/DON'T examples where the user provided enough detail
- Keep only the knowledge, not the conversation

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

**Step 9: Repeat steps 7-8 for each selected topic**

### Phase 4: Summary

**Step 10: Final report**

> Done. Created [N] files from our conversation:
>
> | File | Store | Description |
> |---|---|---|
> | `memory/[store]/[path]` | [store] | [desc] |
> | ... | ... | ... |
>
> **Gaps still remaining:**
> - [store] has no coverage of [area]
> - [store] could use more detail on [topic]
>
> Run `memory:interview` again anytime to capture more knowledge.

## Embedded Knowledge

### Question Bank

Starter questions per store. Pick from these based on context, then adapt follow-ups based on answers. These are conversation starters, not a rigid script.

**Technical questions:**
- What languages and frameworks does this project use?
- What's the architecture pattern? (monolith, microservices, serverless, modular monolith)
- How is data stored? What databases or data services?
- What are the key integration points with external systems?
- How is authentication and authorization handled?
- What's the deployment setup? (containers, cloud provider, CI/CD pipeline)
- Are there any performance-critical paths or known bottlenecks?
- What patterns does the team use most? (repository, CQRS, event sourcing, saga, etc.)
- What testing approach does the team follow? (unit, integration, e2e, contract)
- Are there technologies the team is planning to adopt or migrate away from?

**Domain questions:**
- What does this product or system do in one sentence?
- Who are the main users or actors?
- What are the core workflows or processes?
- What business rules do people get wrong most often?
- What domain terminology would a new team member need to learn first?
- What are the key entities and how do they relate to each other?
- Are there state machines or lifecycles? (e.g., order states, user account states)
- What edge cases or special scenarios come up frequently?
- Are there seasonal or time-dependent business rules?
- What changed recently in the business domain?

**Rules questions:**
- Are there coding conventions the team follows? (naming, formatting, file structure)
- What security requirements exist? (authentication, data protection, encryption)
- Are there API design standards? (REST conventions, response format, versioning)
- What are the "never do this" rules the team learned the hard way?
- Are there compliance or regulatory requirements? (GDPR, HIPAA, PCI-DSS, etc.)
- How does the team handle errors and logging?
- Are there performance standards or SLAs?
- What code review standards does the team follow?
- Are there restrictions on third-party dependencies?
- What conventions exist for database schema changes?

### Gap Detection Logic

How to identify what's missing from existing registries:

| Existing coverage | Gap signal | Action |
|---|---|---|
| Technical store has no auth entry | Auth knowledge missing | Ask auth questions |
| Domain store has entities but no workflows | Workflow knowledge missing | Ask workflow questions |
| Rules registry is empty | No constraints captured | Start with rules questions |
| All stores have entries | Check for depth gaps | Ask about edge cases, recent changes |
| One store much thinner than others | Imbalanced knowledge | Suggest focusing on thin store |

### Categorization Logic

| Signal in answer | Store | Rationale |
|---|---|---|
| Technology, framework, pattern, infrastructure | `technical/` | Changes when tech stack changes |
| Business concept, workflow, entity, terminology | `domain/` | Changes when business domain changes |
| Convention, constraint, standard, prohibition | `rules/` | Changes when project constraints change |

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
- **Transformed** — rewrite conversational answers into structured, AI-readable format
- **Specific** — paraphrase vague answers into precise, unambiguous statements
- **Strong language** — use MUST/MUST NOT in rules, not "should" or "try to"
- **Example-driven** — include DO/DON'T examples where the user provided enough detail
- **Single-topic** — one file covers one topic only
- **Concise** — distill the knowledge, do NOT transcribe the conversation
- **Self-sufficient** — description must be enough to decide relevance without opening the file

## Scope

This skill:
- Guides structured Q&A to capture tribal knowledge
- Reads existing registries to focus on gaps
- Adapts questions based on user answers
- Generates memory files from conversation
- Can be run repeatedly to capture more knowledge

This skill does NOT:
- Analyze source code (use memory:seeding for that)
- Read documents (use memory:extract for that)
- Follow a rigid question script (adapts to answers)
- Write files without user approval
- Make decisions without asking
