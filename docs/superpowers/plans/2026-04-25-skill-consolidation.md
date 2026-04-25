# Skill Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate memory:extract and memory:interview into memory:analyze as a third "interview" mode, reducing the toolkit from 5 to 3 skills.

**Architecture:** Add an interview mode to memory:analyze that uses a question bank, adaptive follow-ups, and gap detection from the interview skill. Document mode already covers extract's use case. All three modes feed into the same Phase 3–6 pipeline (topic decomposition → spec → plan → building). Then delete extract and interview skill files, and update all references.

**Spec:** `docs/superpowers/specs/2026-04-25-skill-consolidation-design.md`

---

### Task 1: Add interview mode to memory:analyze

**Files:**
- Modify: `bin/skills/memory-analyze.md`

This is the core change. Add interview as a third mode in Phase 1, add an interview-specific Phase 2 variant, and add embedded knowledge (question bank, adaptive rules, gap detection).

- [ ] **Step 1: Update Phase 1 Step 1 — add interview mode option**

In `bin/skills/memory-analyze.md`, replace the mode selection prompt (lines 24-31):

```markdown
**Step 1: Determine mode**

Ask the user:

> This project appears to have [source code / no source code]. How would you like to analyze it?
>
> - **A) Source-based** — I'll deep-analyze the existing codebase
> - **B) Document-based** — You provide requirements documents (SRS, PRD, user stories, etc.) and I'll extract knowledge from them

If the project has source code, recommend option A. If empty, recommend option B.
```

Replace with:

```markdown
**Step 1: Determine mode**

Ask the user:

> This project appears to have [source code / no source code]. How would you like to analyze it?
>
> - **A) Source-based** — I'll deep-analyze the existing codebase
> - **B) Document-based** — You provide requirements documents (SRS, PRD, user stories, etc.) and I'll extract knowledge from them
> - **C) Interview** — I'll capture knowledge through conversation (no documents needed)

If the project has source code, recommend option A. If empty and the user has documents, recommend option B. If the user wants to capture tribal knowledge or has no artifacts, recommend option C.
```

- [ ] **Step 2: Add Phase 1 Step 2 for interview mode**

After the existing `**Step 2 (document mode): Collect documents**` block (which ends at line 48), add:

```markdown
**Step 2 (interview mode): Choose focus area and detect gaps**

Ask the user:

> What area would you like to capture knowledge about?
>
> - **A) Technical** — how things are built (languages, frameworks, patterns, infrastructure)
> - **B) Domain** — what the business does (workflows, entities, business rules, terminology)
> - **C) Rules** — constraints and conventions (coding standards, security, API design)
> - **D) Not sure** — help me figure out what's missing

Read the relevant `_registry.yaml` file(s):
- If user chose A/B/C: read that store's registry
- If user chose D: read all three registries

Report existing coverage and identify gaps using the gap detection logic (see Embedded Knowledge section):

> I see your [store] registry currently has [N entries / is empty]:
> [list existing entries if any]
>
> I'll focus on gaps. Let's start.

If user chose D and all registries are thin, suggest starting with the thinnest store.
```

- [ ] **Step 3: Add Phase 2 interview variant**

After the existing `**Step 4: Present findings**` block (which ends at line 118), add:

```markdown
**Step 3 (interview mode): Structured Q&A**

Ask questions one at a time from the embedded question bank (see Embedded Knowledge). Start with the most fundamental question for the chosen store, then adapt follow-ups based on answers.

**Adaptive follow-up rules:**
- **Short answer** → ask for more detail: "Can you elaborate on [specific part]?"
- **Mentions a technology** → dig into usage: "How does the team use [tech]? Any specific patterns or conventions?"
- **Mentions a problem or incident** → extract the rule: "What rule would prevent that? What should the team always/never do?"
- **Mentions a workflow** → map the states: "What are the steps? What triggers each transition?"
- **Says "I don't know"** → move on: "No problem. Let's move to [next topic]."

**Step 4 (interview mode): Periodic checkpoints**

Every 3-4 answers, pause and summarize:

> So far I've gathered:
>
> - **[topic A]** — [brief summary of what was learned]
> - **[topic B]** — [brief summary of what was learned]
>
> Is this accurate? Anything to correct?

Wait for user confirmation before continuing.

**Step 5 (interview mode): Stop and present findings**

Stop the interview when:
- User says "that's enough", "let's stop", or similar
- You have gathered enough material for 3-5 topics
- You run out of productive questions for the chosen area

Present findings in the same format as source/document modes:

> Here's what I found:
>
> **Tech Stack:** [confirmed tech stack, or ask if not yet established]
> **Technical:** [list of technical patterns/components discovered]
> **Domain:** [list of domain concepts discovered]
> **Rules:** [list of constraints discovered]
>
> Does this look accurate? Anything to correct or add?

**Tech stack resolution (interview mode):** If the tech stack has not been established during Q&A:

> What is the project's tech stack? (languages, frameworks, key libraries)

Wait for user confirmation, then proceed to Phase 3 (Topic Decomposition).
```

