# Memory Toolkit Skills Guide

The Memory Toolkit is a set of AI-powered skills that automate the creation and maintenance of Harness Engineering memory files. Instead of writing memory files by hand, these skills analyze your project and generate properly formatted, registry-synced memory files through interactive workflows.

**Prerequisite:** read the [README](../README.md) for a project overview and [Memory Management Best Practices](memory-management-best-practices.md) for the underlying principles.

---

## Overview

| Skill | Command | Input | Output |
|---|---|---|---|
| [Scan](#memoryscan) | `/memory:scan` | Project directory | Status report + recommendations |
| [Analyze](#memoryanalyze) | `/memory:analyze` | Source code, requirements docs, or conversation | Analysis spec + building plan |
| [Building](#memorybuilding) | `/memory:building` | Approved plan | Memory files + registry entries |
| [Check for Updates](#check-for-updates) | `/check-for-updates` | `memory/.harness-version` | Updated skill files |

All skills are **interactive** — they propose, you review, they write. Nothing is created without your approval.

---

## Installation

Skills are installed automatically by the bootstrapping script:

```bash
./bin/init.sh /path/to/your-project
```

This copies skill files from `bin/skills/` into your project's `.claude/commands/` directory, making them available as slash commands in Claude Code.

**Manual installation:** copy the files from `bin/skills/` to your project's `.claude/commands/` directory:

```bash
cp bin/skills/*.md /path/to/your-project/.claude/commands/
cp -r bin/skills/memory-building-knowledge/ /path/to/your-project/.claude/commands/
```

---

## Recommended Workflow

### New project (no source code yet)

```
memory:scan → memory:analyze (document or interview mode) → memory:building
```

1. Run `/memory:scan` to confirm the memory structure is initialized
2. Run `/memory:analyze` in document mode with your requirements documents (SRS, PRD, user stories)
3. Run `/memory:building` to build memory files from the approved plan
4. Run `/memory:analyze` in interview mode to capture domain expertise and team conventions not covered in documents

### Existing project (has source code)

```
memory:scan → memory:analyze → memory:building
```

1. Run `/memory:scan` to assess the project state and detect the tech stack
2. Run `/memory:analyze` to interactively analyze the project, decompose into topics, and produce a spec + plan
3. Run `/memory:building` to execute the approved plan and build the memory files
4. Run `/memory:analyze` again in document mode with any supplementary documents (API specs, architecture docs)
5. Run `/memory:analyze` in interview mode to fill gaps — especially for tribal knowledge and unwritten conventions

### Ongoing maintenance

As the project evolves, run skills again to keep the knowledge base current:

- **New documents arrive** → `/memory:analyze` (document mode)
- **Codebase changed significantly** → `/memory:analyze` (source mode)
- **New team member's expertise to capture** → `/memory:analyze` (interview mode)
- **Periodic health check** → `/memory:scan`

---

## Skill Reference

### memory:scan

**Purpose:** Quick, read-only assessment of the project's memory state and source code.

**When to use:**
- Starting work on a project for the first time
- Checking if the memory structure is initialized
- Getting a recommendation on which skill to run next

**What it does:**
1. Checks for the presence of `memory/HARNESS.yaml` and all three `_registry.yaml` files
2. Determines memory state: empty registries, partial, or populated
3. Scans for source code indicators (common directories and config files)
4. Reads config/manifest files to identify the tech stack
5. Reports findings and recommends a next step

**What it does NOT do:**
- Write or modify any files
- Deep-analyze source code
- Generate memory files

**Example output:**

```
## Project Scan

Memory status: Initialized (registries empty)
Source code: Detected
Tech stack: Node.js / Express (from package.json)
Project shape: REST API with PostgreSQL, deployed via Docker

## Suggested Next Step

Run memory:analyze — it will deep-analyze your existing source code
to generate an initial knowledge base for the technical, domain, and
rules memory stores.
```

---

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

---

### memory:building

**Purpose:** Execute an approved plan to build memory files with two-stage review per file.

**When to use:**
- After `memory:analyze` produces an approved plan
- Never invoked directly without a plan — always preceded by `memory:analyze`

**What it does:**
1. Reads the approved plan from `docs/memory-plan/`
2. For each topic in the plan, dispatches a subagent to build the memory file
3. Runs spec compliance review (does the file match the plan?)
4. Runs quality review (is it AI-readable, specific, SRP-compliant?)
5. Fixes issues until both reviews pass
6. After all files are built, runs a final cross-file consistency review

**Language knowledge files:** The building skill loads language-specific knowledge files to guide its writing for each tech stack:

- `memory-building-knowledge/csharp.md` — C# / .NET
- `memory-building-knowledge/go.md` — Go
- `memory-building-knowledge/java.md` — Java
- `memory-building-knowledge/kotlin.md` — Kotlin / Android
- `memory-building-knowledge/nodejs.md` — Node.js / TypeScript
- `memory-building-knowledge/python.md` — Python

If no matching knowledge file exists, the skill proceeds with general guidance from the plan.

**Two-stage review per file:**
1. **Spec compliance:** Does the file match the plan? Correct scope, store, SRP-compliant, good registry entry?
2. **Quality:** AI-readable, specific language, DO/DON'T examples, concise, correct template?

---

### check-for-updates

**Purpose:** Check for new Harness Engineering releases on GitHub and update the installed skills.

**When to use:**
- Periodically, to check if newer skills are available
- After being notified that a new version has been released
- When skills seem outdated or a known fix has been published

**What it does:**
1. Reads `memory/.harness-version` to get the installed version and GitHub repo
2. Checks the latest GitHub release via `gh` CLI
3. Compares versions — if already up to date, reports and stops
4. Shows release notes and asks for confirmation
5. Downloads the release archive, extracts, and copies files into the project
6. Updates `memory/.harness-version` with the new version

**What it does NOT do:**
- Modify any files under `memory/` (content, registries, HARNESS.yaml)
- Run automatically — always requires user confirmation
- Downgrade — only updates to newer versions

**Prerequisites:**
- `gh` CLI installed and authenticated (`gh auth login`)
- `memory/.harness-version` exists with `version` and `repo` fields (created by `init.sh`)

---

## How Skills Work Together

Each skill fills a different niche in the knowledge capture pipeline:

| Knowledge source | Skill to use |
|---|---|
| Existing source code | `memory:analyze` (source mode) → `memory:building` |
| Requirements documents, specs, PRDs | `memory:analyze` (document mode) → `memory:building` |
| Ongoing document intake | `memory:analyze` (document mode) → `memory:building` |
| Team expertise, unwritten conventions | `memory:analyze` (interview mode) → `memory:building` |
| "Where do I start?" | `memory:scan` |

The skills are designed to be **composable and repeatable**:
- Run any skill multiple times as the project grows
- Skills read existing registries to avoid duplicating topics already covered

---

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

---

## Tips

- **Start with scan.** It takes seconds and tells you exactly what to do next.
- **One skill at a time.** Each skill is a focused session. Don't try to do everything in one conversation.
- **Review carefully.** Skills produce specs and plans for your approval — take the time to correct inaccuracies before proceeding.
- **Run skills again.** They read existing registries and focus on gaps. Multiple runs build better coverage than one marathon session.
- **Pick the right mode:** Source mode for code, document mode for specs/requirements, interview mode for tribal knowledge.
- **Interview mode last.** After source or document analysis, interview mode can identify exactly what's missing and focus its questions on gaps.
