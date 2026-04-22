---
name: check-for-updates
description: Check for Harness Engineering updates from GitHub releases and apply them
---

# check-for-updates

Check for new Harness Engineering releases and update the installed skills in this project.

## Instructions

Follow these steps in order. Report findings to the user at each stage.

### Step 1: Read version file

Read `memory/.harness-version` from the current project root. It is a YAML file with this structure:

```yaml
version: v1.0.0
repo: owner/harness-engineering
```

- `version` — the currently installed release tag
- `repo` — the GitHub repo identifier

**If the file does not exist**, stop and report:

> No `.harness-version` found. This project may have been initialized before the update system was added. Run `init.sh` again or create `memory/.harness-version` manually with the `version` and `repo` fields.

**If the file exists but is missing the `repo` field**, stop and report:

> `.harness-version` is missing the `repo` field. Add it manually: `repo: owner/harness-engineering` (replace with the actual GitHub repo).

### Step 2: Check GitHub for latest release

Run:

```bash
gh release view --repo {repo} --json tagName,name,body
```

If the command fails, report the error and suggest the user check:
- Is `gh` CLI installed? (`gh --version`)
- Is `gh` authenticated? (`gh auth status`)
- Is the repo identifier correct?

### Step 3: Compare versions

Compare the `tagName` from the latest release against the installed `version`.

**If the installed version is the same or newer**, report:

> Already up to date ({version}).

And stop.

**If the latest release is newer**, continue to Step 4.

### Step 4: Show release info

Display to the user:

```
New version available: {tagName}
Installed version: {version}

Release notes:
{body}
```

### Step 5: Warn and confirm

Ask the user:

> Updating will overwrite all skill files in `.claude/commands/`. Your memory content (`memory/` files, registries, `HARNESS.yaml`) is **not affected**.
>
> Do you want to proceed with the update?

**If the user declines**, stop. Nothing is changed.

**If the user confirms**, continue to Step 6.

### Step 6: Download and apply the release

1. Create a temp directory:

```bash
TEMP_DIR=$(mktemp -d)
```

2. Download the release archive:

```bash
gh release download {tagName} --repo {repo} --dir "$TEMP_DIR" --pattern "*.tar.gz"
```

3. Extract the archive:

```bash
tar -xzf "$TEMP_DIR"/*.tar.gz -C "$TEMP_DIR"
```

4. Copy the extracted files into the project, preserving directory structure. Copy everything **except** anything under `memory/`:

```bash
# Find all files in the extracted archive (exclude memory/ paths)
find "$TEMP_DIR" -type f | grep -v '/memory/' | while read -r file; do
  # Determine the relative path (strip the temp dir and any top-level archive folder)
  rel_path=$(echo "$file" | sed "s|$TEMP_DIR/||" | sed 's|^[^/]*/||')
  if [ -n "$rel_path" ]; then
    mkdir -p "$(dirname "$rel_path")"
    cp "$file" "$rel_path"
  fi
done
```

5. Clean up:

```bash
rm -rf "$TEMP_DIR"
```

### Step 7: Update version file

Update `memory/.harness-version` — change only the `version` field to the new tag. Keep the `repo` field unchanged.

### Step 8: Report

Report to the user:

> Updated from {old_version} to {tagName}. Skill files in `.claude/commands/` have been refreshed.

## Scope

This skill ONLY checks for updates and applies them. It does NOT:
- Modify any files under `memory/` (content, registries, HARNESS.yaml)
- Change the `repo` field in `.harness-version`
- Create or modify memory files
- Run any other skill after updating
