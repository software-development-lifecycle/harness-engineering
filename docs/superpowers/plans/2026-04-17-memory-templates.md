# Memory Templates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create template (scaffold) and example (worked) memory files for each of the 3 knowledge stores — technical, domain, rules — to bootstrap new Harness Engineering projects.

**Architecture:** 6 markdown files organized under `guideline/templates/{store}/`. Each store gets a `template.md` (agnostic scaffold with inline guidance comments) and an `example.md` (concrete C#/.NET e-commerce content). All files use a YAML frontmatter metadata header.

**Tech Stack:** Markdown with YAML frontmatter. Example code in C#/.NET.

**Spec:** `docs/superpowers/specs/2026-04-17-memory-templates-design.md`

---

### Task 1: Create directory structure

**Files:**
- Create: `guideline/templates/technical/` (directory)
- Create: `guideline/templates/domain/` (directory)
- Create: `guideline/templates/rules/` (directory)

- [ ] **Step 1: Create the 3 subdirectories**

```bash
mkdir -p guideline/templates/technical guideline/templates/domain guideline/templates/rules
```

- [ ] **Step 2: Verify structure**

```bash
find guideline/templates -type d | sort
```

Expected:
```
guideline/templates
guideline/templates/domain
guideline/templates/rules
guideline/templates/technical
```

---

### Task 2: Create technical template

**Files:**
- Create: `guideline/templates/technical/template.md`

- [ ] **Step 1: Write the technical template file**

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

- [ ] **Step 2: Verify the file exists and has correct frontmatter**

```bash
head -7 guideline/templates/technical/template.md
```

Expected: shows the YAML frontmatter block with `store: technical`.

- [ ] **Step 3: Commit**

```bash
git add guideline/templates/technical/template.md
git commit -m "feat: add technical memory template scaffold"
```

---

### Task 3: Create technical example

**Files:**
- Create: `guideline/templates/technical/example.md`

- [ ] **Step 1: Write the technical example file**

Content: a fully populated example about **Caching with Redis** for an e-commerce system using C#/.NET.

```markdown
---
id: redis-caching
store: technical
title: Caching with Redis
description: "Redis caching patterns, cache-aside strategy, key naming, TTL management"
last_updated: 2026-04-17
---

# Caching with Redis

Redis is the distributed caching layer for the e-commerce platform, used via StackExchange.Redis and ASP.NET's IDistributedCache abstraction.

## When to Use

- Product catalog data that changes infrequently but is read on every page load
- User session data across multiple application instances
- Shopping cart state that needs to survive app restarts
- Rate limiting counters for API endpoints

## How It Works

The platform uses a **cache-aside** (lazy-loading) pattern:

1. Application checks Redis for the requested key
2. **Cache hit** — return cached value directly
3. **Cache miss** — query the database, store the result in Redis with a TTL, return the value

Redis runs as a single cluster with read replicas. The application connects via `IDistributedCache`, which abstracts the underlying Redis client.

Key naming convention: `{service}:{entity}:{id}` — e.g., `catalog:product:12345`.

TTL strategy:
| Data type | TTL | Reason |
|---|---|---|
| Product details | 15 minutes | Changes rarely, high read volume |
| Inventory count | 30 seconds | Changes frequently, stale data = oversell risk |
| User session | 30 minutes (sliding) | Must survive short inactivity |
| Cart | 7 days | Users expect cart to persist |

## Patterns

### Cache-aside read

```csharp
public async Task<ProductDto?> GetProductAsync(int productId, CancellationToken ct)
{
    var cacheKey = $"catalog:product:{productId}";
    var cached = await _cache.GetStringAsync(cacheKey, ct);

    if (cached is not null)
        return JsonSerializer.Deserialize<ProductDto>(cached);

    var product = await _dbContext.Products
        .Where(p => p.Id == productId)
        .Select(p => new ProductDto(p.Id, p.Name, p.Price))
        .FirstOrDefaultAsync(ct);

    if (product is not null)
    {
        await _cache.SetStringAsync(
            cacheKey,
            JsonSerializer.Serialize(product),
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15) },
            ct);
    }

    return product;
}
```

### Cache invalidation on write

```csharp
public async Task UpdateProductPriceAsync(int productId, decimal newPrice, CancellationToken ct)
{
    var product = await _dbContext.Products.FindAsync(new object[] { productId }, ct);
    product!.Price = newPrice;
    await _dbContext.SaveChangesAsync(ct);

    // Invalidate cache — next read will repopulate
    await _cache.RemoveAsync($"catalog:product:{productId}", ct);
}
```

## Trade-offs

| Strength | Limitation |
|---|---|
| Sub-millisecond reads for cached data | Cache miss adds latency (Redis round-trip + DB query + cache write) |
| Reduces database load significantly | Memory cost — Redis cluster sizing must account for peak data |
| Horizontal read scaling via replicas | Cache invalidation complexity grows with data relationships |
| Simple cache-aside is easy to reason about | Eventual consistency — stale reads possible within TTL window |

**When NOT to use Redis caching:**
- Data that changes on every request (no caching benefit)
- Data that must be real-time consistent (use database directly)
- Large binary blobs (use object storage instead)

## Notes

- **Connection pooling:** StackExchange.Redis multiplexes connections. Create one `ConnectionMultiplexer` per application instance as a singleton — do not create per-request.
- **Serialization:** Use `System.Text.Json` for cache serialization. Avoid `Newtonsoft.Json` in hot paths — STJ is faster and allocates less.
- **Thundering herd:** When a popular cache key expires, many concurrent requests may hit the database simultaneously. Mitigate with a distributed lock or short "stale-while-revalidate" pattern for high-traffic keys.
- **Key expiration:** Always set a TTL. Keys without TTL accumulate and eventually exhaust Redis memory.
```

