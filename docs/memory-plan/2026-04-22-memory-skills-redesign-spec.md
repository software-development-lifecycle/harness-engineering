# Memory Skills Redesign: memory-analyze + memory-building

## Problem Statement

The current `memory-seeding` skill produces monolithic memory files that violate the Single Responsibility Principle. Evidence from EShopECO project:

- `spring-boot-backend.md` (128 lines) — covers API Gateway, Security, Controllers (8), Services (8), Repositories, Infrastructure (4 systems), Cross-Cutting Concerns in a single file
- `android-clean-architecture.md` (144 lines) — covers Module Structure, Presentation/Domain/Data Layers, DI, Navigation, Backend Connection in a single file

Per the best practices guide: "if you need to describe a file's contents using 'A and B,' it should be split into two files."

**Root cause:** The skill's analysis phase identifies topics at architectural scope (e.g., "Spring Boot Backend") instead of single-responsibility scope (e.g., "JWT Security", "REST Controllers"). No enforcement mechanism exists during topic selection or file generation.

**Secondary cause:** The skill is not interactive enough — it moves quickly from analysis to file generation without deeply interrogating each topic's scope, boundaries, and content.

## Solution

Split `memory-seeding` into two skills with clear separation of concerns:

| Skill | Role | Analogy |
|---|---|---|
| **memory-analyze** | Interactive analysis, Q&A, spec, plan | superpowers:brainstorming + writing-plans |
| **memory-building** | Execute plan, build memory files with review | superpowers:subagent-driven-development |

## Skill 1: memory-analyze

### Purpose

Interactively analyze a project's source code or requirements documents, deeply interrogate each topic through Q&A, produce a spec and plan for memory file creation. Enforces SRP at every stage.

### Interaction Discipline

- One question at a time — never ask multiple questions in one message
- Multiple choice preferred — easier for the user to decide
- Propose then confirm — never act without user approval
- Incremental validation — get approval at each step before moving on

### Phase 1: Setup

1. Detect project state (has source code? has docs?)
2. Ask user: source-based or document-based mode?
3. Source-based: ask scan depth (light / deep)
4. Document-based: collect document paths, pasted content, or URLs

### Phase 2: Analysis

5. Run the analysis scan:
   - **Source-based:** Read manifest/config files to detect tech stack. Sample key files following priority order (entry point, one controller/handler, one service, one model, config files). Identify architecture patterns, domain entities, coding conventions, constraints.
   - **Document-based:** Read provided documents. Extract technical signals (technologies, architecture, integrations), domain signals (workflows, entities, business rules), and rules signals (mandatory/prohibitive language, compliance requirements).
6. Present raw findings organized by signal type:
   - **Technical:** [list of technical patterns/components discovered]
   - **Domain:** [list of domain concepts discovered]
   - **Rules:** [list of constraints discovered]
7. **Checkpoint:** "Does this look accurate? Anything to correct or add?"

### Phase 3: Topic Decomposition (SRP enforcement)

**Step 1: Propose initial topic list with SRP challenge**

- Present all proposed topics as a table with store assignments
- Proactively split any topic that fails the "A and B" test
- Explain splits: "Spring Boot Backend covers security, controllers, services, infrastructure — that's 4 concerns that change for different reasons. I recommend splitting into: 1) JWT Security, 2) REST Controllers, 3) Service Layer, 4) Infrastructure Config."
- User confirms the overall topic list

**Step 2: Deep-dive each topic, one at a time**

For each approved topic, ask a series of questions (one per message) to nail down the content. Questions adapt based on store type:

**For technical topics:**
- What architecture pattern does this use? (e.g., layered, hexagonal, event-driven)
- What are the key components/classes involved?
- What are the common usage patterns a developer would need?
- What are the trade-offs or pitfalls someone should know?
- Are there any project-specific conventions that differ from the framework defaults?
- What related topics should this file explicitly NOT cover? (boundary definition)

**For domain topics:**
- What is the core business concept in one sentence?
- What are the key terms/glossary entries?
- What are the states/workflows/lifecycles involved?
- What business rules govern this concept?
- What edge cases or exceptions exist?
- What related domain concepts should this file explicitly NOT cover?

**For rules topics:**
- What are the MUST requirements?
- What are the MUST NOT prohibitions?
- What is the reasoning behind each rule? (so AI can judge edge cases)
- Can you give a concrete DO/DON'T example?
- Are there any exceptions where the rule can be relaxed?
- What related rules should this file explicitly NOT cover?

The skill keeps asking until it has enough detail for every topic. It never moves to the spec phase with vague or incomplete understanding.

**Step 3: Boundary confirmation**

- Present a summary showing each topic's scope boundaries (what's in, what's out)
- Explicitly flag overlaps: "Topic A and Topic B both mention X — which one owns it?"
- User confirms boundaries

### Phase 4: Spec

8. Write spec to `docs/memory-plan/YYYY-MM-DD-<project>-analysis.md`
9. Spec self-review: placeholder scan, internal consistency, SRP re-validation (apply "A and B" test to every topic again)
10. **Checkpoint:** User reviews and approves spec file

### Phase 5: Plan

11. Write plan to `docs/memory-plan/YYYY-MM-DD-<project>-plan.md`
12. Plan self-review: check completeness against spec, verify every topic has a task, verify file paths and registry entries are correct
13. **Checkpoint:** User reviews and approves plan file

### Phase 6: Handoff

14. Invoke `memory-building` skill

