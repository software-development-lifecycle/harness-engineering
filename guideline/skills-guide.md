# Memory Toolkit Skills Guide

The Memory Toolkit is a set of AI-powered skills that automate the creation and maintenance of Harness Engineering memory files. Instead of writing memory files by hand, these skills analyze your project and generate properly formatted, registry-synced memory files through interactive workflows.

**Prerequisite:** read the [README](../README.md) for a project overview and [Memory Management Best Practices](memory-management-best-practices.md) for the underlying principles.

---

## Overview

| Skill | Command | Input | Output |
|---|---|---|---|
| [Scan](#memoryscan) | `/memory:scan` | Project directory | Status report + recommendations |
| [Seeding](#memoryseeding) | `/memory:seeding` | Source code or requirements docs | 3-5 memory files + registry entries |
| [Extract](#memoryextract) | `/memory:extract` | Any document (file, URL, paste) | Memory files per extracted topic |
| [Interview](#memoryinterview) | `/memory:interview` | Conversational Q&A | Memory files from tribal knowledge |

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
cp -r bin/skills/memory-seeding-knowledge/ /path/to/your-project/.claude/commands/
```

---

## Recommended Workflow

### New project (no source code yet)

```
memory:scan → memory:extract (from requirements docs) → memory:interview
```

1. Run `/memory:scan` to confirm the memory structure is initialized
2. Run `/memory:extract` with your requirements documents (SRS, PRD, user stories) to generate initial memory files
3. Run `/memory:interview` to capture domain expertise and team conventions not covered in documents

### Existing project (has source code)

```
memory:scan → memory:seeding (from source) → memory:extract → memory:interview
```

1. Run `/memory:scan` to assess the project state and detect the tech stack
2. Run `/memory:seeding` in source-based mode to generate memory files from code analysis
3. Run `/memory:extract` with any supplementary documents (API specs, architecture docs)
4. Run `/memory:interview` to fill gaps — especially for tribal knowledge and unwritten conventions

### Ongoing maintenance

As the project evolves, run skills again to keep the knowledge base current:

- **New documents arrive** → `/memory:extract`
- **Codebase changed significantly** → `/memory:seeding`
- **New team member's expertise to capture** → `/memory:interview`
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

Run memory:seeding — it will deep-analyze your existing source code
to generate an initial knowledge base for the technical, domain, and
rules memory stores.
```

---

### memory:seeding

**Purpose:** Deep-analyze source code or requirements documents to generate an initial batch of memory files.

**When to use:**
- Bootstrapping a knowledge base for an existing codebase
- Starting a new project with requirements documents but no code yet
- Adding coverage after a major architectural change

**What it does:**
1. Asks you to choose source-based or document-based mode
2. Analyzes source code (reads config files, samples key source files) or reads provided documents
3. Identifies knowledge topics and categorizes them into the three stores
4. Presents a topic list for your approval
5. Drafts each memory file one at a time for your review
6. Writes approved files and updates registries

**Two modes:**

| Mode | Input | Best for |
|---|---|---|
| Source-based | Existing codebase | Extracting patterns, architecture, conventions from code |
| Document-based | Requirements docs (SRS, PRD, user stories) | New projects or pre-implementation knowledge capture |

**Language knowledge files:** In source-based mode, the skill loads a language-specific knowledge file (if available) to guide its analysis. These files tell the skill which files to sample, what patterns to look for, and where domain signals hide for each tech stack:

- `memory-seeding-knowledge/csharp.md` — C# / .NET
- `memory-seeding-knowledge/go.md` — Go
- `memory-seeding-knowledge/java.md` — Java
- `memory-seeding-knowledge/nodejs.md` — Node.js / TypeScript
- `memory-seeding-knowledge/python.md` — Python

If no matching knowledge file exists, the skill falls back to general-purpose heuristics.

**Limits:** generates 3-5 memory files per run. Run the skill again to add more.

---

### memory:extract

**Purpose:** Extract knowledge from any document into properly formatted memory files.

**When to use:**
- You received new requirements documents, API specs, or architecture docs
- You have meeting notes, design documents, or compliance checklists to capture
- Ongoing document intake as the project evolves

**What it does:**
1. Asks you to provide documents (file path, paste, or URL)
2. Reads and analyzes documents using extraction heuristics
3. Identifies knowledge items and categorizes them (Technical, Domain, Rules)
4. Presents findings for your review
5. Drafts each memory file one at a time
6. Writes approved files and updates registries

**Accepts any document format:** markdown, PDF, Word, plain text, pasted content, URLs. The skill adapts its extraction to whatever content you provide.

**Difference from seeding:** Seeding analyzes source code to reverse-engineer knowledge. Extract reads documents that already describe the knowledge explicitly. Use seeding for code, extract for docs.

---

### memory:interview

**Purpose:** Capture tribal knowledge — expertise that lives in people's heads but isn't written down anywhere.

**When to use:**
- Onboarding and you want to capture a senior developer's knowledge
- Business rules exist only as institutional knowledge
- The team learned lessons that should be preserved
- Filling gaps after seeding and extraction

**What it does:**
1. Asks you to choose a focus area (Technical, Domain, Rules, or help me decide)
2. Reads existing registries to identify gaps
3. Conducts a structured Q&A, one question at a time, adapting follow-ups based on your answers
4. Periodically summarizes what it has gathered for your validation
5. Recommends memory files based on the conversation
6. Drafts each file, transforming conversational answers into structured AI-readable format
7. Writes approved files and updates registries

**Built-in question bank:** The skill has starter questions for each store type and adapts dynamically based on your answers. Short answers get follow-up probes; mentions of technologies, workflows, or incidents trigger deeper exploration.

**Difference from extract:** Extract reads existing documents. Interview creates knowledge from scratch through conversation. Use extract when the knowledge is already written; use interview when it's only in someone's head.

---

## How Skills Work Together

Each skill fills a different niche in the knowledge capture pipeline:

| Knowledge source | Skill to use |
|---|---|
| Existing source code | `memory:seeding` (source-based mode) |
| Requirements documents, specs, PRDs | `memory:seeding` (document-based mode) or `memory:extract` |
| Ongoing document intake | `memory:extract` |
| Team expertise, unwritten conventions | `memory:interview` |
| "Where do I start?" | `memory:scan` |

The skills are designed to be **composable and repeatable**:
- Run any skill multiple times as the project grows
- Each run generates 3-5 files — multiple runs build comprehensive coverage
- Skills read existing registries to avoid duplicating topics already covered

---

## Common Patterns

### Bootstrap a legacy codebase

```
/memory:scan                    # Assess the project
/memory:seeding                 # Choose source-based mode, deep scan
/memory:seeding                 # Run again for additional topics
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

---

## Tips

- **Start with scan.** It takes seconds and tells you exactly what to do next.
- **One skill at a time.** Each skill is a focused session. Don't try to do everything in one conversation.
- **Review carefully.** Skills draft files for your approval — take the time to correct inaccuracies before writing.
- **Run skills again.** They read existing registries and focus on gaps. Multiple runs build better coverage than one marathon session.
- **Seeding vs. extract:** If you have code, start with seeding. If you have documents, start with extract. Both produce the same output format.
- **Interview last.** After seeding and extraction, the interview skill can identify exactly what's missing and focus its questions on gaps.
