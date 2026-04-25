# Design: Consolidate Extract and Interview into Analyze

## Problem

The memory toolkit has five skills (scan, analyze, building, extract, interview) but extract and interview overlap significantly with analyze:

- **Extract** reads documents and writes memory files directly. Analyze's document mode reads the same documents with the added benefit of SRP enforcement, topic decomposition, and a spec/plan intermediate step.
- **Interview** captures knowledge through Q&A and writes files directly. Analyze already does deep interactive Q&A per topic, but requires an existing artifact (code or document) to start from.

Both extract and interview bypass the quality gates that the analyze → building pipeline provides: SRP enforcement at two stages, spec self-review, and two-stage file review (spec compliance + quality). This means files produced by extract and interview are lower quality than files produced through the primary pipeline.

The five-skill toolkit also creates a "which skill?" decision problem — users must understand the distinctions between analyze (document mode) vs extract, and analyze (Q&A) vs interview.

## Solution

Consolidate extract and interview into analyze. The toolkit becomes three skills: **scan → analyze → building**.

Analyze gains a third mode — **interview** — that starts from no artifact and uses a structured question bank with adaptive follow-ups. All three modes feed into the same Phase 3–6 pipeline (topic decomposition with SRP → spec → plan → handoff to building).

Extract's document intake is already covered by analyze's existing document mode. No new capabilities are needed — only the removal of extract as a separate entry point.

## Design

### Mode Selection (Phase 1, Step 1)

The mode prompt becomes:

> This project appears to have [source code / no source code]. How would you like to analyze it?
>
> - **A) Source-based** — deep-analyze the existing codebase
> - **B) Document-based** — provide requirements documents (SRS, PRD, user stories, etc.)
> - **C) Interview** — capture knowledge through conversation (no documents needed)

### Interview Mode: Phase 1 Addition

**Step 2 (interview mode): Choose focus area and detect gaps**

Ask the user:

> What area would you like to capture knowledge about?
>
> - **A) Technical** — how things are built (languages, frameworks, patterns, infrastructure)
> - **B) Domain** — what the business does (workflows, entities, business rules, terminology)
> - **C) Rules** — constraints and conventions (coding standards, security, API design)
> - **D) Not sure** — help me figure out what's missing

Then read the relevant `_registry.yaml` file(s):
- If user chose A/B/C: read that store's registry
- If user chose D: read all three registries

Report existing coverage and identify gaps using the gap detection logic (see Embedded Knowledge additions below).

### Interview Mode: Phase 2 Variant

**Step 3 (interview mode): Structured Q&A**

Ask questions one at a time from the embedded question bank (see below). Start with the most fundamental question for the chosen store, then adapt follow-ups based on answers.

Adaptive follow-up rules:
- **Short answer** → ask for more detail: "Can you elaborate on [specific part]?"
- **Mentions a technology** → dig into usage: "How does the team use [tech]? Any specific patterns or conventions?"
- **Mentions a problem or incident** → extract the rule: "What rule would prevent that? What should the team always/never do?"
- **Mentions a workflow** → map the states: "What are the steps? What triggers each transition?"
- **Says "I don't know"** → move on: "No problem. Let's move to [next topic]."

**Step 4 (interview mode): Periodic checkpoints**

Every 3-4 answers, pause and summarize:

> So far I've gathered:
>
> - **[topic A]** — [brief summary]
> - **[topic B]** — [brief summary]
>
> Is this accurate? Anything to correct?

Wait for confirmation before continuing.

**Step 5 (interview mode): Stop and present findings**

Stop when:
- User says "that's enough" or similar
- Enough material for 3-5 topics has been gathered
- Productive questions for the chosen area are exhausted

Present findings in the same format as source/document modes (Step 4 of current analyze), then flow into Phase 3 (topic decomposition with SRP).

**Tech stack resolution (interview mode):**

After the Q&A, if tech stack hasn't been established:

> What is the project's tech stack? (languages, frameworks, key libraries)

Wait for user confirmation before proceeding to Phase 3.

### Embedded Knowledge Additions

The following embedded knowledge sections are added to analyze from the interview skill:

**Question bank** — starter questions per store (not a rigid script, adapt based on answers):

Technical questions:
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

Domain questions:
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

Rules questions:
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

**Gap detection logic:**

| Existing coverage | Gap signal | Action |
|---|---|---|
| Technical store has no auth entry | Auth knowledge missing | Ask auth questions |
| Domain store has entities but no workflows | Workflow knowledge missing | Ask workflow questions |
| Rules registry is empty | No constraints captured | Start with rules questions |
| All stores have entries | Check for depth gaps | Ask about edge cases, recent changes |
| One store much thinner than others | Imbalanced knowledge | Suggest focusing on thin store |

### Updated Pipelines

Single pipeline replaces both current pipelines:

```
scan → analyze (source / document / interview) → building
```

- **Existing project with code:** scan → analyze (source) → building
- **New project with requirements docs:** scan → analyze (document) → building
- **No artifacts, just expertise:** scan → analyze (interview) → building
- **Supplementary docs arrive later:** analyze (document) → building
- **Capture someone's expertise:** analyze (interview) → building

**Decision table:**

| Situation | Skill |
|---|---|
| First time on a project | `scan` |
| Have source code to analyze | `analyze` (source mode) |
| Have requirements/specs/docs | `analyze` (document mode) |
| Knowledge only in someone's head | `analyze` (interview mode) |
| Approved plan ready to execute | `building` |

**Ongoing maintenance triggers:**

| Trigger | Action |
|---|---|
| New documents arrive | `analyze` (document mode) |
| Major code change | `analyze` (source mode) |
| Capture someone's expertise | `analyze` (interview mode) |
| Quick health check | `scan` |

## File Changes

### Deleted

| File | Reason |
|---|---|
| `bin/skills/memory-extract.md` | Subsumed by analyze's document mode |
| `bin/skills/memory-interview.md` | Subsumed by analyze's new interview mode |

### Modified

| File | Change |
|---|---|
| `bin/skills/memory-analyze.md` | Add interview mode: Phase 1 option C, Phase 2 interview variant (focus area, gap detection, question bank Q&A, periodic checkpoints), embedded question bank, adaptive follow-up rules, gap detection logic |
| `guideline/skills-guide.md` | Remove extract and interview sections. Update toolkit overview table (5 → 3 skills). Rewrite pipeline diagrams. Update decision table. |
| `bin/skills/memory-scan.md` | Update recommendation text — remove references to extract/interview as suggested next steps |
| `bin/init.sh` | Remove extract/interview from the installed skills list (lines 81-82) |
| `README.md` | Remove extract/interview from skills table, update toolkit description, remove from directory tree |

### Unchanged

- Templates, registries, HARNESS.yaml, best practices guide — these define file format, not skill workflow
- memory-building core logic — it executes plans regardless of which mode produced them
- Language knowledge files — referenced by building, not by analyze modes
