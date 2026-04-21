# Memory Management Best Practices

## 1. Core Philosophy

An AI Model is like an exceptionally skilled developer who loses all memory between sessions. Each time it is invoked, that brain starts from a blank slate. Memory is an external storage system — organized and maintained by humans — that reloads the right "memories" for each working session.

A skilled developer needs: technical knowledge, domain knowledge, project rules (constraints), and an understanding of the current task (context). The memory architecture maps directly to these four types of understanding.

---

## 2. SOLID Principles Applied to Memory

### 2.1. S — Single Responsibility

> Each memory unit covers only one topic and has only one reason to change.

**Applied at two levels:**

Store level: each memory store contains only one type of understanding. The technical store changes when the tech stack changes. The domain store changes when the business domain changes. The rules store changes when constraints change. The three stores are independent and must not be mixed.

File level: each file covers only one specific topic. A file about async/await must not be mixed with EF Core. A file about payment workflow must not be mixed with order lifecycle.

**Check:** if you need to describe a file's contents using "A and B," it should be split into two files.

**Wrong:**
```
csharp-everything.md          → Contains async, LINQ, generics, DI — too many topics
payment-and-order.md          → 2 different domains in 1 file
coding-and-security-rules.md  → 2 different types of constraints
```

**Correct:**
```
csharp-async.md               → async/await only
csharp-linq.md                → LINQ only
payment-workflow.md           → payment only
coding-standards.md           → coding conventions only
security.md                   → security rules only
```

### 2.2. O — Open/Closed

> Memory is open for extension, closed for structural modification.

Adding new knowledge = create a new file + add an entry to the registry. No other files are modified; the store structure remains untouched.

**Example:** the team starts using gRPC in a project.

Add new:
```
1. Create file: technical/framework/grpc-patterns.md
2. Add entry to technical/_registry.yaml
3. Done.
```

No need to modify: any other technical files, the domain registry, the rules registry, or anything else that already exists.

**Check:** when adding one new unit of knowledge, if you find yourself modifying any file other than the registry — you are violating O.

### 2.3. I — Interface Segregation

> Do not force anyone to receive memory they do not need.

When retrieving memory, load only the files necessary for the current task. Never dump the entire store.

How it works: the registry acts as an index — read the registry first to identify which files are needed, then load only those files. Never load the entire store.

**Wrong:** load all 15 technical files into context even though only 3 are relevant.

**Correct:** read registry → identify the 3 necessary files → load only those 3 files.

### 2.4. D — Dependency Inversion

> Depend on the type of memory, not on a specific file.

Anything that needs to retrieve memory works through the registry — it never points directly to a hardcoded file path. If a file is moved, renamed, or split → only the registry needs to be updated; nothing else changes.

The registry is the only intermediary layer between "the consumer of memory" and "the file containing memory."

---

## 3. Memory Structure

### 3.1. Three memory stores

```
memory/
├── technical/            # Technical knowledge
│   ├── _registry.yaml
│   └── [files...]
│
├── domain/               # Domain knowledge
│   ├── _registry.yaml
│   └── [files...]
│
├── rules/                # Project constraints
│   ├── _registry.yaml
│   └── [files...]
│
└── HARNESS.yaml          # Root file describing the overall system
```

Each store is completely independent. Adding, modifying, or removing items in one store does not affect any other store.

**Context** (the fourth type of memory) is not stored in the system — it is provided by humans each time a skill is invoked, describing the work to be done at that moment.

### 3.2. Distinguishing the three stores

| | Technical | Domain | Rules |
|---|---|---|---|
| **Contains** | How to do it (how) | What it is about (what) | Constraints on doing it (constraint) |
| **Examples** | Async patterns, EF Core, Redis caching | Payment workflow, order lifecycle, business terminology | Coding standards, security requirements, API conventions |
| **Changes when** | Tech stack changes | Business domain changes | Project constraints change |
| **Written by** | Tech lead, senior dev | BA, domain expert, tech lead | Tech lead, client |
| **Change frequency** | Low | Medium | Low |

### 3.3. Subdirectories within a store

The directory structure inside each store is **flexible** — the team organizes it in whatever way makes the most sense for the project. The methodology does not mandate a number of nesting levels or a naming scheme.

