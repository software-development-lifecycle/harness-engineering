# Getting Started Guide Design

## Summary

Add a tutorial-style onboarding guide (`guideline/getting-started.md`) that walks new users through adopting Harness Engineering. Two paths: setting up a new project from scratch, or joining an existing project. Complements the best-practices guide without duplicating it.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Scope | One guide (onboarding only) | Best-practices already covers registry management and maintenance in depth |
| Relationship to best-practices | Complementary, no overlap | Practical walkthrough; points back to best-practices for theory/rationale |
| Structure | Single file with branching paths | Two paths share enough context (intro, concepts) that splitting would cause duplication |
| Format | Tutorial-style numbered steps | Most effective for onboarding — users follow along, not browse topics |
| Language | English | User preference; code examples and YAML frontmatter already in English |
| Running example | E-commerce (C#/.NET) | Consistent with existing template examples |
| Length | ~150-200 lines | Enough for proper walkthrough with code blocks, not a second best-practices guide |

## File

**Location:** `guideline/getting-started.md`

## Content Structure

### Section 1: Introduction (~5 lines)

- One-sentence description of Harness Engineering: a methodology for managing AI memory across development sessions
- What this guide covers: two paths (new project setup vs. joining existing project)
- Prerequisite: read the README first
- Pointer: best-practices guide available at `guideline/memory-management-best-practices.md` for deeper theory

### Section 2: Core Concepts (~15 lines)

Quick-reference overview (not duplicating best-practices, just enough to follow the tutorial):

- **Three memory stores:**
  - `technical/` — how to build (languages, frameworks, patterns)
  - `domain/` — what to build (workflows, business rules, terminology)
  - `rules/` — constraints when building (coding standards, security, API conventions)
- **Registry:** each store has a `_registry.yaml` — an index of all memory files in that store. Read the registry to find what you need; never browse files directly.
- **Memory file:** a markdown file with YAML frontmatter (`id`, `store`, `title`, `description`, `last_updated`). See `guideline/templates/` for format reference.

### Section 3: Path 1 — Setting Up a New Project (~60 lines)

Tutorial steps using the e-commerce example:

**Step 1: Create directory structure**
```
memory/
├── technical/
├── domain/
└── rules/
```
Exact `mkdir -p` command.

**Step 2: Create HARNESS.yaml**
Full file content with project name, description, and 3 store definitions. Based on the existing `memory/HARNESS.yaml` as reference format.

**Step 3: Create registry files**
Create empty `_registry.yaml` in each store directory. Show the empty scaffold format (just a comment header).

**Step 4: Write your first memory file**
Pick one store (example: `technical/`). Copy the template from `guideline/templates/technical/template.md`. Fill it in with a concrete example — use the Redis caching example from `guideline/templates/technical/example.md` as reference. Show the completed file.

**Step 5: Register the memory file**
Add an entry to `technical/_registry.yaml` with `id`, `path`, `desc`. Show the exact YAML to add.

**Step 6: Verify**
- Check registry entry points to a file that exists
- Check file has correct YAML frontmatter with matching `id` and `store`
- Exact verification commands provided

### Section 4: Path 2 — Joining an Existing Project (~40 lines)

Tutorial steps:

**Step 1: Read HARNESS.yaml**
Find `memory/HARNESS.yaml` in the project root's `memory/` directory. Understand what stores exist and where they are.

**Step 2: Browse the registries**
Open each `_registry.yaml` to see what knowledge is already captured. Use `desc` fields to understand content without opening every file.

**Step 3: Read a memory file**
Pick one file from a registry. Open it. Note the structure: YAML frontmatter + markdown body. Compare with templates at `guideline/templates/` to understand the expected format.

**Step 4: Add a new memory file**
Identify knowledge that's missing. Pick the right store (technical/domain/rules). Copy the corresponding template. Fill it in with real project content.

**Step 5: Register it**
Add entry to the store's `_registry.yaml`. Follow the existing format — `id`, `path`, `desc`.

**Step 6: Verify**
Same verification as Path 1 Step 6.

### Section 5: Next Steps (~10 lines)

- **Deep dive:** read `guideline/memory-management-best-practices.md` for SOLID principles, detailed registry rules, and file writing guidelines
- **Templates:** use `guideline/templates/` when creating new memory files — each store has a scaffold template and a worked example
- **Maintenance:** review registries each sprint for sync issues; do a full store review quarterly (details in best-practices guide sections 7-9)

## Out of Scope

- Registry management guide (covered in best-practices sections 4, 6)
- Memory maintenance workflows guide (covered in best-practices section 9)
- Tooling/automation for project setup (separate bootstrapping tool concern)
- Updates to README.md or best-practices guide
- Vietnamese translation (can be done later if needed)
