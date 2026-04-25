---
name: memory:scan
description: Quick project overview — checks memory state, samples source code, suggests next steps
---

# memory:scan

Perform a lightweight scan of the current project to assess its state and recommend next steps from the memory toolkit.

## Instructions

Follow these steps in order. Do NOT skip steps. Report findings to the user at each stage.

### Step 1: Check memory/ folder

Check if the following exist in the current project root:

- `memory/HARNESS.yaml`
- `memory/technical/_registry.yaml`
- `memory/domain/_registry.yaml`
- `memory/rules/_registry.yaml`

**If any are missing**, stop and report:

> Harness Engineering is not initialized in this project. Run `init.sh <project-dir>` to set up the memory structure first.

**If all exist**, read each `_registry.yaml` and determine the memory state:

| State | How to detect |
|---|---|
| All registries contain only a comment line (e.g., `# technical/_registry.yaml`) | Registries empty — no memory seeded yet |
| Some registries have entry blocks beyond the comment | Partial knowledge base |
| All three registries have entry blocks beyond the comment | Knowledge base exists |

Continue to Step 2.

### Step 2: Sample project folder for source code

Check for the existence of these **source folder indicators** in the project root. Use `ls` or glob — do NOT recursively scan.

```
src/          app/          lib/
controllers/  services/     models/
routes/       handlers/     components/
pages/        views/        templates/
cmd/          pkg/          internal/
```

Check for these **config/manifest file indicators**:

```
package.json        requirements.txt    Pipfile
go.mod              Cargo.toml          pom.xml
build.gradle        *.csproj            *.sln
composer.json       Gemfile             mix.exs
docker-compose.yml  Dockerfile          Makefile
```

**If no source folders AND no config files found**, the project is empty. Skip to the Output section and use the "empty project" template.

**If any indicators found**, continue to Step 3.

### Step 3: Read sample files to identify tech stack

Read config/manifest files first — they give the most signal for the least tokens:

| File found | Read it to learn |
|---|---|
| `package.json` | Node.js deps, scripts, framework (express, next, react, etc.) |
| `requirements.txt` / `Pipfile` | Python deps, framework (django, flask, fastapi, etc.) |
| `go.mod` | Go module name, dependencies |
| `Cargo.toml` | Rust crate name, dependencies |
| `*.csproj` / `*.sln` | .NET target framework, NuGet packages |
| `pom.xml` / `build.gradle` | Java deps, framework (spring, etc.) |
| `composer.json` | PHP deps, framework (laravel, symfony, etc.) |
| `Gemfile` | Ruby deps, framework (rails, sinatra, etc.) |
| `mix.exs` | Elixir deps, framework (phoenix, etc.) |

Then pick **1-2 source files** from the detected source folders. Prefer:
1. An entry point file (e.g., `Program.cs`, `main.go`, `app.py`, `index.ts`)
2. One controller/handler/route file (shows API structure and patterns)

Read these files to determine:
- Primary language and framework
- Architecture pattern (e.g., MVC, layered, vertical slice)
- Project shape (API, web app, CLI, library, etc.)

**Token budget:** read a maximum of 3-5 files total (config + source).

### Output

Present the scan results to the user using this format:

**For projects with source code:**

```
## Project Scan

**Memory status:** [Initialized (registries empty) | Partial (N of 3 stores have entries) | Populated (all stores have entries)]
**Source code:** Detected
**Tech stack:** [Language / Framework] (from [config file])
**Project shape:** [Brief description of architecture and project type]

## Suggested Next Step

Run `memory:analyze` — it will deep-analyze your existing source code
to generate an initial knowledge base for the technical, domain, and
rules memory stores.
```

**For empty projects:**

```
## Project Scan

**Memory status:** [Initialized (registries empty) | Partial | Populated]
**Source code:** Not detected

## Suggested Next Step

This appears to be a new project. Run `memory:analyze` with your
requirements documents (SRS, PRD, user stories) to generate an
initial knowledge base.
```

**For projects with existing memory:**

If registries already have entries, adjust the suggestion:

```
## Suggested Next Step

Your knowledge base already has content. Options:
- Run `memory:analyze` (source mode) to analyze code changes
- Run `memory:analyze` (document mode) to add knowledge from new documents
- Run `memory:analyze` (interview mode) to capture tribal knowledge
```

## Scope

This skill ONLY scans and reports. It does NOT:
- Write or modify any files
- Deep-analyze source code
- Generate memory files
- Ask the user extended questions
