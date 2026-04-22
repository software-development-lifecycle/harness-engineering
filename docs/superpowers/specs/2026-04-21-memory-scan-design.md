# memory:scan — Design Spec

## Overview

`memory:scan` is a lightweight, project-level Claude Code skill that performs a quick overview of the current project folder and tells the user what to do next. It is the first skill in the `memory:` toolkit — a suite of utility skills that ship with the Harness Engineering methodology.

## Design Principles

- **Self-contained:** the skill embeds its own knowledge, rules, and scanning heuristics. No runtime dependency on methodology docs, guideline files, or other skills.
- **Lightweight:** samples the project, does not scan everything. Minimal token cost.
- **Diagnostic, not generative:** produces a report and recommendations. Does not write memory files.
- **Project-level:** installed at `.claude/commands/memory-scan.md` inside the project. Teams can customize it.

## Toolkit Context

The `memory:` toolkit is a set of independent, self-contained skills installed at project level by `init.sh`:

| Skill | Purpose | Status |
|---|---|---|
| `memory:scan` | Quick project overview, suggest next steps | This spec |
| `memory:seeding` | Deep analysis to generate memory files | Future |
| `memory:extract` | Extract knowledge from requirements docs | Future |
| `memory:interview` | Interactive Q&A to fill knowledge gaps | Future |

Each skill carries its own embedded knowledge. No skill depends on another skill's knowledge or on external methodology documentation at runtime. This is a **core architectural rule** for the entire toolkit — skills are self-contained units that can be understood, customized, and maintained independently.

## Installation

`init.sh` installs the skill into the project at `.claude/commands/memory-scan.md`. The skill becomes available as a slash command within Claude Code when working in that project.

## Prerequisites

- `init.sh` has been run (i.e., `memory/` folder exists with HARNESS.yaml and registries)

## Flow

```
User runs /memory:scan
        │
        ▼
   ┌─────────────────────┐
   │ 1. Check memory/     │
   │    folder exists      │
   └──────────┬───────────┘
              │
        ┌─────┴──────┐
        │             │
    Not exists       Exists
        │             │
        ▼             ▼
   "Run init.sh   ┌──────────────────┐
    first"        │ 2. Sample project │
                  │    folder          │
                  └──────────┬────────┘
                             │
                       ┌─────┴──────┐
                       │             │
                  No source     Has source
                       │             │
                       ▼             ▼
                  "Run seeding   ┌───────────────────┐
                   with your     │ 3. Read 1-2 sample │
                   requirements  │    files            │
                   docs"         └──────────┬─────────┘
                                            │
                                            ▼
                                   "Source detected:
                                    [brief summary].
                                    Run memory:seeding
                                    to generate memory
                                    from your codebase."
```

### Step 1: Check memory/ folder

Verify that `memory/` exists in the current project root with:
- `HARNESS.yaml`
- `technical/_registry.yaml`
- `domain/_registry.yaml`
- `rules/_registry.yaml`

If missing → report: "Harness Engineering is not initialized. Run `init.sh <project-dir>` first."

### Step 2: Sample project folder

Use the embedded scanning checklist (see Embedded Knowledge section below) to sample the project:

- Check for known source folders
- Check for known config/manifest files
- Do NOT recursively scan all files — only check for the existence of key indicators

If no source indicators found → report empty project, suggest document-based seeding.

### Step 3: Read sample files (existing source only)

If source is detected:
- Read 1-2 sample source files to identify tech stack, language, and project shape
- Read manifest/config files (e.g., `package.json`, `go.mod`) for dependencies
- Keep total files read to a maximum of 3-5 to control token cost

Produce a brief summary: language, framework, project structure pattern.

## Embedded Knowledge

The skill carries its own scanning checklist inline. This is the skill's self-contained knowledge — not a reference to external docs.

### Source folder indicators

```
src/          app/          lib/
controllers/  services/     models/
routes/       handlers/     components/
pages/        views/        templates/
cmd/          pkg/          internal/
```

### Config/manifest indicators

```
package.json        requirements.txt    Pipfile
go.mod              Cargo.toml          pom.xml
build.gradle        *.csproj            *.sln
composer.json       Gemfile             mix.exs
docker-compose.yml  Dockerfile          Makefile
```

### Tech stack detection rules

| Indicator | Tech stack signal |
|---|---|
| `package.json` | Node.js / JavaScript / TypeScript |
| `requirements.txt` / `Pipfile` | Python |
| `go.mod` | Go |
| `Cargo.toml` | Rust |
| `*.csproj` / `*.sln` | .NET / C# |
| `pom.xml` / `build.gradle` | Java |
| `composer.json` | PHP |
| `Gemfile` | Ruby |
| `mix.exs` | Elixir |
| `Dockerfile` | Containerized deployment |

### Registry state rules

| State | Meaning |
|---|---|
| All registries empty | No memory seeded yet |
| Some registries have entries | Partial knowledge base |
| All registries have entries | Knowledge base exists — may need review/update |

## Output Format

The skill outputs a short report directly in the conversation:

```
## Project Scan

**Memory status:** Initialized (registries empty)
**Source code:** Detected
**Tech stack:** Node.js / TypeScript (from package.json)
**Project shape:** Express API with controllers/services pattern

## Suggested Next Step

Run `memory:seeding` — it will deep-analyze your existing source code
to generate an initial knowledge base for the technical, domain, and
rules memory stores.
```

For empty projects:

```
## Project Scan

**Memory status:** Initialized (registries empty)
**Source code:** Not detected

## Suggested Next Step

This appears to be a new project. Run `memory:seeding` with your
requirements documents (SRS, PRD, user stories) to generate an
initial knowledge base.
```

## Scope Boundaries

### What this skill does
- Checks memory/ folder state
- Samples project folder for source presence
- Reads 1-2 files to identify tech stack
- Reports findings and suggests next steps

### What this skill does NOT do
- Write or modify any files
- Deep-analyze source code
- Generate memory files
- Read requirements documents
- Ask the user questions (beyond confirming next steps)

## Customization

Since the skill lives at project level, teams can customize:
- The source folder checklist (add project-specific paths)
- The config file indicators (add custom manifest files)
- The tech stack detection rules
- The output format and suggested next steps
- The registry state interpretation