- [ ] **Step 4: Add embedded knowledge sections**

At the end of the file, before the existing `## Scope` section, add:

```markdown
### Question Bank

Starter questions per store. Pick from these based on context, then adapt follow-ups based on answers. These are conversation starters, not a rigid script. Used only in interview mode.

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

Used in interview mode to identify what's missing from existing registries:

| Existing coverage | Gap signal | Action |
|---|---|---|
| Technical store has no auth entry | Auth knowledge missing | Ask auth questions |
| Domain store has entities but no workflows | Workflow knowledge missing | Ask workflow questions |
| Rules registry is empty | No constraints captured | Start with rules questions |
| All stores have entries | Check for depth gaps | Ask about edge cases, recent changes |
| One store much thinner than others | Imbalanced knowledge | Suggest focusing on thin store |
```

- [ ] **Step 5: Update the Scope section**

Replace the existing scope section (lines 420-432):

```markdown
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
```

Replace with:

```markdown
## Scope

This skill:
- Analyzes source code, requirements documents, or conversational knowledge (one mode per run)
- Enforces SRP at every stage (Q&A challenge + spec self-review)
- Produces a spec and plan as persistent artifacts in `docs/memory-plan/`
- Always asks the user before writing anything
- No cap on number of topics — interactive Q&A is the quality gate

This skill does NOT:
- Build memory files (that is memory:building's job)
- Scan the full codebase exhaustively (uses targeted sampling)
- Make decisions without asking
- Skip the spec or plan checkpoint
```

- [ ] **Step 6: Update the skill description in frontmatter**

Replace line 3:

```markdown
description: Interactively analyze project source or requirements docs — deep Q&A, SRP-enforced topic decomposition, spec and plan generation for memory file creation
```

With:

```markdown
description: Interactively analyze project source, requirements docs, or conversational knowledge — deep Q&A, SRP-enforced topic decomposition, spec and plan generation for memory file creation
```

- [ ] **Step 7: Update the opening paragraph**

Replace line 8:

```markdown
Interactively analyze a project's source code or requirements documents to produce a spec and plan for memory file creation. Enforces Single Responsibility Principle at every stage through deep Q&A.
```

With:

```markdown
Interactively analyze a project's source code, requirements documents, or tribal knowledge (via interview) to produce a spec and plan for memory file creation. Enforces Single Responsibility Principle at every stage through deep Q&A.
```

- [ ] **Step 8: Commit**

```bash
git add bin/skills/memory-analyze.md
git commit -m "feat: add interview mode to memory:analyze skill"
```

---

### Task 2: Delete extract and interview skill files

**Files:**
- Delete: `bin/skills/memory-extract.md`
- Delete: `bin/skills/memory-interview.md`

- [ ] **Step 1: Delete the skill files**

```bash
git rm bin/skills/memory-extract.md bin/skills/memory-interview.md
```

- [ ] **Step 2: Commit**

```bash
git commit -m "feat: remove memory:extract and memory:interview skills

These are now consolidated into memory:analyze as document mode
and interview mode respectively."
```

---

### Task 3: Update memory:scan recommendations

**Files:**
- Modify: `bin/skills/memory-scan.md`

The scan skill recommends extract and interview as next steps for projects with existing memory (lines 134-136).

- [ ] **Step 1: Update the "projects with existing memory" suggestion**

In `bin/skills/memory-scan.md`, replace lines 130-137:

```markdown
**For projects with existing memory:**

If registries already have entries, adjust the suggestion:

```
## Suggested Next Step

