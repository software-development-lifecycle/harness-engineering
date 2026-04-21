# Init Script Design

## Summary

Add a self-contained bash script (`bin/init.sh`) that bootstraps the Harness Engineering memory structure in any project directory. Creates the `memory/` directory, `HARNESS.yaml`, and 3 empty store registries. Supports `--dry-run` to preview without writing.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Form | Shell script (bash) | Portable, no dependencies, automatable |
| Location | `bin/init.sh` | Standard convention for project scripts |
| Self-contained | Yes, no repo dependencies | Users can curl/copy the script without cloning harness-engineering |
| Scope | Minimal — memory structure only | CLAUDE.md is project-specific; templates are better referenced than copied |
| Interactivity | Non-interactive | Unix-philosophy: arguments, not prompts |
| Dry-run | Supported via `--dry-run` flag | Lets users preview what will be created |

## Interface

**Usage:**
```
bin/init.sh <project-dir> [--name "Project Name"] [--dry-run]
```

**Arguments:**
- `<project-dir>` — required, path to the target project directory (must exist)
- `--name "Name"` — optional, project name for HARNESS.yaml (defaults to basename of project-dir)
- `--dry-run` — optional, prints what would be created without writing anything

Flags (`--name`, `--dry-run`) can appear in any order, before or after `<project-dir>`.

**Exit codes:**
- `0` — success
- `1` — error

## What It Creates

5 items inside the target project directory:

```
<project-dir>/
└── memory/
    ├── HARNESS.yaml
    ├── technical/
    │   └── _registry.yaml
    ├── domain/
    │   └── _registry.yaml
    └── rules/
        └── _registry.yaml
```

### HARNESS.yaml content

```yaml
# HARNESS.yaml

project: "<project-name>"
description: ""

memory_stores:
  technical:
    path: technical/
    registry: technical/_registry.yaml
    description: "Technical knowledge: languages, frameworks, patterns"

  domain:
    path: domain/
    registry: domain/_registry.yaml
    description: "Domain knowledge: workflows, business rules, terminology"

  rules:
    path: rules/
    registry: rules/_registry.yaml
    description: "Project constraints: coding standards, security, API conventions"
```

- `<project-name>` is replaced with the `--name` value or the basename of `<project-dir>`
- `description` is left empty for the user to fill in

### Registry file content

Each `_registry.yaml` contains a single comment header:

```yaml
# <store>/_registry.yaml
```

Where `<store>` is `technical`, `domain`, or `rules`.

## Output Behavior

### Normal run

```
$ ./bin/init.sh /path/to/my-app --name "My App"
Created Harness Engineering memory structure at /path/to/my-app/memory/
```

### Dry-run

```
$ ./bin/init.sh /path/to/my-app --name "My App" --dry-run
[dry-run] Would create:
  memory/
  memory/HARNESS.yaml
  memory/technical/
  memory/technical/_registry.yaml
  memory/domain/
  memory/domain/_registry.yaml
  memory/rules/
  memory/rules/_registry.yaml
```

### Error cases

```
$ ./bin/init.sh
Error: missing required argument <project-dir>
Usage: init.sh <project-dir> [--name "Project Name"] [--dry-run]

$ ./bin/init.sh /nonexistent
Error: directory does not exist: /nonexistent

$ ./bin/init.sh /path/to/my-app
Error: memory/ already exists in /path/to/my-app
```

All errors go to stderr. Normal output goes to stdout.

## Out of Scope

- CLAUDE.md generation (project-specific, not automatable)
- Copying template files into the target project
- Interactive prompts
- Non-bash implementations (Python, Node, etc.)
- Updating README or other docs in the target project
