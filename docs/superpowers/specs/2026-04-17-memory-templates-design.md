# Memory Templates Design

## Summary

Design memory template and example files for each of the 3 knowledge stores (technical, domain, rules). These files serve as bootstrapping tools for new projects — used by both AI and humans to understand how to build well-formed memory files.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Purpose | Template (scaffold) + Example (worked) per store | Users need both structure guidance and concrete reference |
| Language | English | Broader accessibility |
| Tech agnosticism | Templates: agnostic. Examples: C#/.NET + e-commerce | Templates are reusable; examples must be realistic |
| Location | `guideline/templates/{store}/` | Separated from actual memory data |
| Template style | Enhanced practical (Approach B) | Self-contained — inline guidance comments so users don't need to reference the 595-line best-practices guide |
| Registry templates | Not included | Already well-documented in best-practices guide |

## File Structure

```
guideline/templates/
├── technical/
│   ├── template.md
│   └── example.md
├── domain/
│   ├── template.md
│   └── example.md
└── rules/
    ├── template.md
    └── example.md
```

6 files total. Each store gets 1 template + 1 example.

## Metadata Header

Every memory file starts with a YAML frontmatter block:

```yaml
---
id: unique-id-within-store
store: technical | domain | rules
title: Human-readable title
description: Brief description matching registry desc
last_updated: YYYY-MM-DD
---
```

Fields:
- **id** — matches the registry entry id (single source of truth for linking)
- **store** — which store this file belongs to
- **title** — human-readable name
- **description** — same as the `desc` field in the registry (kept in sync)
- **last_updated** — date of last meaningful content change (supports maintenance reviews)

Templates have these as placeholders. Examples have them filled in.

## Technical Template Structure

```markdown
---
id: <unique-id>
store: technical
title: <Title>
description: <Brief description for registry>
last_updated: YYYY-MM-DD
---

# <Topic Name>

<!-- One-line summary: what technology/pattern/tool this covers -->

## When to Use

<!-- Describe the situations where this knowledge applies.
     Be specific — e.g., "When implementing async data access layer"
     not "When writing code" -->

## How It Works

<!-- Explain the core concept, mechanism, or architecture.
     Focus on understanding — what it does, how it behaves,
     key characteristics. Keep it concise. -->

## Patterns

<!-- Show common usage patterns with code examples.
     Focus on illustrating HOW to use it, not enforcing rules.
     Use fenced code blocks with language tag. -->

## Trade-offs

<!-- When to choose this over alternatives.
     Strengths, limitations, performance characteristics.
     Help the reader make informed decisions. -->

## Notes

<!-- Edge cases, common pitfalls, gotchas.
     Only include what's not obvious from above.
     Remove this section if nothing to add. -->
```

## Domain Template Structure

```markdown
---
id: <unique-id>
store: domain
title: <Title>
description: <Brief description for registry>
last_updated: YYYY-MM-DD
---

# <Concept / Workflow Name>

<!-- One-line summary: what business concept or workflow this covers -->

## Definition

<!-- What this concept is, in 1-2 sentences.
     Write for someone with no prior domain knowledge. -->

## Workflow / States

<!-- Describe the business flow or state machine.
     Use a list, table, or diagram to show transitions.
     Example: Order → Paid → Shipped → Delivered → Closed -->

## Business Rules

<!-- Domain-specific logic and conditions.
     These are business truths, not coding constraints.
     Example: "Refund is only allowed within 30 days of purchase" -->

## Glossary

<!-- Key terms related to this concept.
     Format: **Term** — definition
     Remove this section if terms are already in a shared glossary. -->
```

## Rules Template Structure

```markdown
---
id: <unique-id>
store: rules
title: <Title>
description: <Brief description for registry>
last_updated: YYYY-MM-DD
---

# <Constraint Name>

<!-- One-line summary: what aspect of the project this constrains -->

## MUST

<!-- List mandatory requirements.
     Each rule should be concrete, verifiable, and unambiguous.
     Example: "All public API endpoints MUST require authentication" -->

## MUST NOT

<!-- List prohibited practices.
     Explain the risk briefly if not obvious.
     Example: "MUST NOT store plaintext passwords — use bcrypt with cost >= 12" -->

## Examples

### DO

<!-- Correct usage with brief explanation.
     Use fenced code blocks with language tag. -->

### DON'T

<!-- Incorrect usage with brief explanation of why it's wrong.
     Use fenced code blocks with language tag. -->

## Exceptions

<!-- Cases where the above rules may be relaxed.
     State the condition clearly.
     Remove this section if no exceptions exist. -->
```

## Example Content (E-commerce + C#/.NET)

### technical/example.md — Caching with Redis

- Specific to Redis (not generic "caching")
- Code examples in C# using StackExchange.Redis / IDistributedCache
- Real Redis patterns: cache-aside read/write, key naming, TTL strategies
- Trade-offs: speed vs consistency, memory cost, cache invalidation complexity
- Notes: connection pooling, serialization pitfalls

### domain/example.md — Order Lifecycle

- Definition: an order represents a customer's purchase from creation to completion
- Workflow: Created → Confirmed → Paid → Shipped → Delivered → Closed (with Cancelled as side state)
- Business rules with concrete conditions (e.g., "refund within 30 days", "free shipping over $50", "cancelled orders release reserved inventory")
- Glossary: SKU, fulfillment, backorder, line item, etc.

### rules/example.md — API Design Conventions

- MUST: RESTful resource naming, consistent response envelope, version via URL prefix, authentication on all endpoints
- MUST NOT: expose internal IDs, return stack traces in production, use verbs in URL paths
- DO/DON'T: real C#/ASP.NET controller examples, real JSON response structures (e.g., `GET /api/v1/orders/{id}`)
- Exceptions: health check endpoints exempt from authentication

## Out of Scope

- Registry template files (already documented in best-practices guide)
- Automation/tooling for generating templates
- Updates to README.md or best-practices guide (can be done later)
