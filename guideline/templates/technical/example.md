---
id: jwt-authentication
store: technical
title: JWT Authentication Middleware
description: "JWT token validation, middleware pipeline, claims extraction, role-based authorization"
last_updated: 2026-04-17
---

# JWT Authentication Middleware

The ASP.NET authentication middleware that validates Bearer JWT tokens on all API endpoints, as required by the platform's API design conventions.

## When to Use

- Securing any new public API endpoint (all endpoints require JWT by default)
- Extracting user identity and roles from the token claims
- Implementing role-based or policy-based authorization on specific endpoints
- Debugging 401/403 responses from the API

## How It Works

The platform uses **ASP.NET Core Authentication** with JWT Bearer scheme:

1. Client sends `Authorization: Bearer <token>` header
2. Middleware validates the token signature, expiry, issuer, and audience
3. Valid token → `HttpContext.User` is populated with claims from the token payload
4. Invalid/missing token → 401 Unauthorized response in standard error envelope
5. Authorization policies further check roles/permissions → 403 if insufficient

Token structure (JWT payload):
| Claim | Description | Example |
|---|---|---|
| `sub` | User's public UUID | `a1b2c3d4-e5f6-7890-abcd-ef1234567890` |
| `email` | User email | `customer@example.com` |
| `roles` | Assigned roles (array) | `["customer", "premium"]` |
| `exp` | Token expiry (Unix timestamp) | `1744900200` |
| `iss` | Token issuer | `https://auth.example.com` |
| `aud` | Intended audience | `https://api.example.com` |

Token lifecycle:
- Access tokens expire after **15 minutes**
- Refresh tokens expire after **7 days**
- Token refresh happens client-side before expiry — the API never issues tokens, only validates them

## Patterns

### Middleware registration

```csharp
// Program.cs — configure JWT authentication

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Auth:Issuer"];
        options.Audience = builder.Configuration["Auth:Audience"];
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30)
        };

        // Return standard error envelope on auth failure (matches API conventions)
        options.Events = new JwtBearerEvents
        {
            OnChallenge = context =>
            {
                context.HandleResponse();
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";
                return context.Response.WriteAsJsonAsync(new
                {
                    error = new { code = "UNAUTHORIZED", message = "Valid Bearer token required" }
                });
            }
        };
    });

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("AdminOnly", policy => policy.RequireRole("admin"))
    .AddPolicy("PremiumCustomer", policy => policy.RequireRole("premium", "admin"));
```

### Extracting user identity in controllers

```csharp
// GET /api/v1/orders — list orders for the authenticated user

[Authorize]
[HttpGet]
public async Task<IActionResult> ListOrders(
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 20,
    CancellationToken ct = default)
{
    pageSize = Math.Min(pageSize, 100); // Enforce max per API conventions

    // Extract user ID from JWT claims — always a public UUID, never internal DB ID
    var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    var result = await _orderService.ListByUserAsync(userId, page, pageSize, ct);

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

### Exempting specific endpoints

```csharp
// Health check — exempt from authentication per API conventions

[AllowAnonymous]
[HttpGet("/health")]
public IActionResult Health() => Ok(new { status = "healthy" });

// Webhook receiver — uses signature verification instead of JWT
[AllowAnonymous]
[HttpPost("/api/v1/webhooks/payment")]
public async Task<IActionResult> PaymentWebhook(
    [FromHeader(Name = "X-Webhook-Signature")] string signature,
    CancellationToken ct)
{
    var body = await new StreamReader(Request.Body).ReadToEndAsync(ct);

    if (!_webhookVerifier.VerifySignature(body, signature))
        return Unauthorized(new { error = new { code = "INVALID_SIGNATURE", message = "Webhook signature verification failed" } });

    await _paymentService.ProcessWebhookAsync(body, ct);
    return Ok();
}
```

## Trade-offs

| Strength | Limitation |
|---|---|
| Stateless — no server-side session storage needed | Token cannot be revoked before expiry (must wait or use a deny-list) |
| Claims embedded in token — no DB lookup per request | Token size grows with number of claims/roles |
| Standard middleware — minimal custom code | Clock skew between servers can cause false rejections |
| Works across multiple services without shared state | Refresh token rotation adds client-side complexity |

**When NOT to use JWT:**
- Internal service-to-service calls — use mTLS instead (simpler, mutual authentication)
- Long-lived sessions where instant revocation is critical — consider opaque tokens with server-side lookup
- Endpoints receiving callbacks from external systems — use HMAC signature verification

## Notes

- **Error envelope:** Auth failures must return the same `{ error: { code, message } }` envelope as all other API errors. The `OnChallenge` event handler ensures this — do not rely on the default middleware response which returns plain text.
- **Public UUIDs only:** The `sub` claim contains the user's public UUID. Never store or expose the internal database ID in the token. This aligns with the API convention of never exposing internal IDs.
- **X-Request-Id:** The authentication middleware runs before the request ID middleware. If auth fails, ensure the request ID header is still returned for traceability — place the request ID middleware before authentication in the pipeline.
- **Testing:** Use `WebApplicationFactory` with a mock JWT token for integration tests. The `Microsoft.AspNetCore.Authentication.JwtBearer` test utilities allow creating tokens with arbitrary claims without needing a real auth server.
