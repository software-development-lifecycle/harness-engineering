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