Your knowledge base already has content. Options:
- Run `memory:analyze` to add more memory files
- Run `memory:interview` to capture tribal knowledge
- Run `memory:extract` if you have new requirements documents
```
```

With:

```markdown
**For projects with existing memory:**

If registries already have entries, adjust the suggestion:

```
## Suggested Next Step

Your knowledge base already has content. Options:
- Run `memory:analyze` (source mode) to analyze code changes
- Run `memory:analyze` (document mode) to add knowledge from new documents
- Run `memory:analyze` (interview mode) to capture tribal knowledge
```
```

- [ ] **Step 2: Commit**

```bash
git add bin/skills/memory-scan.md
git commit -m "fix: update memory:scan recommendations after skill consolidation"
```

---

### Task 4: Update init.sh dry-run output

**Files:**
- Modify: `bin/init.sh`

The dry-run output lists extract and interview (lines 81-82). The actual file copy loop (lines 148-157) uses a glob on `$SKILLS_DIR/*.md`, so deleting the files in Task 2 is sufficient — no code change needed there. Only the dry-run echo list needs updating.

- [ ] **Step 1: Remove extract and interview from dry-run output**

In `bin/init.sh`, delete lines 81-82:

```bash
  echo "  .claude/commands/memory-extract.md"
  echo "  .claude/commands/memory-interview.md"
```

- [ ] **Step 2: Commit**

```bash
git add bin/init.sh
git commit -m "fix: remove extract/interview from init.sh dry-run output"
```

---

### Task 5: Update skills-guide.md

**Files:**
- Modify: `guideline/skills-guide.md`

This is the largest documentation change. The skills guide has references to extract and interview throughout: overview table, workflow sections, skill reference sections, decision table, common patterns, and tips.

- [ ] **Step 1: Update the overview table**

Replace lines 11-17:

```markdown
| Skill | Command | Input | Output |
|---|---|---|---|
| [Scan](#memoryscan) | `/memory:scan` | Project directory | Status report + recommendations |
| [Analyze](#memoryanalyze) | `/memory:analyze` | Source code or requirements docs | Analysis spec + building plan |
| [Building](#memorybuilding) | `/memory:building` | Approved plan | Memory files + registry entries |
| [Extract](#memoryextract) | `/memory:extract` | Any document (file, URL, paste) | Memory files per extracted topic |
| [Interview](#memoryinterview) | `/memory:interview` | Conversational Q&A | Memory files from tribal knowledge |
| [Check for Updates](#check-for-updates) | `/check-for-updates` | `memory/.harness-version` | Updated skill files |
```

With:

```markdown
| Skill | Command | Input | Output |
|---|---|---|---|
| [Scan](#memoryscan) | `/memory:scan` | Project directory | Status report + recommendations |
| [Analyze](#memoryanalyze) | `/memory:analyze` | Source code, requirements docs, or conversation | Analysis spec + building plan |
| [Building](#memorybuilding) | `/memory:building` | Approved plan | Memory files + registry entries |
| [Check for Updates](#check-for-updates) | `/check-for-updates` | `memory/.harness-version` | Updated skill files |
```

- [ ] **Step 2: Replace the "New project" workflow section**

Replace lines 45-53:

```markdown
### New project (no source code yet)

```
memory:scan → memory:extract (from requirements docs) → memory:interview
```

1. Run `/memory:scan` to confirm the memory structure is initialized
2. Run `/memory:extract` with your requirements documents (SRS, PRD, user stories) to generate initial memory files
3. Run `/memory:interview` to capture domain expertise and team conventions not covered in documents
```

With:

```markdown
### New project (no source code yet)

```
memory:scan → memory:analyze (document or interview mode) → memory:building
```

1. Run `/memory:scan` to confirm the memory structure is initialized
2. Run `/memory:analyze` in document mode with your requirements documents (SRS, PRD, user stories)
3. Run `/memory:building` to build memory files from the approved plan
4. Run `/memory:analyze` in interview mode to capture domain expertise and team conventions not covered in documents
```

- [ ] **Step 3: Replace the "Existing project" workflow section**

Replace lines 55-65:

