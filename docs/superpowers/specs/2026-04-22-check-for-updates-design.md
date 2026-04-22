# Check-for-Updates Skill — Design Spec

## Problem

Projects initialized with Harness Engineering have no way to receive skill updates after installation. The `init.sh` script refuses to run if `memory/` already exists. Users must manually copy updated files — error-prone and tedious. The previous `update.sh` approach required a local clone to be up-to-date and maintainers to build incremental patch folders, adding friction on both sides.

## Solution

A slash command skill (`/check-for-updates`) that checks GitHub releases for the harness-engineering repo, downloads the latest release package, and overwrites distributable files while preserving user memory content. Works like a software update — check, confirm, apply.

## `.harness-version` Format

Stored at `memory/.harness-version` in YAML:

```yaml
version: v1.0.0
repo: owner/harness-engineering
```

- `version` — matches the GitHub release tag currently installed
- `repo` — GitHub repo identifier used by the skill to check releases via `gh` CLI
- Written by `init.sh` during first install
- Updated by the skill after applying an update

## Update Check Flow

1. **Read `.harness-version`** from `memory/.harness-version` — get current version and repo identifier
2. **Check GitHub releases** — run `gh release list --repo {repo}` to find the latest release
3. **Compare versions** — if latest release tag is newer than installed version, continue; otherwise report "Already up to date" and stop
4. **Show release info** — display the release tag and release notes/description if available
5. **Warn and confirm** — "Updating will overwrite all skill files (`.claude/commands/`). Your memory content (`memory/` files, registries) is not affected. Proceed?"
6. **Download release** — download the release asset (archive) to a temp directory
7. **Apply** — extract and copy files into the project, overwriting existing skill files but skipping anything under `memory/`
8. **Update `.harness-version`** — write new version number, keep repo unchanged
9. **Clean up** — remove temp files
10. **Report** — summary of what was updated

## Release Package Structure

Each GitHub release includes a single archive asset. The archive mirrors the target project's installable structure:

```
harness-v1.0.1.tar.gz
└── .claude/
    └── commands/
        ├── memory-scan.md
        ├── memory-analyze.md
        ├── memory-building.md
        ├── memory-building-knowledge/
        │   ├── csharp.md
        │   ├── go.md
        │   ├── java.md
        │   ├── nodejs.md
        │   └── python.md
        ├── memory-extract.md
        ├── memory-interview.md
        └── check-for-updates.md
```

Key rules:
- The archive contains **only distributable files** — skills and commands
- Directory structure mirrors the target project root
- **Protected paths never overwritten:** everything under `memory/` (content files, registries, `HARNESS.yaml`)
- The `check-for-updates` skill itself is included, so it also receives updates

## Skill File

The skill lives at `bin/skills/check-for-updates.md` in the harness-engineering repo and is installed to `.claude/commands/check-for-updates.md` in target projects via `init.sh`.

Frontmatter:

```yaml
---
name: check-for-updates
description: Check for Harness Engineering updates from GitHub releases and apply them
---
```

## Changes to Existing Files

### Remove

| File | Reason |
|---|---|
| `bin/update.sh` | Replaced by the skill |
| `update/` folder | No longer needed — patches replaced by full release packages |
| `docs/superpowers/specs/2026-04-22-update-script-design.md` | Superseded by this spec |
| `docs/superpowers/plans/2026-04-22-update-script.md` | Superseded |

### Modify

| File | Change |
|---|---|
| `bin/init.sh` | Write new `.harness-version` format (version + repo) |
| `bin/skills/` | Add `check-for-updates.md` |
| `README.md` | Update project structure, remove `update.sh`/`update/` references, add update workflow |
| `guideline/skills-guide.md` | Add `check-for-updates` to skill reference table |

### No Changes

- Memory structure, templates, best practices, `HARNESS.yaml` — all unaffected

## Design Decisions

| Decision | Choice | Reason |
|---|---|---|
| GitHub releases instead of patch folders | Yes | Simpler for maintainers — package current state, no tracking diffs. Simpler for users — no local clone dependency for updates |
| Full package overwrites instead of incremental patches | Yes | Eliminates patch accumulation and ordering complexity. Protected paths (`memory/`) prevent data loss |
| `gh` CLI for GitHub interaction | Yes | Standard tool, handles auth, available on most dev machines |
| Skill asks before pulling/applying | Yes | User stays in control, no surprise file changes |
| `check-for-updates` included in its own package | Yes | The updater can update itself |
| `.harness-version` stores repo identifier | Yes | Skill is self-contained — doesn't need hardcoded repo info |