- [ ] **Step 2: Verify the file exists and frontmatter is populated**

```bash
head -8 guideline/templates/technical/example.md
```

Expected: shows populated YAML frontmatter with `id: redis-caching`, `store: technical`.

- [ ] **Step 3: Commit**

```bash
git add guideline/templates/technical/example.md
git commit -m "feat: add technical memory example (Redis caching for e-commerce)"
```

---

### Task 4: Create domain template

**Files:**
- Create: `guideline/templates/domain/template.md`

- [ ] **Step 1: Write the domain template file**

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

- [ ] **Step 2: Verify the file exists and has correct frontmatter**

```bash
head -7 guideline/templates/domain/template.md
```

Expected: shows the YAML frontmatter block with `store: domain`.

- [ ] **Step 3: Commit**

```bash
git add guideline/templates/domain/template.md
git commit -m "feat: add domain memory template scaffold"
```

---

### Task 5: Create domain example

**Files:**
- Create: `guideline/templates/domain/example.md`

- [ ] **Step 1: Write the domain example file**

Content: a fully populated example about **Order Lifecycle** for the e-commerce system.

```markdown
---
id: order-lifecycle
store: domain
title: Order Lifecycle
description: "Order states, transitions, cancellation and refund conditions, fulfillment flow"
last_updated: 2026-04-17
---

# Order Lifecycle

An order represents a customer's purchase request, tracked from creation through fulfillment to completion or cancellation.

## Definition

An **Order** is created when a customer confirms their shopping cart for checkout. It progresses through payment, fulfillment, and delivery stages. Each order contains one or more **line items**, each referencing a product SKU and quantity.

## Workflow / States

```
Created → Confirmed → Paid → Shipped → Delivered → Closed
                 ↘                ↘
              Cancelled         Returned