```markdown
### Existing project (has source code)

```
memory:scan → memory:analyze → memory:building → memory:extract → memory:interview
```

1. Run `/memory:scan` to assess the project state and detect the tech stack
2. Run `/memory:analyze` to interactively analyze the project, decompose into topics, and produce a spec + plan
3. Run `/memory:building` to execute the approved plan and build the memory files
4. Run `/memory:extract` with any supplementary documents (API specs, architecture docs)
5. Run `/memory:interview` to fill gaps — especially for tribal knowledge and unwritten conventions
```

With:

```markdown
### Existing project (has source code)

```
memory:scan → memory:analyze → memory:building
```

1. Run `/memory:scan` to assess the project state and detect the tech stack
2. Run `/memory:analyze` to interactively analyze the project, decompose into topics, and produce a spec + plan
3. Run `/memory:building` to execute the approved plan and build the memory files
4. Run `/memory:analyze` again in document mode with any supplementary documents (API specs, architecture docs)
5. Run `/memory:analyze` in interview mode to fill gaps — especially for tribal knowledge and unwritten conventions
```

- [ ] **Step 4: Replace the "Ongoing maintenance" section**

Replace lines 67-74:

```markdown
### Ongoing maintenance

As the project evolves, run skills again to keep the knowledge base current:

- **New documents arrive** → `/memory:extract`
- **Codebase changed significantly** → `/memory:analyze` + `/memory:building`
- **New team member's expertise to capture** → `/memory:interview`
- **Periodic health check** → `/memory:scan`
```

With:

```markdown
### Ongoing maintenance

As the project evolves, run skills again to keep the knowledge base current:

- **New documents arrive** → `/memory:analyze` (document mode)
- **Codebase changed significantly** → `/memory:analyze` (source mode)
- **New team member's expertise to capture** → `/memory:analyze` (interview mode)
- **Periodic health check** → `/memory:scan`
```

- [ ] **Step 5: Update the analyze skill reference section**

Replace lines 120-154:

```markdown
### memory:analyze

**Purpose:** Interactively analyze a project's source code or requirements documents to produce a spec and plan for memory file creation, with SRP enforcement at every stage.

**When to use:**
- Bootstrapping a knowledge base for an existing codebase
- Starting a new project with requirements documents but no code yet
- Adding coverage after a major architectural change

**What it does:**
1. Asks you to choose source-based or document-based mode
2. Analyzes source code or reads provided documents to identify knowledge topics
3. Proposes topics with SRP enforcement — proactively splits any topic that covers multiple concerns
4. Deep-dives each topic through thorough Q&A (one question at a time) to nail down scope, content, and boundaries
5. Writes an analysis spec for your review (`docs/memory-plan/`)
6. Writes a building plan for your review (`docs/memory-plan/`)
7. Hands off to `memory:building` once the plan is approved

**Two modes:**

| Mode | Input | Best for |
|---|---|---|
| Source-based | Existing codebase | Extracting patterns, architecture, conventions from code |
| Document-based | Requirements docs (SRS, PRD, user stories) | New projects or pre-implementation knowledge capture |

**SRP enforcement:** The skill enforces Single Responsibility at two stages:
1. During topic decomposition — challenges any topic that fails the "A and B" test
2. During spec self-review — re-validates every topic before presenting to the user

**No file cap:** the interactive Q&A and spec/plan approvals are the quality gates. The analysis determines the right number of topics.

**Artifacts produced:**
- Analysis spec: `docs/memory-plan/YYYY-MM-DD-<project>-analysis.md`
- Building plan: `docs/memory-plan/YYYY-MM-DD-<project>-plan.md`
```

With:

