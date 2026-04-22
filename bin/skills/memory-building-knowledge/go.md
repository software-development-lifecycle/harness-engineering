# Go Knowledge

## Project Structure
- `go.mod` — module name, Go version, dependencies
- `go.sum` — dependency checksums
- `cmd/` — application entry points (`main.go` per binary)
- `internal/` — private application code (not importable by others)
- `pkg/` — public library code (importable)
- `api/` — API definitions (OpenAPI specs, protobuf files)
- `handlers/` or `controllers/` — HTTP handlers
- `services/` or `usecase/` — business logic
- `models/` or `domain/` — domain types and entities
- `repository/` or `store/` — data access layer
- `middleware/` — HTTP middleware
- `config/` — configuration loading
- `migrations/` — database migrations

## Architecture Indicators
| Pattern | How to detect |
|---|---|
| Standard HTTP | `net/http` usage, `http.HandleFunc` or `http.ServeMux` |
| Gin | `github.com/gin-gonic/gin` in go.mod, `gin.Default()` |
| Echo | `github.com/labstack/echo` in go.mod |
| Fiber | `github.com/gofiber/fiber` in go.mod |
| gRPC | `google.golang.org/grpc` in go.mod, `.proto` files |
| Clean Architecture | `cmd/`, `internal/domain/`, `internal/usecase/`, `internal/adapter/` |
| Hex Architecture | `ports/` and `adapters/` directories |

## Domain Signal Locations
- `internal/domain/` or `models/` — domain structs and types
- `internal/usecase/` or `services/` — business logic
- `internal/entity/` — core entities
- Interface definitions in domain packages — ports/contracts
- `*_enum.go` or constants files — domain states

## Convention Indicators
- `.golangci.yml` — linter configuration
- `Makefile` — build, test, lint commands
- Interface naming (prefixed with handler/service patterns)
- Error handling patterns (custom error types, wrapping)
- Project layout following golang-standards/project-layout

## What to Sample (priority order)
1. `go.mod` — module name, Go version, key dependencies
2. `cmd/*/main.go` — entry point, dependency wiring
3. One handler file — routing, request/response patterns, middleware
4. One service/usecase file — business logic, interfaces, error handling
5. One domain/model file — struct definitions, methods, relationships