The reason: the registry is the sole access point. Directories only serve humans who manage the files. As long as paths in the registry point to the correct files, the structure is sufficient.

General recommendations:
- Group related files into the same directory for ease of human navigation
- Use clear, descriptive names for directories and files; use kebab-case
- Avoid deep nesting (3–4 levels is enough for most projects)

---

## 4. Registry — Mandatory Rules

### 4.1. Each store has exactly one registry file

```
technical/_registry.yaml
domain/_registry.yaml
rules/_registry.yaml
```

The registry is the **table of contents** for the store — reading the registry tells you what the store contains, where it lives, and what each file is about.

### 4.2. Standard format

```yaml
# [store]/_registry.yaml

[category]:
  - id: [unique-id]
    path: [relative-path-to-file]
    desc: "[short description of the file's content]"
```

Each entry has exactly 3 fields:
- **id** — a unique identifier within the store, used for cross-referencing
- **path** — the relative path to the file, measured from the store directory
- **desc** — a concise description of the file's content, sufficient to decide whether the file needs to be loaded without opening it

Do not add any other fields. All detailed information belongs inside the memory file, not in the registry.

### 4.3. Complete example

```yaml
# technical/_registry.yaml

language:
  - id: csharp-async
    path: language/csharp-async.md
    desc: "Async/await patterns, Task, ValueTask, CancellationToken"

  - id: csharp-linq
    path: language/csharp-linq.md
    desc: "LINQ best practices, deferred execution, performance"

  - id: csharp-generics
    path: language/csharp-generics.md
    desc: "Generic types, constraints, covariance/contravariance"

framework:
  - id: efcore-patterns
    path: framework/efcore-patterns.md
    desc: "EF Core usage, lazy vs eager loading, change tracking"

  - id: aspnet-middleware
    path: framework/aspnet-middleware.md
    desc: "ASP.NET middleware pipeline, filters, error handling"

database:
  - id: postgresql-indexing
    path: database/postgresql-indexing.md
    desc: "Index types, query optimization, EXPLAIN analysis"

patterns:
  - id: repository-pattern
    path: patterns/repository-pattern.md
    desc: "Repository pattern implementation with EF Core"

  - id: cqrs
    path: patterns/cqrs.md
    desc: "CQRS, command/query separation, MediatR usage"
```

```yaml
# domain/_registry.yaml

payment:
  - id: payment-workflow
    path: payment/payment-workflow.md
    desc: "Payment process, states, processing flow"

  - id: settlement-rules
    path: payment/settlement-rules.md
    desc: "T+1 reconciliation rules, commission calculation"

  - id: refund-process
    path: payment/refund-process.md
    desc: "Refund process, distinguishing refund vs chargeback"

order:
  - id: order-lifecycle
    path: order/order-lifecycle.md
    desc: "Order lifecycle, state transitions"

  - id: order-statuses
    path: order/order-statuses.md
    desc: "List of statuses, transition conditions"

general:
  - id: glossary
    path: glossary.md
    desc: "Project-wide business terminology glossary"
```

```yaml
# rules/_registry.yaml

coding:
  - id: coding-standards
    path: coding/coding-standards.md
    desc: "Naming conventions, formatting, comment rules"

  - id: error-handling
    path: coding/error-handling.md
    desc: "Exception hierarchy, logging standards, error codes"

security:
  - id: security
    path: security/security.md
    desc: "Input validation, authentication, data protection"

api:
  - id: api-design
    path: api/api-design.md
    desc: "RESTful conventions, response format, versioning, pagination"

testing:
  - id: testing-standards
    path: testing/testing-standards.md
    desc: "Unit test conventions, naming, coverage requirements"
```

### 4.4. Registry management principles

**IDs must be unique within a store.** No two entries in the same registry may share an id. IDs may coincide across stores (technical may have `security`, rules may also have `security` — different stores, no conflict).

**Every file in the store must have an entry in the registry.** If a file exists but has no registry entry, it is treated as non-existent — it will never be retrieved.

**The registry must always be in sync with reality.** Add a file → add an entry. Delete a file → delete the entry. Move a file → update the path. This is the most important discipline rule.