```markdown
### memory:analyze

**Purpose:** Interactively analyze a project's source code, requirements documents, or tribal knowledge to produce a spec and plan for memory file creation, with SRP enforcement at every stage.

**When to use:**
- Bootstrapping a knowledge base for an existing codebase
- Starting a new project with requirements documents but no code yet
- Capturing tribal knowledge — expertise that lives in people's heads
- Adding coverage after a major architectural change
- Ongoing document intake as new specs or requirements arrive

**What it does:**
1. Asks you to choose source-based, document-based, or interview mode
2. Analyzes source code, reads provided documents, or conducts structured Q&A to identify knowledge topics
3. Proposes topics with SRP enforcement — proactively splits any topic that covers multiple concerns
4. Deep-dives each topic through thorough Q&A (one question at a time) to nail down scope, content, and boundaries
5. Writes an analysis spec for your review (`docs/memory-plan/`)
6. Writes a building plan for your review (`docs/memory-plan/`)
7. Hands off to `memory:building` once the plan is approved

**Three modes:**

| Mode | Input | Best for |
|---|---|---|
| Source-based | Existing codebase | Extracting patterns, architecture, conventions from code |
| Document-based | Requirements docs (SRS, PRD, API specs, any document) | New projects, pre-implementation knowledge, ongoing document intake |
| Interview | Conversation (no artifacts needed) | Tribal knowledge, team expertise, unwritten conventions |

**Interview mode features:**
- Built-in question bank with 30 starter questions (10 per store) — adapts dynamically based on answers
- Gap detection — reads existing registries and focuses on thin areas
- Periodic checkpoints every 3-4 answers to validate accuracy
- All captured knowledge flows through the same SRP-enforced pipeline as other modes

**SRP enforcement:** The skill enforces Single Responsibility at two stages:
1. During topic decomposition — challenges any topic that fails the "A and B" test
2. During spec self-review — re-validates every topic before presenting to the user

**No file cap:** the interactive Q&A and spec/plan approvals are the quality gates. The analysis determines the right number of topics.

**Artifacts produced:**
- Analysis spec: `docs/memory-plan/YYYY-MM-DD-<project>-analysis.md`
- Building plan: `docs/memory-plan/YYYY-MM-DD-<project>-plan.md`
```

- [ ] **Step 6: Delete the extract and interview reference sections**

Delete lines 189-234 (the `### memory:extract` and `### memory:interview` sections, including the `---` separator before extract).

- [ ] **Step 7: Update the "How Skills Work Together" decision table**

Replace lines 266-276:

```markdown
## How Skills Work Together

Each skill fills a different niche in the knowledge capture pipeline:

| Knowledge source | Skill to use |
|---|---|
| Existing source code | `memory:analyze` → `memory:building` |
| Requirements documents, specs, PRDs | `memory:analyze` → `memory:building` (from docs) or `memory:extract` |
| Ongoing document intake | `memory:extract` |
| Team expertise, unwritten conventions | `memory:interview` |
| "Where do I start?" | `memory:scan` |
```

With:

```markdown
## How Skills Work Together

Each skill fills a different niche in the knowledge capture pipeline:

| Knowledge source | Skill to use |
|---|---|
| Existing source code | `memory:analyze` (source mode) → `memory:building` |
| Requirements documents, specs, PRDs | `memory:analyze` (document mode) → `memory:building` |
| Ongoing document intake | `memory:analyze` (document mode) → `memory:building` |
| Team expertise, unwritten conventions | `memory:analyze` (interview mode) → `memory:building` |
| "Where do I start?" | `memory:scan` |
```

- [ ] **Step 8: Replace the "Common Patterns" section**

Replace lines 283-309:

```markdown
## Common Patterns

### Bootstrap a legacy codebase

```
/memory:scan                    # Assess the project
/memory:analyze                 # Interactive analysis, produces spec + plan
/memory:building                # Build memory files from approved plan
/memory:interview               # Fill in team conventions and business rules
```

### Start a new project from specs

```
/memory:scan                    # Confirm structure is initialized
/memory:extract                 # Feed in the SRS/PRD
/memory:extract                 # Feed in API specs, architecture docs
/memory:interview               # Capture team decisions and constraints
```

### Onboard a new team member

```
/memory:scan                    # Show them the knowledge base state
/memory:interview               # Interview the departing/senior developer
```
```

With:

```markdown
## Common Patterns

### Bootstrap a legacy codebase

```
/memory:scan                    # Assess the project
/memory:analyze                 # Source mode — interactive analysis, produces spec + plan
/memory:building                # Build memory files from approved plan
/memory:analyze                 # Interview mode — fill in team conventions and business rules
```

### Start a new project from specs

```
/memory:scan                    # Confirm structure is initialized
/memory:analyze                 # Document mode — feed in the SRS/PRD, API specs, architecture docs
/memory:building                # Build memory files from approved plan
/memory:analyze                 # Interview mode — capture team decisions and constraints
```

### Onboard a new team member

```
/memory:scan                    # Show them the knowledge base state
/memory:analyze                 # Interview mode — interview the departing/senior developer
/memory:building                # Build memory files from approved plan
```
```