```

| From | To | Trigger | Condition |
|---|---|---|---|
| Created | Confirmed | Customer submits checkout | All items in stock, shipping address valid |
| Confirmed | Paid | Payment gateway callback | Payment authorized and captured |
| Confirmed | Cancelled | Customer cancels / payment timeout | Within 30 minutes of confirmation |
| Paid | Shipped | Warehouse marks dispatched | All items packed, tracking number assigned |
| Shipped | Delivered | Carrier delivery confirmation | Delivered to shipping address |
| Shipped | Returned | Customer initiates return | Within 30 days of shipment date |
| Delivered | Closed | Auto-close after 14 days | No dispute raised |
| Delivered | Returned | Customer initiates return | Within 30 days of delivery date |

## Business Rules

**Stock reservation:**
- Stock is reserved (soft lock) when order moves to Confirmed
- Reserved stock is released if order is Cancelled
- Stock is permanently deducted when order moves to Shipped

**Payment:**
- Payment must be captured within 30 minutes of Confirmed, otherwise auto-cancel
- Partial payments are not supported — full amount or rejection
- Refunds go back to the original payment method

**Shipping:**
- Orders over $50 qualify for free standard shipping
- Express shipping available for additional $9.99
- Orders cannot be modified once in Shipped state

**Returns and refunds:**
- Return window: 30 days from delivery date
- Refund is processed within 5 business days of receiving returned items
- Restocking fee of 15% applies for non-defective returns
- Defective items: full refund, no restocking fee, return shipping covered

**Cancellation:**
- Customer can cancel freely while in Confirmed state
- Once Paid, cancellation triggers a full refund (processed within 3 business days)
- Cannot cancel once Shipped — must use return process

## Glossary

- **Line item** — a single product entry within an order, consisting of SKU, quantity, and unit price
- **SKU** (Stock Keeping Unit) — unique identifier for a specific product variant (e.g., "Blue T-Shirt, Size M")
- **Fulfillment** — the process of picking, packing, and shipping an order from the warehouse
- **Backorder** — an order accepted for an out-of-stock item, to be fulfilled when stock arrives
- **Chargeback** — a payment reversal initiated by the customer's bank (not the merchant)
- **Soft lock** — temporary stock reservation that expires if not confirmed within a time window
```

- [ ] **Step 2: Verify the file exists and frontmatter is populated**

```bash
head -8 guideline/templates/domain/example.md
```

Expected: shows populated YAML frontmatter with `id: order-lifecycle`, `store: domain`.

- [ ] **Step 3: Commit**

```bash
git add guideline/templates/domain/example.md
git commit -m "feat: add domain memory example (order lifecycle for e-commerce)"
```

---

### Task 6: Create rules template

**Files:**
- Create: `guideline/templates/rules/template.md`

- [ ] **Step 1: Write the rules template file**

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

- [ ] **Step 2: Verify the file exists and has correct frontmatter**

```bash
head -7 guideline/templates/rules/template.md
```

Expected: shows the YAML frontmatter block with `store: rules`.

- [ ] **Step 3: Commit**

```bash
git add guideline/templates/rules/template.md
git commit -m "feat: add rules memory template scaffold"
```

---

### Task 7: Create rules example

**Files:**
- Create: `guideline/templates/rules/example.md`

- [ ] **Step 1: Write the rules example file**

Content: a fully populated example about **API Design Conventions** for the e-commerce system using C#/ASP.NET.

