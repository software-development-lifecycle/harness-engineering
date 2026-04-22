# Memory Skills Redesign Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the monolithic `memory-seeding` skill with two properly separated skills: `memory-analyze` (interactive analysis → spec → plan) and `memory-building` (execute plan → build memory files with two-stage review).

**Architecture:** memory-analyze follows the brainstorming + writing-plans interactive discipline. memory-building follows the subagent-driven-development pattern with memory-specific review stages. The plan file in `docs/memory-plan/` is the handoff artifact between them.

**Tech Stack:** Markdown skill files, YAML registries, shell script (init.sh)

**Spec:** `docs/memory-plan/2026-04-22-memory-skills-redesign-spec.md`

---

### Task 1: Create memory-analyze.md

**Files:**
- Create: `bin/skills/memory-analyze.md`

This is the core skill — the interactive analysis engine that replaces memory-seeding.

- [ ] **Step 1: Create the skill file with frontmatter**

```yaml
---
name: memory:analyze
description: Interactively analyze project source or requirements docs — deep Q&A, SRP-enforced topic decomposition, spec and plan generation for memory file creation
---
```

- [ ] **Step 2: Write the header and interaction discipline section**

```markdown
# memory:analyze

Interactively analyze a project's source code or requirements documents to produce a spec and plan for memory file creation. Enforces Single Responsibility Principle at every stage through deep Q&A.

## Interaction Discipline

- One question at a time — do NOT ask multiple questions in one message
- Multiple choice preferred — easier for the user to decide
- Propose then confirm — never act without user approval
- Incremental validation — get approval at each step before moving on
- Keep asking until confident — never move to the next phase with vague understanding
```

- [ ] **Step 3: Write Phase 1 — Setup**

```markdown
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
```

- [ ] **Step 4: Write Phase 2 — Analysis**

```markdown
### Phase 2: Analysis

**Step 3: Run analysis**

**For source-based mode:**

1. Detect the tech stack by reading manifest/config files (package.json, go.mod, *.csproj, pom.xml, build.gradle, requirements.txt, pyproject.toml, etc.)
2. Sample key files following priority order: entry point, one controller/handler, one service, one model, configuration files
3. Identify:
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

**Step 4: Present findings**

Present a structured summary to the user:

> Here's what I found:
>
> **Technical:** [list of technical patterns/components discovered]
> **Domain:** [list of domain concepts discovered]
> **Rules:** [list of constraints discovered]
>
> Does this look accurate? Anything to correct or add?

Wait for user confirmation before proceeding.
```

- [ ] **Step 5: Write Phase 3 — Topic Decomposition with deep Q&A**

This is the critical phase that was missing from the old skill. It enforces SRP through interactive questioning.

```markdown
### Phase 3: Topic Decomposition

**Step 5: Propose initial topics with SRP challenge**

Present proposed topics as a table:

> I recommend capturing these topics as memory files:
>
> | # | Topic | Store | Description | Reason |
> |---|---|---|---|---|
> | 1 | [topic] | [store] | [description] | [why this is single-responsibility] |
>
> **SRP check:** For any topic that covers multiple concerns, proactively split it:
>
> "[Topic X] covers [A], [B], and [C] — those are [N] concerns that change for different reasons. I recommend splitting into: 1) [A-specific], 2) [B-specific], 3) [C-specific]."
>
> Which topics should we proceed with? Any to add, remove, or split differently?

**Step 6: Deep-dive each topic (one at a time)**

For each approved topic, ask a series of questions — one per message — to nail down scope and content. Adapt questions based on store type:

**For technical topics, ask about:**
- What architecture pattern does this use? (e.g., layered, hexagonal, event-driven)
- What are the key components/classes involved?
- What are the common usage patterns a developer would need?
- What are the trade-offs or pitfalls someone should know?
- Are there project-specific conventions that differ from framework defaults?
- What related topics should this file explicitly NOT cover? (boundary)

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
- What is the reasoning behind each rule?
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
>
> **Overlap check:** [Flag any overlaps] — "Topic A and Topic B both mention X — which one owns it?"

Wait for user to confirm all boundaries.
```

- [ ] **Step 6: Write Phase 4 — Spec**

```markdown
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
```

- [ ] **Step 7: Write Phase 5 — Plan**

```markdown
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
```

- [ ] **Step 8: Write Phase 6 — Handoff**

```markdown
### Phase 6: Handoff

**Step 14: Invoke memory:building**

After plan is approved, invoke the `memory-building` skill to execute the plan.
```

