# Node.js / TypeScript Knowledge

## Project Structure
- `package.json` — dependencies, scripts, project metadata
- `tsconfig.json` — TypeScript configuration (if TypeScript)
- `src/` or `app/` — main source directory
- `src/index.ts` or `src/app.ts` — application entry point
- `src/routes/` or `src/controllers/` — API route handlers
- `src/services/` — business logic layer
- `src/models/` or `src/entities/` — data models (Mongoose, TypeORM, Prisma)
- `src/middleware/` — Express/Koa middleware
- `src/utils/` or `src/helpers/` — utility functions
- `prisma/schema.prisma` — Prisma ORM schema
- `src/schemas/` — validation schemas (Zod, Joi)
- `.env.example` — environment variable template

## Architecture Indicators
| Pattern | How to detect |
|---|---|
| Express REST API | `express` in dependencies, route files with `router.get/post` |
| NestJS | `@nestjs/core` in dependencies, decorators like `@Controller`, `@Injectable` |
| Next.js | `next` in dependencies, `pages/` or `app/` directory with route files |
| Fastify | `fastify` in dependencies, plugin-based architecture |
| Monorepo | `workspaces` in package.json, or `lerna.json`, or `turbo.json` |
| Serverless | `serverless.yml` or `sam-template.yaml`, handler functions |

## Domain Signal Locations
- `src/models/` or `src/entities/` — domain models and schemas
- `src/services/` — business logic and workflow implementations
- `prisma/schema.prisma` — data model relationships
- `src/types/` — TypeScript interfaces defining domain concepts
- `src/constants/` — business constants, enums, status codes
- `src/validators/` or `src/schemas/` — business validation rules

## Convention Indicators
- `.eslintrc.*` — linting rules and code style
- `.prettierrc` — code formatting rules
- `tsconfig.json` — strict mode, path aliases, module resolution
- `.husky/` — git hooks for code quality
- `jest.config.*` or `vitest.config.*` — test configuration

## What to Sample (priority order)
1. `package.json` — dependencies, scripts, framework detection
2. `tsconfig.json` — TypeScript config, strictness level
3. Entry point (`src/index.ts` or `src/app.ts`) — app setup, middleware chain
4. One route/controller file — API patterns, middleware usage, response format
5. One service file — business logic patterns, error handling