### SRP Enforcement Points

SRP is checked at two stages (belt and suspenders):

1. **Phase 3 (Q&A):** Challenge any topic that covers multiple concerns during the initial proposal
2. **Phase 4 (Spec self-review):** Re-apply the "A and B" test to every topic before user reviews

### No File Cap

The old skill capped at 5 files per run. The new skill has no cap — the interactive Q&A and spec/plan approval are sufficient quality gates. Let the analysis determine the right number.

## Skill 2: memory-building

### Purpose

Execute an approved plan by building memory files with two-stage review per file. Loads language-specific knowledge files when the tech stack requires it.

### Input

- Reads the approved plan from `docs/memory-plan/YYYY-MM-DD-<project>-plan.md`
- Extracts all tasks, tech stack info, store assignments

### Knowledge Files

Located at `memory-building-knowledge/` (renamed from `memory-seeding-knowledge/`):
- `java.md` — Java/Spring Boot/Kotlin guidance
- `nodejs.md` — Node.js/TypeScript guidance
- `python.md` — Python/Django/FastAPI guidance
- `csharp.md` — C#/.NET guidance
- `go.md` — Go guidance

Memory-building detects the tech stack from the plan, reads the matching knowledge file with the Read tool, and uses it as guidance when writing files. These are reference files, not sub-skills.

### Per-Topic Execution Cycle

**Step 1: Prepare context**
- Read the task from the plan (topic scope, boundaries, content outline)
- Detect tech stack from the plan → load matching knowledge file if relevant
- Read the target store's `_registry.yaml` to understand existing entries

**Step 2: Dispatch implementer subagent**
- Subagent receives: task details from plan, knowledge file content (if loaded), template format, existing registry state
- Subagent writes the memory file + updates `_registry.yaml`
- Subagent creates subdirectories if needed

**Step 3: Spec compliance review (subagent)**
- Does the file match the plan? (correct topic, correct store, correct scope boundaries)
- Does it stay within the "what's in / what's out" boundaries from the spec?
- Is it single-responsibility? Apply the "A and B" test
- Does the registry entry have a good enough `desc`?

**Step 4: Quality review (subagent)**
- Is the file AI-readable? (specific language, MUST/MUST NOT, not vague)
- Does it have DO/DON'T examples where applicable?
- Is it concise? (no filler, no history, no background)
- Does it follow the correct template structure (technical/domain/rules)?
- Is the frontmatter complete and accurate (id, store, title, description, last_updated)?

**Step 5: Fix loop**
- If either reviewer finds issues → implementer fixes → re-review
- Repeat until both reviewers approve

**Step 6: Mark task complete, move to next topic**

### Final Review

After all topics are built, a final review subagent checks cross-file consistency:
- No overlapping content between files
- No gaps (topics in plan that weren't built)
- Registry is in sync with all written files
- No broken cross-references

## File Layout Changes

### Renamed
| From | To |
|---|---|
| `bin/skills/memory-seeding.md` | `bin/skills/memory-analyze.md` |
| `bin/skills/memory-seeding-knowledge/` | `bin/skills/memory-building-knowledge/` |

### New
| File | Purpose |
|---|---|
| `bin/skills/memory-building.md` | Execution skill — build memory files from approved plan |

### Deleted
| File | Reason |
|---|---|
| `bin/skills/memory-seeding.md` | Replaced by memory-analyze.md |

## Artifact Locations

| Artifact | Path | Written by |
|---|---|---|
| Analysis spec | `docs/memory-plan/YYYY-MM-DD-<project>-analysis.md` | memory-analyze |
| Building plan | `docs/memory-plan/YYYY-MM-DD-<project>-plan.md` | memory-analyze |
| Memory files | `memory/[store]/[path].md` | memory-building |
| Registry updates | `memory/[store]/_registry.yaml` | memory-building |

## Spec Format

```markdown
# Memory Analysis: [Project Name]

## Project Summary
[1-2 sentences about what the project is]

## Tech Stack
[Languages, frameworks, infrastructure identified]

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
- [details from Q&A]
**Boundary notes:** [overlap resolutions with other topics]
```

## Plan Format

```markdown
# Memory Building Plan: [Project Name]

> **For agentic workers:** Use memory-building skill to execute this plan.

**Goal:** [One sentence]
**Tech Stack:** [Key technologies — tells memory-building which knowledge files to load]
**Spec:** [Path to the analysis spec file]

---

### Task N: [Topic Name]

**File:** `memory/[store]/[path].md`
**Store:** [technical/domain/rules]
**Template:** [technical/domain/rules template]
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

## Design Decisions

| Decision | Choice | Reason |
|---|---|---|
| Keep both modes (source + document) | Yes | Both are valid entry points for different project states |
| Knowledge files owned by memory-building | Yes | memory-analyze is language-agnostic; building needs language guidance |
| Knowledge files are reference files, not sub-skills | Yes | building reads them with Read tool based on tech stack from plan |
| Handoff via skill invocation, plan via file | Plan file in docs/memory-plan/ | Persistent artifact for traceability and future improvement |
| SRP enforcement at two stages | Q&A + spec self-review | Belt and suspenders — challenge during Q&A, validate again at spec |
| Two-stage review per file | Spec compliance + quality | Memory files deserve same rigor as code |
| No file cap per run | Removed | Interactive Q&A and spec/plan approvals are sufficient quality gates |
| Rename in place | Yes | Clean break, no deprecated leftovers |