**desc must be good enough to make a decision without opening the file.** If reading the desc still leaves you unsure whether the file contains what you need → the desc is not written clearly enough.

---

## 5. Memory Files — Writing Rules

### 5.1. Write for AI to read, not for humans to read

Memory files are loaded into the context window of an AI model. Writing must be optimized for the AI to understand and follow.

**Be specific, not vague:**
```
Wrong:  "Follow team conventions when naming things"
Correct: "Class names: PascalCase. Method names: camelCase. Constants: UPPER_SNAKE_CASE"
```

**Use strong, unambiguous language:**
```
Wrong:  "You can use async when needed"
Correct: "MUST use async for all I/O operations. MUST NOT use .Result or .Wait()"
```

**Provide DO/DON'T examples:**

AI learns better from examples than from descriptions. Each important rule should have at least one correct example and one wrong example.

```markdown
## Repository Pattern

MUST use the repository interface for data access.

✅ Correct:
```csharp
public class OrderService
{
    private readonly IOrderRepository _repo;
    public OrderService(IOrderRepository repo) => _repo = repo;
}
```

❌ Wrong:
```csharp
public class OrderService
{
    private readonly AppDbContext _context;  // Direct DB access, bypassing repository
}
```
```

### 5.2. One file, one topic

Each file focuses on a single topic (the S principle). If a file starts covering multiple unrelated topics → split it.

