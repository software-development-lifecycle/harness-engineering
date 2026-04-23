---
name: memory:building
description: Execute an approved memory plan — build memory files with two-stage review (spec compliance + quality) per file, using subagent dispatch
---

# memory:building

Execute an approved memory building plan by dispatching subagents to create each memory file. Each file goes through two-stage review: spec compliance (does it match the plan?) and quality (is it AI-readable, specific, SRP-compliant?).

This skill follows the subagent-driven-development pattern adapted for memory file creation.

## Input

Read the approved plan from `docs/memory-plan/YYYY-MM-DD-<project>-plan.md`.

Extract:
- All tasks with full text (topic, file path, store, template, content outline, scope boundaries, registry entry)
- Tech stack (determines which knowledge files to load)
- Spec path (for review reference)

## Knowledge Files

Located at `memory-building-knowledge/` (relative to this skill's directory).

To find the matching knowledge file:
1. Read the **Tech Stack** field from the plan
2. List files in `memory-building-knowledge/` directory
3. Match tech stack keywords to file names by convention (e.g. "Kotlin" → `kotlin.md`, "Java" → `java.md`, "Node.js" → `nodejs.md`, "C#" → `csharp.md`)
4. If a matching file exists, read it and use as guidance when writing memory files for that tech stack
5. If no matching file exists, proceed with general analysis using the plan's content outline and the template formats from the plan

## Per-Topic Execution Cycle

For each task in the plan:

### Step 1: Prepare context

- Read the task from the plan (topic scope, boundaries, content outline)
- Load the knowledge file identified in the Knowledge Files section (if one was matched)
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
