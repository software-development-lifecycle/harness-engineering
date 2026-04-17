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