Signs that a file should be split:
- The file has more than 2 level-2 headings (##) and those headings are not closely related
- You need to describe it as "this file is about A **and** B"
- Two sections in the file change for different reasons, at different times

### 5.3. Concise and on point

Every token in the context window has a cost. Write as briefly as possible without losing information.

- Do not write long histories, background, or explanations of why a particular approach was chosen
- Do not repeat information already present in another file
- Use tables instead of paragraphs for lists
- Keep code examples short — just enough to illustrate the point; do not write full classes

**Wrong:**
```markdown
## Introduction to Async/Await

C# introduced async/await in version 5.0 in 2012. This is an important feature 
that helps developers write asynchronous code more easily. Before async/await, 
developers had to use callbacks or Task.ContinueWith, which was very hard to read 
and maintain. Async/await solves this by...
```

**Correct:**
```markdown
## Async/Await

MUST use `async Task` for I/O operations.
MUST pass `CancellationToken` to all async methods.
MUST NOT use `async void` (except event handlers).
MUST NOT call `.Result` or `.Wait()` (deadlock risk).
```

### 5.4. Recommended structure for each memory type

**Technical memory:**
```markdown
# [Topic name]

## When to use
[Brief description of applicable situations]

## Rules
[List of MUST/MUST NOT]

## Patterns
[DO/DON'T code examples]

## Notes
[Edge cases, pitfalls]
```

**Domain memory:**
```markdown
# [Concept/workflow name]

## Definition
[What this concept is, in 1–2 sentences]

## Process / States
[Flow description or state machine]

## Business rules
[Business rules]

## Related terminology
[Terms to know, link to glossary if needed]
```

**Rules memory:**
```markdown
# [Constraint name]

## MUST
[List of mandatory requirements]

## MUST NOT
[List of prohibitions]

## Examples
[DO/DON'T with code or specific descriptions]

## Exceptions
[Cases where non-compliance is permitted, if any]
```

This is a recommended structure, not a requirement. Adjust it to suit the content — what matters is that it is clear, specific, and written for AI to read.

---

## 6. Adding New Memory

### Process:

```
Step 1: Determine which store the memory belongs to (technical / domain / rules)
Step 2: Write the markdown file following the rules in section 5
Step 3: Place the file in the appropriate subdirectory within the store
Step 4: Add an entry to the store's _registry.yaml
```

### Principles:

- Only create a new file and add an entry to the registry — do not modify any other file (O)
- Verify that the id does not conflict with any existing entry in the same registry
- Write a desc that is clear enough for others to understand what the file contains without opening it

### Example:

The team starts using SignalR for real-time features.

```
1. Create file: technical/framework/signalr-patterns.md
2. Add to technical/_registry.yaml:

   framework:
     ...existing entries...
     - id: signalr-patterns
       path: framework/signalr-patterns.md
       desc: "SignalR hub patterns, group management, connection lifecycle"

3. Done. No further modifications needed.
```

---

## 7. Updating Memory

### When to update:

- Technology changes (framework version upgrade, pattern change)
- Business domain changes (client changes a business rule)
- Constraints change (client adds a security requirement)

### Process:

```
Step 1: Edit the markdown file content
Step 2: If the scope changes significantly → update the desc in the registry
Step 3: If the file is being split → create new files, update the registry, delete the old file
```

### Principles:

- Updating file content: free to do, no other changes required
- Updating the desc in the registry: only when the content changes significantly enough that the old desc is no longer accurate
- If an update causes the file to grow large or cover additional topics → split the file (S)

---

## 8. Deleting Memory

### When to delete:

- A technology is no longer in use (dropped Redis, switched to Memcached)
- A business feature no longer exists (feature removed)
- Content has been merged into another file

### Process:

```
Step 1: Remove the entry from _registry.yaml
Step 2: Delete the markdown file
```

### Principles:

- Remove the registry entry first, then delete the file — avoid leaving the registry pointing to a non-existent file
- Check that no other file references the id being deleted (if cross-references exist)
- Deletion in one store does not affect other stores

---

## 9. Memory Maintenance

### 9.1. Periodic checks

**Every sprint (2–4 weeks):**
- Are there any files in the store that have no registry entry? (orphaned files)
- Are there any registry entries pointing to files that do not exist? (dead entries)
- Is there any file whose content has become outdated?

**Every quarter:**
- Review the entire technical store — is it still accurate for the current tech stack?
- Review the entire rules store — is it still accurate for the current constraints?
- Are there any files that have grown too large and need to be split? (check S)

### 9.2. Responsibilities

| Store | Primary responsible party |
|---|---|
| Technical | Tech lead / Senior developer |
| Domain | Business analyst / Tech lead |
| Rules | Tech lead / Project manager |
| Registry sync | Tech lead (ensures the registry stays in sync) |

### 9.3. Signs that memory has problems

- AI output does not comply with rules → check whether the rules store is complete and clear
- AI output is incorrect on domain matters → check whether the domain store is accurate
- AI output uses wrong patterns or APIs → check whether the technical store is up to date
- AI output is correct but inconsistent across invocations → check for conflicting files

---

## 10. Context — Ephemeral Memory

Context is the fourth type of memory, but it is not stored in the system. It is provided by humans each time a skill is invoked.

### What context contains:

- A description of the work to be done
- Acceptance criteria / expected output
- Additional information specific to the current task

### What context does not contain:

- General technical knowledge (belongs in the technical store)
- General domain knowledge (belongs in the domain store)
- Rules and conventions (belongs in the rules store)

### Clear boundary:

If information will be **reused** across many tasks → it belongs in one of the three stores, not in context.

If information is **only valid for this specific task** → it is context.

---

## 11. HARNESS.yaml — The Root File

The entry point file that describes the overall memory system of the project:

```yaml
# HARNESS.yaml

project: "Project name"
description: "Short description of the project"

memory_stores:
  technical:
    path: technical/
    registry: technical/_registry.yaml
    description: "Technical knowledge: language, framework, patterns"

  domain:
    path: domain/
    registry: domain/_registry.yaml
    description: "Domain knowledge: workflow, business rules, terminology"

  rules:
    path: rules/
    registry: rules/_registry.yaml
    description: "Project constraints: coding standards, security, API conventions"
```

Anyone new to the project can read this file to understand how the memory system is organized.

---

## Summary

| Principle | Application |
|---|---|
| **S — Single Responsibility** | 1 store = 1 type of memory. 1 file = 1 topic. |
| **O — Open/Closed** | Add new = add file + add entry. Do not modify anything else. |
| **I — Interface Segregation** | Load only the necessary files; never dump the entire store. |
| **D — Dependency Inversion** | Retrieve via registry; never point directly to a file path. |
| **Registry** | The sole table of contents. Entry = id + path + desc. Always in sync with reality. |
| **Files** | Write for AI to read. Specific, with DO/DON'T examples, concise. |
| **Context** | Not stored. Provided by humans each time a skill is invoked. |
| **Maintenance** | Registry sync every sprint. Full review every quarter. |