```markdown
---
id: api-design
store: rules
title: API Design Conventions
description: "RESTful naming, response format, versioning, pagination, authentication requirements"
last_updated: 2026-04-17
---

# API Design Conventions

Constraints for all public and internal HTTP APIs in the e-commerce platform.

## MUST

- Use RESTful resource naming: plural nouns, no verbs in paths (`/orders`, not `/getOrders`)
- Version all public APIs via URL prefix: `/api/v1/`, `/api/v2/`
- Return a consistent response envelope for all endpoints (see Examples)
- Use HTTP status codes correctly: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 422 Unprocessable Entity, 500 Internal Server Error
- Require authentication (Bearer JWT) on all endpoints except those explicitly listed in Exceptions
- Use `camelCase` for all JSON property names
- Support pagination on all list endpoints using `page` and `pageSize` query parameters
- Return `X-Request-Id` header on every response for traceability
- Log every request with: method, path, status code, duration, request ID

## MUST NOT

- Expose internal database IDs in API responses — use public UUIDs instead
- Return stack traces or internal exception details in non-development environments
- Use query parameters for sensitive data (tokens, passwords) — use headers or request body
- Return unbounded lists — all list endpoints must enforce a maximum `pageSize` of 100
- Use `PUT` for partial updates — use `PATCH` with only the fields being changed
- Accept `*/*` content type — explicitly require and validate `application/json`

## Examples

### DO

Correct endpoint naming and response envelope:

```csharp
// GET /api/v1/orders/{id}

[HttpGet("{id:guid}")]
public async Task<IActionResult> GetOrder(Guid id, CancellationToken ct)
{
    var order = await _orderService.GetByPublicIdAsync(id, ct);
    if (order is null)
        return NotFound(new { error = new { code = "ORDER_NOT_FOUND", message = "Order does not exist" } });

    return Ok(new { data = order });
}
```

Response (200 OK):
```json
{
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "status": "paid",
    "totalAmount": 129.99,
    "currency": "USD",
    "lineItems": [
      {
        "sku": "TSHIRT-BLUE-M",
        "quantity": 2,
        "unitPrice": 29.99
      }
    ],
    "createdAt": "2026-04-17T10:30:00Z"
  }
}
```

Error response (404):
```json
{
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "Order does not exist"
  }
}
```

Paginated list response:
```csharp
// GET /api/v1/orders?page=1&pageSize=20

[HttpGet]
public async Task<IActionResult> ListOrders(
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 20,
    CancellationToken ct = default)
{
    pageSize = Math.Min(pageSize, 100); // Enforce max

    var result = await _orderService.ListAsync(page, pageSize, ct);

    return Ok(new
    {
        data = result.Items,
        pagination = new
        {
            page = result.Page,
            pageSize = result.PageSize,
            totalItems = result.TotalItems,
            totalPages = result.TotalPages
        }
    });
}
```

### DON'T

Exposing internal IDs and inconsistent response format:

```csharp
// BAD: verb in URL, internal ID exposed, no envelope

[HttpGet("/api/getOrder")]
public async Task<IActionResult> GetOrder([FromQuery] int id) // internal int ID
{
    var order = await _dbContext.Orders.FindAsync(id);
    return Ok(order); // raw entity, no envelope, may contain internal fields
}
```

Returning stack traces in production:

```csharp
// BAD: leaking internals

[HttpGet("{id}")]
public async Task<IActionResult> GetOrder(Guid id)
{
    try { ... }
    catch (Exception ex)
    {
        return StatusCode(500, new { error = ex.ToString() }); // stack trace exposed
    }
}
```

## Exceptions

- `GET /health` and `GET /ready` — exempt from authentication (used by load balancer probes)
- Internal service-to-service endpoints under `/internal/` — use mTLS instead of JWT authentication
- Webhook receiver endpoints — use signature verification instead of JWT
```

- [ ] **Step 2: Verify the file exists and frontmatter is populated**

```bash
head -8 guideline/templates/rules/example.md
```

Expected: shows populated YAML frontmatter with `id: api-design`, `store: rules`.

- [ ] **Step 3: Commit**

```bash
git add guideline/templates/rules/example.md
git commit -m "feat: add rules memory example (API design conventions for e-commerce)"
```

---

### Task 8: Final verification

- [ ] **Step 1: Verify complete file structure**

```bash
find guideline/templates -type f | sort
```

Expected:
```
guideline/templates/domain/example.md
guideline/templates/domain/template.md
guideline/templates/rules/example.md
guideline/templates/rules/template.md
guideline/templates/technical/example.md
guideline/templates/technical/template.md
```

- [ ] **Step 2: Verify all files have correct frontmatter store values**

```bash
grep "^store:" guideline/templates/*/template.md guideline/templates/*/example.md
```

Expected:
```
guideline/templates/domain/template.md:store: domain
guideline/templates/domain/example.md:store: domain
guideline/templates/rules/template.md:store: rules
guideline/templates/rules/example.md:store: rules
guideline/templates/technical/template.md:store: technical
guideline/templates/technical/example.md:store: technical
```

- [ ] **Step 3: Verify all commits**

```bash
git log --oneline -7
```

Expected: 6 new commits (one per file) on top of existing history.
