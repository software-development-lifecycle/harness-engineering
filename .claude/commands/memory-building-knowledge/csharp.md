# C# / .NET Knowledge

## Project Structure
- `*.sln` — Visual Studio solution file (lists all projects)
- `*.csproj` — project file (target framework, NuGet packages, build config)
- `Program.cs` — application entry point and host configuration
- `Startup.cs` — service registration and middleware pipeline (older .NET)
- `Controllers/` — API endpoints (ASP.NET MVC/Web API)
- `Services/` — business logic layer
- `Models/` or `Entities/` — data models and domain entities
- `Data/` or `Infrastructure/` — data access layer (EF Core DbContext, repositories)
- `Migrations/` — EF Core database migration history
- `DTOs/` or `ViewModels/` — data transfer objects
- `Middleware/` — custom middleware components
- `Filters/` — action/exception filters
- `Extensions/` — extension method classes

## Architecture Indicators
| Pattern | How to detect |
|---|---|
| Layered (Controllers → Services → Repositories) | Separate folders for each layer, DI registration in Program.cs |
| Vertical slice | `Features/` or `Modules/` folders with self-contained slices |
| CQRS | MediatR usage, separate Command/Query classes |
| Minimal API | `app.MapGet/MapPost` in Program.cs, no Controllers folder |
| Clean Architecture | Core/Application/Infrastructure/Presentation projects in solution |

## Domain Signal Locations
- `Models/` or `Entities/` — domain entities, relationships, value objects
- `Services/` — business rules and workflow logic
- `Enums/` — domain states, categories, types
- `Validators/` — business validation rules (FluentValidation)
- `Events/` — domain events
- `Specifications/` — query specifications

## Convention Indicators
- `.editorconfig` — formatting and code style rules
- `Directory.Build.props` — shared build properties across projects
- `GlobalUsings.cs` — implicit namespace imports
- `stylecop.json` or `.ruleset` — static analysis rules
- Nullable reference types enabled in csproj

## What to Sample (priority order)
1. `*.csproj` — dependencies, framework version, key NuGet packages
2. `Program.cs` — middleware pipeline, DI registrations, app configuration
3. One controller — API patterns, routing, response format, auth attributes
4. One service — business logic patterns, dependency injection usage
5. One entity/model — data structure, relationships, conventions