- [ ] **Step 9: Replace the "Tips" section**

Replace lines 313-320:

```markdown
## Tips

- **Start with scan.** It takes seconds and tells you exactly what to do next.
- **One skill at a time.** Each skill is a focused session. Don't try to do everything in one conversation.
- **Review carefully.** Skills produce specs and plans for your approval — take the time to correct inaccuracies before proceeding.
- **Run skills again.** They read existing registries and focus on gaps. Multiple runs build better coverage than one marathon session.
- **Analyze vs. extract:** If you have code, start with analyze. If you have standalone documents, start with extract. Analyze produces a spec + plan; extract writes files directly.
- **Interview last.** After analysis and extraction, the interview skill can identify exactly what's missing and focus its questions on gaps.
```

With:

```markdown
## Tips

- **Start with scan.** It takes seconds and tells you exactly what to do next.
- **One skill at a time.** Each skill is a focused session. Don't try to do everything in one conversation.
- **Review carefully.** Skills produce specs and plans for your approval — take the time to correct inaccuracies before proceeding.
- **Run skills again.** They read existing registries and focus on gaps. Multiple runs build better coverage than one marathon session.
- **Pick the right mode:** Source mode for code, document mode for specs/requirements, interview mode for tribal knowledge.
- **Interview mode last.** After source or document analysis, interview mode can identify exactly what's missing and focus its questions on gaps.
```

- [ ] **Step 10: Commit**

```bash
git add guideline/skills-guide.md
git commit -m "docs: update skills guide for 3-skill toolkit"
```

---

### Task 6: Update README.md

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update the toolkit description**

Replace line 18:

```markdown
- **Memory Toolkit Skills** — AI-powered skills that automate memory creation through scanning, analysis, building, extraction, and interviews
```

With:

```markdown
- **Memory Toolkit Skills** — AI-powered skills that automate memory creation through scanning, analysis, and building
```

- [ ] **Step 2: Update the skills table**

Replace lines 57-64:

```markdown
| Skill | Command | Purpose |
|---|---|---|
| **Scan** | `/memory:scan` | Quick project overview — checks memory state, detects tech stack, suggests next steps |
| **Analyze** | `/memory:analyze` | Deep-analyze source code or requirements docs to generate initial memory files |
| **Building** | `/memory:building` | Execute an approved plan to build memory files with two-stage review |
| **Extract** | `/memory:extract` | Extract knowledge from any document (SRS, PRD, API specs) into memory files |
| **Interview** | `/memory:interview` | Capture tribal knowledge through structured Q&A with team members |
| **Check for Updates** | `/check-for-updates` | Check for new Harness Engineering releases and apply updates |
```

With:

```markdown
| Skill | Command | Purpose |
|---|---|---|
| **Scan** | `/memory:scan` | Quick project overview — checks memory state, detects tech stack, suggests next steps |
| **Analyze** | `/memory:analyze` | Analyze source code, documents, or conversational knowledge to generate memory files |
| **Building** | `/memory:building` | Execute an approved plan to build memory files with two-stage review |
| **Check for Updates** | `/check-for-updates` | Check for new Harness Engineering releases and apply updates |
```

- [ ] **Step 3: Update the recommended workflow steps**

Replace lines 70-75:

```markdown
1. **Scan** first to understand the project state and get recommendations
2. **Analyze** the project interactively to produce a spec and plan
3. **Build** the memory files from the approved plan
4. **Extract** from additional documents as they arrive
5. **Interview** team members to capture knowledge that isn't written down
```

With:

```markdown
1. **Scan** first to understand the project state and get recommendations
2. **Analyze** the project interactively — choose source, document, or interview mode
3. **Build** the memory files from the approved plan
```

- [ ] **Step 4: Update the directory tree**

Replace lines 101-107:

```markdown
│   └── skills/               # Memory toolkit skill definitions
│       ├── memory-scan.md
│       ├── memory-analyze.md
│       ├── memory-building.md
│       ├── memory-extract.md
│       ├── memory-interview.md
│       ├── check-for-updates.md
```

With:

```markdown
│   └── skills/               # Memory toolkit skill definitions
│       ├── memory-scan.md
│       ├── memory-analyze.md
│       ├── memory-building.md
│       ├── check-for-updates.md
```

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: update README for 3-skill toolkit"
```