- [ ] **Step 9: Write the Embedded Knowledge section**

Carry over from the old skill — categorization logic and template formats. These are used during analysis to categorize findings, not during building.

```markdown
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
```

- [ ] **Step 10: Write the Scope section**

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

- [ ] **Step 11: Verify the complete file**

Read back `bin/skills/memory-analyze.md` and verify:
- All 6 phases are present and in order
- Phase 3 has deep Q&A questions for all 3 store types
- SRP enforcement is at two stages (Phase 3 Step 5 + Phase 4 Step 9)
- Spec and plan formats are complete
- Embedded knowledge section is present
- No placeholders or TODOs

- [ ] **Step 12: Commit**

```bash
git add bin/skills/memory-analyze.md
git commit -m "feat: create memory-analyze skill with interactive SRP-enforced analysis"
```

---

### Task 2: Create memory-building.md

**Files:**
- Create: `bin/skills/memory-building.md`

The execution engine that builds memory files from an approved plan, with two-stage review per file.

- [ ] **Step 1: Create the skill file with frontmatter**

```yaml
---
name: memory:building
description: Execute an approved memory plan — build memory files with two-stage review (spec compliance + quality) per file, using subagent dispatch
---
```

- [ ] **Step 2: Write the header and overview**

```markdown
# memory:building

Execute an approved memory building plan by dispatching subagents to create each memory file. Each file goes through two-stage review: spec compliance (does it match the plan?) and quality (is it AI-readable, specific, SRP-compliant?).

This skill follows the subagent-driven-development pattern adapted for memory file creation.
```

- [ ] **Step 3: Write the Input section**

```markdown
## Input

Read the approved plan from `docs/memory-plan/YYYY-MM-DD-<project>-plan.md`.

Extract:
- All tasks with full text (topic, file path, store, template, content outline, scope boundaries, registry entry)
- Tech stack (determines which knowledge files to load)
- Spec path (for review reference)
```

- [ ] **Step 4: Write the Knowledge Files section**

```markdown
## Knowledge Files

Located at `memory-building-knowledge/` (relative to this skill's directory):
- `java.md` — Java / Spring Boot / Kotlin
- `nodejs.md` — Node.js / TypeScript
- `python.md` — Python / Django / FastAPI
- `csharp.md` — C# / .NET
- `go.md` — Go

Detect the tech stack from the plan's **Tech Stack** field. Read the matching knowledge file using the Read tool. Use it as guidance when writing files for that tech stack.

If no matching knowledge file exists, proceed with general analysis using the plan's content outline and the template formats from the plan.
```

- [ ] **Step 5: Write the Per-Topic Execution Cycle**

```markdown
## Per-Topic Execution Cycle

For each task in the plan:

### Step 1: Prepare context

- Read the task from the plan (topic scope, boundaries, content outline)
- Load matching knowledge file if the topic's tech stack has one
- Read the target store's `_registry.yaml` to understand existing entries

### Step 2: Dispatch implementer subagent

Dispatch a general-purpose subagent with:

**Prompt template:**

```
You are building a memory file for a knowledge base.

## Task

