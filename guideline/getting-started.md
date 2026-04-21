# Getting Started with Harness Engineering

Harness Engineering is a methodology for managing AI memory across development sessions. AI loses memory each session — this system provides structured external memory to reload the right context every time.

This guide walks you through adopting Harness Engineering in two scenarios:
- **[Path 1: Setting Up a New Project](#path-1-setting-up-a-new-project)** — create the memory structure from scratch
- **[Path 2: Joining an Existing Project](#path-2-joining-an-existing-project)** — understand and contribute to an existing memory system

**Prerequisite:** read the [README](../README.md) for a project overview. For deeper theory on memory principles, see [Memory Management Best Practices](memory-management-best-practices.md).

---

## Core Concepts

Harness Engineering organizes project knowledge into three **memory stores**:

| Store | Contains | Example |
|---|---|---|
| `technical/` | How to build — languages, frameworks, patterns | Redis caching patterns, async/await conventions |
| `domain/` | What to build — workflows, business rules, terminology | Order lifecycle, payment processing rules |
| `rules/` | Constraints when building — coding standards, security, API conventions | API design conventions, error handling standards |

Each store has a **registry** (`_registry.yaml`) — an index listing every memory file in that store. Always read the registry first to find what you need; never browse files directly.

A **memory file** is a markdown file with YAML frontmatter:

```yaml
---
id: unique-id
store: technical | domain | rules
title: Human-readable title
description: Brief description (matches registry desc)
last_updated: YYYY-MM-DD
---
```

See `guideline/templates/` for scaffold templates and worked examples for each store.

---

## Path 1: Setting Up a New Project

This walkthrough sets up Harness Engineering for an e-commerce platform.

### Step 1: Create the directory structure

```bash
mkdir -p memory/technical memory/domain memory/rules
```

This creates:

```
memory/
├── technical/
├── domain/
└── rules/
```

### Step 2: Create HARNESS.yaml

Create `memory/HARNESS.yaml` — the entry point that describes your memory system:

```yaml
# HARNESS.yaml

project: "E-Commerce Platform"
description: "Online retail platform with product catalog, orders, and payments"

memory_stores:
  technical:
    path: technical/
    registry: technical/_registry.yaml
    description: "Technical knowledge: languages, frameworks, patterns"

  domain:
    path: domain/
    registry: domain/_registry.yaml
    description: "Domain knowledge: workflows, business rules, terminology"

  rules:
    path: rules/
    registry: rules/_registry.yaml
    description: "Project constraints: coding standards, security, API conventions"
```

### Step 3: Create empty registry files

Each store needs a `_registry.yaml`. Start with empty scaffolds:

```bash
echo "# technical/_registry.yaml" > memory/technical/_registry.yaml
echo "# domain/_registry.yaml" > memory/domain/_registry.yaml
echo "# rules/_registry.yaml" > memory/rules/_registry.yaml
```

### Step 4: Write your first memory file

Pick a store and a topic. For this example, create a technical memory file about JWT authentication.

Copy the template from `guideline/templates/technical/template.md` and fill it in. Save it as `memory/technical/jwt-auth.md`:

```yaml
---
id: jwt-auth
store: technical
title: JWT Authentication
description: "JWT token structure, validation middleware, refresh token flow"
last_updated: 2026-04-21
---
```

Then write the markdown body following the template's section structure (`## When to Use`, `## How It Works`, `## Patterns`, `## Trade-offs`, `## Notes`). See `guideline/templates/technical/example.md` for a fully worked example of what a completed file looks like.

### Step 5: Register the memory file

Add an entry to `memory/technical/_registry.yaml`:

```yaml
# technical/_registry.yaml

auth:
  - id: jwt-auth
    path: auth/jwt-auth.md
    desc: "JWT token structure, validation middleware, refresh token flow"
```

Then move the file to match the registered path:

```bash
mkdir -p memory/technical/auth
mv memory/technical/jwt-auth.md memory/technical/auth/jwt-auth.md
```

> **Note:** The `path` in the registry is relative to the store directory (`memory/technical/`). Organize files into subdirectories by category as shown above.

### Step 6: Verify

Check that everything is consistent:

```bash
# Registry entry points to an existing file
cat memory/technical/_registry.yaml
ls memory/technical/auth/jwt-auth.md

# File frontmatter matches registry
head -7 memory/technical/auth/jwt-auth.md
```

Confirm:
- The `path` in the registry resolves to an existing file
- The file's `id` matches the registry entry's `id`
- The file's `store` field says `technical`

Your memory system is ready. Repeat steps 4-6 to add more memory files to any store.

---

## Path 2: Joining an Existing Project

You've joined a project that already uses Harness Engineering. Here's how to orient yourself and contribute.

### Step 1: Read HARNESS.yaml

Find and open `memory/HARNESS.yaml` in the project. This tells you:
- What the project is
- Which memory stores exist
- Where each store and its registry are located

```bash
cat memory/HARNESS.yaml
```

### Step 2: Browse the registries

Open each registry to see what knowledge is captured:

```bash
cat memory/technical/_registry.yaml
cat memory/domain/_registry.yaml
cat memory/rules/_registry.yaml
```

Read the `desc` field of each entry — it tells you what the file contains without opening it. This is how you find relevant knowledge quickly.

### Step 3: Read a memory file

Pick an entry from a registry and open the file. For example, if the technical registry lists:

```yaml
auth:
  - id: jwt-auth
    path: auth/jwt-auth.md
    desc: "JWT token structure, validation middleware, refresh token flow"
```

Open `memory/technical/auth/jwt-auth.md`. Note the structure:
- YAML frontmatter with `id`, `store`, `title`, `description`, `last_updated`
- Markdown body with topic-specific sections

Compare with the templates at `guideline/templates/` to understand the expected format for each store type.

### Step 4: Add a new memory file

Identify knowledge that's missing — something you learned that the next person will need too. Decide which store it belongs to:
- Learned a framework pattern? → `technical/`
- Documented a business workflow? → `domain/`
- Established a coding convention? → `rules/`

Copy the corresponding template from `guideline/templates/<store>/template.md` and fill it in with real project content.

### Step 5: Register it

Add an entry to the store's `_registry.yaml`:

```yaml
category:
  - id: your-unique-id
    path: category/your-file.md
    desc: "Brief description — enough to decide if this file is relevant without opening it"
```

### Step 6: Verify

Same checks as Path 1 Step 6:

```bash
# Confirm the file exists at the registered path (replace <store> with technical, domain, or rules)
ls memory/<store>/category/your-file.md

# Confirm frontmatter matches
head -7 memory/<store>/category/your-file.md
```

Confirm: registry `path` resolves, `id` matches, `store` field is correct.

---

## Next Steps

- **Deep dive:** read [Memory Management Best Practices](memory-management-best-practices.md) for SOLID principles, detailed registry rules, and file writing guidelines
- **Templates:** use `guideline/templates/` when creating new memory files — each store has a scaffold template and a worked example
- **Maintenance:** review registries each sprint for sync issues (orphan files, dead entries); do a full store review quarterly — details in the best-practices guide