[FULL TEXT of task from plan — paste it here, don't make subagent read file]

## Template

Use this template structure for the file:

[Template format matching the store type — technical/domain/rules — from the plan]

## Knowledge File Guidance

[Content of the matching language knowledge file, or "No language-specific guidance for this topic."]

## Existing Registry State

[Current contents of the target store's _registry.yaml]

## Quality Criteria

Every memory file MUST be:
- **Specific** — no vague statements like "follow team conventions"
- **AI-readable** — written for AI to read, not humans; use strong language (MUST/MUST NOT)
- **Example-driven** — include DO/DON'T code examples where applicable
- **Single-topic** — one file covers one topic only
- **Concise** — no background history, no filler
- **Self-sufficient** — frontmatter description must be enough to decide relevance without opening the file

## Your Job

1. Create the memory file at the specified path with correct frontmatter
2. Write the content following the template structure and content outline from the plan
3. Stay within the scope boundaries (IN/OUT) — do not include content marked as OUT
4. Update the store's `_registry.yaml` with the registry entry from the plan
5. Create subdirectories if needed

## Report Format

- **Status:** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
- File written and path
- Registry updated (yes/no)
- Any concerns
```

### Step 3: Spec compliance review (subagent)

Dispatch a review subagent:

```
You are reviewing whether a memory file matches its plan specification.

## What Was Planned

[FULL TEXT of task from plan, including scope boundaries]

## What Was Built

[Implementer's report — file path, registry update status]

## Your Job

Read the actual file and verify:

**Scope compliance:**
- Does the file cover exactly what the plan specified (scope IN)?
- Does it avoid content marked as scope OUT?
- Is the store assignment correct?

**SRP compliance:**
- Apply the "A and B" test: can the file's content be described as "A and B" where A and B are unrelated? If yes, it must be split.
- Does the file have more than 2 unrelated ## headings?

**Registry compliance:**
- Is the registry entry present with correct id, path, and desc?
- Is the desc good enough to decide relevance without opening the file?

**Structure compliance:**
- Does the file follow the correct template (technical/domain/rules)?
- Is the frontmatter complete (id, store, title, description, last_updated)?

Report:
- ✅ Spec compliant
- ❌ Issues found: [list specifically what's wrong]
```

### Step 4: Quality review (subagent)

Dispatch after spec compliance passes:

```
You are reviewing the quality of a memory file for an AI knowledge base.

## The File

[Path to the memory file]

## Quality Criteria

Review the file against these criteria:

**AI-readability:**
- Does it use specific, unambiguous language?
- Does it use MUST/MUST NOT for rules and constraints?
- Would an AI model understand exactly what to do after reading this?
- Are there vague statements like "follow team conventions" or "use appropriate patterns"?

**Example quality:**
- Does it include DO/DON'T code examples where applicable?
- Are examples concrete and minimal (not full classes)?
- Do examples illustrate the point clearly?

**Conciseness:**
- Is there filler, background history, or unnecessary context?
- Could any section be shortened without losing information?
- Are tables used instead of paragraphs where appropriate?

**Template adherence:**
- Does it follow the correct template structure for its store type?
- Are sections ordered correctly?
- Is the "Notes" section removed if empty?

**Frontmatter:**
- Is description self-sufficient (can decide relevance without opening)?
- Is last_updated set to today's date?

Report:
- ✅ Quality approved
- ❌ Issues found: [list specifically what to improve]
```

### Step 5: Fix loop

If either reviewer finds issues:
1. Dispatch the implementer subagent again with specific fix instructions
2. Re-run the failed review
3. Repeat until both reviews pass

### Step 6: Mark task complete, move to next topic
```

- [ ] **Step 6: Write the Final Review section**

```markdown
## Final Review

After all topics are built, dispatch a final review subagent to check cross-file consistency:

```
You are reviewing a complete set of memory files for cross-file consistency.

## Files Built

[List all files with paths]

## Plan Reference

[Path to the plan file]

## Check

1. **No overlaps:** Do any two files cover the same content? Flag duplicates.
2. **No gaps:** Does every task in the plan have a corresponding file? Flag missing files.
3. **Registry sync:** Is every file registered in its store's `_registry.yaml`? Are there orphan entries?
4. **Boundary compliance:** Do files respect their scope IN/OUT boundaries? Is there content in one file that belongs in another per the plan?
5. **ID uniqueness:** Are all registry IDs unique within each store?

Report:
- ✅ All consistent
- ❌ Issues found: [list with file references]
```

If issues found, dispatch fix subagents and re-review.
```

- [ ] **Step 7: Write the Scope section**

```markdown
## Scope

This skill:
- Executes an approved plan from `docs/memory-plan/`
- Dispatches subagents for implementation and review
- Loads language-specific knowledge files when tech stack requires it
- Two-stage review per file (spec compliance + quality)
- Final cross-file consistency review

This skill does NOT:
- Analyze the project (that is memory:analyze's job)
- Make topic decisions or decompose topics
- Write files without a plan
- Skip any review stage
```

- [ ] **Step 8: Verify the complete file**

Read back `bin/skills/memory-building.md` and verify:
- Input section describes how to read the plan
- Knowledge files section is correct
- Per-topic cycle has all 6 steps
- All 3 subagent prompt templates are complete (implementer, spec reviewer, quality reviewer)
- Final review section is present
- No placeholders

- [ ] **Step 9: Commit**

```bash
git add bin/skills/memory-building.md
git commit -m "feat: create memory-building skill with subagent dispatch and two-stage review"
```

---

### Task 3: Rename memory-seeding-knowledge/ to memory-building-knowledge/

**Files:**
- Rename: `bin/skills/memory-seeding-knowledge/` → `bin/skills/memory-building-knowledge/`

- [ ] **Step 1: Rename the directory**

```bash
mv bin/skills/memory-seeding-knowledge/ bin/skills/memory-building-knowledge/
```

- [ ] **Step 2: Verify all 5 knowledge files are present**

```bash
ls bin/skills/memory-building-knowledge/
```

Expected: `csharp.md`, `go.md`, `java.md`, `nodejs.md`, `python.md`

- [ ] **Step 3: Commit**

```bash
git add bin/skills/memory-seeding-knowledge/ bin/skills/memory-building-knowledge/
git commit -m "refactor: rename memory-seeding-knowledge to memory-building-knowledge"
```

---

### Task 4: Delete memory-seeding.md

**Files:**
- Delete: `bin/skills/memory-seeding.md`

- [ ] **Step 1: Delete the file**

```bash
rm bin/skills/memory-seeding.md
```

- [ ] **Step 2: Verify it's gone**

```bash
ls bin/skills/memory-seeding.md 2>&1
```

Expected: "No such file or directory"

- [ ] **Step 3: Commit**

```bash
git rm bin/skills/memory-seeding.md
git commit -m "refactor: remove old memory-seeding skill (replaced by memory-analyze + memory-building)"
```

---

### Task 5: Update .claude/commands/ installed copies

The `bin/skills/` directory contains the source of truth. The `.claude/commands/` directory contains installed copies for the current project. Both must be updated.

**Files:**
- Delete: `.claude/commands/memory-seeding.md`
- Delete: `.claude/commands/memory-seeding-knowledge/` (entire directory)
- Create: `.claude/commands/memory-analyze.md` (copy from `bin/skills/memory-analyze.md`)
- Create: `.claude/commands/memory-building.md` (copy from `bin/skills/memory-building.md`)
- Create: `.claude/commands/memory-building-knowledge/` (copy from `bin/skills/memory-building-knowledge/`)

- [ ] **Step 1: Remove old installed files**

```bash
rm .claude/commands/memory-seeding.md
rm -r .claude/commands/memory-seeding-knowledge/
```

- [ ] **Step 2: Copy new skill files**

```bash
cp bin/skills/memory-analyze.md .claude/commands/memory-analyze.md
cp bin/skills/memory-building.md .claude/commands/memory-building.md
cp -r bin/skills/memory-building-knowledge/ .claude/commands/memory-building-knowledge/
```

- [ ] **Step 3: Verify**

```bash
ls .claude/commands/memory-analyze.md .claude/commands/memory-building.md .claude/commands/memory-building-knowledge/
```

- [ ] **Step 4: Commit**

```bash
git add .claude/commands/
git commit -m "refactor: update installed commands — replace memory-seeding with memory-analyze + memory-building"
```

---

### Task 6: Update init.sh

**Files:**
- Modify: `bin/init.sh`

The init script installs skill files into target projects. Update it to install the new skills instead of the old one.

- [ ] **Step 1: Read current init.sh to find the memory-seeding references**

Lines to find:
```bash
echo "  .claude/commands/memory-seeding.md"
echo "  .claude/commands/memory-seeding-knowledge/"
```

And the corresponding `cp` commands that install these files.

- [ ] **Step 2: Replace memory-seeding references with new skills**

Replace all `memory-seeding` references:
- `memory-seeding.md` → `memory-analyze.md` and `memory-building.md`
- `memory-seeding-knowledge/` → `memory-building-knowledge/`

Update both the `cp` commands and the `echo` summary lines.

- [ ] **Step 3: Verify init.sh has no remaining memory-seeding references**

```bash
grep -n "memory-seeding" bin/init.sh
```

Expected: no output

- [ ] **Step 4: Commit**

```bash
git add bin/init.sh
git commit -m "refactor: update init.sh to install memory-analyze + memory-building instead of memory-seeding"
```

---

### Task 7: Update cross-references in other skills

**Files:**
- Modify: `bin/skills/memory-extract.md`
- Modify: `bin/skills/memory-interview.md`
- Modify: `bin/skills/memory-scan.md`

These skills reference `memory:seeding`. Update all references to point to `memory:analyze`.

- [ ] **Step 1: Update memory-extract.md**

Find:
```markdown
- Analyze source code (use memory:seeding for that)
```

Replace with:
```markdown
- Analyze source code (use memory:analyze for that)
```

- [ ] **Step 2: Update memory-interview.md**

Find:
```markdown
- Analyze source code (use memory:seeding for that)
```

Replace with:
```markdown
- Analyze source code (use memory:analyze for that)
```

- [ ] **Step 3: Update memory-scan.md**

Find and replace all 3 occurrences:

1. `Run memory:seeding — it will deep-analyze your existing source code` → `Run memory:analyze — it will deep-analyze your existing source code`
2. `This appears to be a new project. Run memory:seeding with your` → `This appears to be a new project. Run memory:analyze with your`
3. `- Run memory:seeding to add more memory files` → `- Run memory:analyze to add more memory files`

- [ ] **Step 4: Update the .claude/commands/ installed copies too**

Apply the same changes to:
- `.claude/commands/memory-extract.md`
- `.claude/commands/memory-interview.md`
- `.claude/commands/memory-scan.md`

- [ ] **Step 5: Verify no remaining memory:seeding references in skill files**

```bash
grep -rn "memory.seeding\|memory-seeding\|memory:seeding" bin/skills/ .claude/commands/
```

Expected: no output

- [ ] **Step 6: Commit**

```bash
git add bin/skills/memory-extract.md bin/skills/memory-interview.md bin/skills/memory-scan.md
git add .claude/commands/memory-extract.md .claude/commands/memory-interview.md .claude/commands/memory-scan.md
git commit -m "refactor: update cross-references from memory:seeding to memory:analyze in all skills"
```

---

### Task 8: Update documentation

**Files:**
- Modify: `guideline/skills-guide.md`
- Modify: `README.md`

- [ ] **Step 1: Update skills-guide.md**

Replace all references to `memory:seeding` with the new two-skill setup:

1. Update the skills table — replace the Seeding row with two rows (Analyze + Building)
2. Update the installation section — `memory-seeding-knowledge/` → `memory-building-knowledge/`
3. Update the recommended workflow: `memory:scan → memory:seeding → ...` → `memory:scan → memory:analyze → memory:building → ...`
4. Update the `memory:seeding` section heading and content to describe both new skills
5. Update the knowledge files listing — `memory-seeding-knowledge/` → `memory-building-knowledge/`
6. Update the "when to use which skill" table
7. Update the example workflow commands

- [ ] **Step 2: Update README.md**

1. Update the quick start commands — `/memory:seeding` → `/memory:analyze`
2. Update the skills table — replace Seeding row with Analyze + Building rows
3. Update the knowledge files table — `memory-seeding-knowledge/` → `memory-building-knowledge/`
4. Update the directory tree — replace `memory-seeding.md` and `memory-seeding-knowledge/` with new names

- [ ] **Step 3: Verify no remaining memory-seeding references in docs**

```bash
grep -rn "memory.seeding\|memory-seeding\|memory:seeding" guideline/ README.md
```

Expected: no output

- [ ] **Step 4: Commit**

```bash
git add guideline/skills-guide.md README.md
git commit -m "docs: update documentation for memory-analyze + memory-building skill split"
```

---

### Task 9: Update historical design specs (light touch)

**Files:**
- Modify: `docs/superpowers/specs/2026-04-21-memory-seeding-design.md`
- Modify: `docs/superpowers/specs/2026-04-21-memory-extract-design.md`
- Modify: `docs/superpowers/specs/2026-04-21-memory-interview-design.md`
- Modify: `docs/superpowers/specs/2026-04-21-memory-scan-design.md`

These are historical design docs. Add a deprecation note at the top of each, pointing to the new spec. Do NOT rewrite the content — these are historical records.

- [ ] **Step 1: Add deprecation note to memory-seeding-design.md**

Add at the top (after the H1):

```markdown
> **SUPERSEDED:** This design has been replaced by [Memory Skills Redesign](../../memory-plan/2026-04-22-memory-skills-redesign-spec.md). The `memory:seeding` skill has been split into `memory:analyze` + `memory:building`.
```

- [ ] **Step 2: Add note to memory-extract-design.md, memory-interview-design.md, memory-scan-design.md**

Add at the top:

```markdown
> **NOTE:** References to `memory:seeding` in this document now refer to `memory:analyze`. See [Memory Skills Redesign](../../memory-plan/2026-04-22-memory-skills-redesign-spec.md).
```

- [ ] **Step 3: Update memory-scan-design.md recommendations**

The scan design spec contains output templates that recommend `memory:seeding`. Update these to `memory:analyze`.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/
git commit -m "docs: add superseded notes to historical design specs referencing memory:seeding"
```
