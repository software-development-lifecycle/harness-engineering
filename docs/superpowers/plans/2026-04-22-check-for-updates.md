# Check-for-Updates Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a `/check-for-updates` slash command skill that checks GitHub releases for Harness Engineering updates and applies them to the user's project, replacing the previous `update.sh` + patch folder approach.

**Architecture:** A pure skill file (`bin/skills/check-for-updates.md`) instructs Claude to read `memory/.harness-version` (YAML with `version` and `repo` fields), check GitHub releases via `gh` CLI, download and extract the release archive, and overwrite distributable files while protecting `memory/`. `init.sh` is modified to write the new `.harness-version` format and derive the repo identifier from `git remote get-url origin`. The old `update.sh`, `update/` folder, and superseded spec/plan docs are removed.

**Tech Stack:** Markdown (skill), Bash (init.sh modifications), `gh` CLI (GitHub interaction)

---

## File Structure

| File | Responsibility |
|---|---|
| `bin/skills/check-for-updates.md` (create) | Skill file — instructions for Claude to check and apply updates |
| `bin/init.sh` (modify) | Write new `.harness-version` format (version + repo), add to dry-run output |
| `README.md` (modify) | Add check-for-updates to skill table, update project structure tree |
| `guideline/skills-guide.md` (modify) | Add check-for-updates to skill reference |
| `bin/update.sh` (delete) | Replaced by the skill |
| `docs/superpowers/specs/2026-04-22-update-script-design.md` (delete) | Superseded |
| `docs/superpowers/plans/2026-04-22-update-script.md` (delete) | Superseded |

---

### Task 1: Create the check-for-updates skill

**Files:**
- Create: `bin/skills/check-for-updates.md`

- [ ] **Step 1: Create the skill file**

Write to `bin/skills/check-for-updates.md`:

```markdown
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
```

- [ ] **Step 2: Verify the skill file has correct frontmatter**

```bash
head -4 bin/skills/check-for-updates.md
```

Expected:
```
---
name: check-for-updates
description: Check for Harness Engineering updates from GitHub releases and apply them
---
```

- [ ] **Step 3: Commit**

```bash
git add bin/skills/check-for-updates.md
git commit -m "feat: create check-for-updates skill for GitHub release-based updates"
```

---

### Task 2: Modify init.sh to write new .harness-version format

**Files:**
- Modify: `bin/init.sh`

- [ ] **Step 1: Add repo detection and .harness-version write after registry creation**

In `bin/init.sh`, after the three lines that create `_registry.yaml` files (lines 113-115):

```bash
echo "# technical/_registry.yaml" > "$PROJECT_DIR/memory/technical/_registry.yaml"
echo "# domain/_registry.yaml" > "$PROJECT_DIR/memory/domain/_registry.yaml"
echo "# rules/_registry.yaml" > "$PROJECT_DIR/memory/rules/_registry.yaml"
```

Add this block:

```bash
# Write .harness-version with repo info
REPO_URL=$(git -C "$SCRIPT_DIR" remote get-url origin 2>/dev/null || echo "")
REPO_ID=""
if [[ -n "$REPO_URL" ]]; then
  # Extract owner/repo from SSH or HTTPS URL
  REPO_ID=$(echo "$REPO_URL" | sed -E 's#(git@github\.com:|https://github\.com/)##' | sed 's/\.git$//')
fi

LATEST_TAG=$(gh release view --repo "$REPO_ID" --json tagName --jq '.tagName' 2>/dev/null || echo "")
if [[ -z "$LATEST_TAG" ]]; then
  LATEST_TAG="v0.0.0"
fi

cat > "$PROJECT_DIR/memory/.harness-version" << EOF
version: $LATEST_TAG
repo: $REPO_ID
EOF
```

- [ ] **Step 2: Add .harness-version to dry-run output**

In the dry-run block (around line 82), after the line:

```bash
  echo "  memory/rules/_registry.yaml"
```

Add:

```bash
  echo "  memory/.harness-version"
```

- [ ] **Step 3: Verify init.sh works with a temp directory**

```bash
mkdir -p /tmp/test-init-harness && ./bin/init.sh /tmp/test-init-harness && cat /tmp/test-init-harness/memory/.harness-version && rm -rf /tmp/test-init-harness
```

Expected: shows YAML with `version:` and `repo:` fields.

- [ ] **Step 4: Verify dry-run includes .harness-version**

```bash
./bin/init.sh /tmp/test-init-harness-dry --dry-run
```

Expected: output includes `memory/.harness-version` in the file list.

- [ ] **Step 5: Commit**

```bash
git add bin/init.sh
git commit -m "feat: init.sh writes .harness-version with version and repo fields"
```

---

### Task 3: Remove old update system

**Files:**
- Delete: `bin/update.sh`
- Delete: `docs/superpowers/specs/2026-04-22-update-script-design.md`
- Delete: `docs/superpowers/plans/2026-04-22-update-script.md`

- [ ] **Step 1: Remove update.sh**

```bash
rm bin/update.sh
```

- [ ] **Step 2: Remove superseded spec and plan**

```bash
rm docs/superpowers/specs/2026-04-22-update-script-design.md
rm docs/superpowers/plans/2026-04-22-update-script.md
```

- [ ] **Step 3: Verify files are gone**

```bash
ls bin/update.sh docs/superpowers/specs/2026-04-22-update-script-design.md docs/superpowers/plans/2026-04-22-update-script.md 2>&1
```

Expected: "No such file or directory" for all three.

- [ ] **Step 4: Commit**

```bash
git add -u bin/update.sh docs/superpowers/specs/2026-04-22-update-script-design.md docs/superpowers/plans/2026-04-22-update-script.md
git commit -m "chore: remove update.sh and superseded spec/plan docs"
```

---

### Task 4: Update README.md

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add check-for-updates to the skill table**

In the Memory Toolkit Skills table (around line 58), after the Interview row, add:

```markdown
| **Check for Updates** | `/check-for-updates` | Check for new Harness Engineering releases and apply updates |
```

- [ ] **Step 2: Add update workflow to Quick Start**

After the existing Quick Start code block (around line 36), add:

```markdown

### Updating an Existing Project

```bash
# Run the check-for-updates skill in your project
/check-for-updates
```

The skill checks GitHub releases, shows what's new, and asks before applying changes. Your memory content is never touched.
```

- [ ] **Step 3: Update project structure tree**

In the Project Structure section, add `check-for-updates.md` to the `bin/skills/` listing. After the line `│       ├── memory-interview.md`, add:

```
│       ├── check-for-updates.md
```

- [ ] **Step 4: Verify no stale references to update.sh or update/ folder**

```bash
grep -n "update.sh\|update/" README.md
```

Expected: no matches (or only the new `/check-for-updates` references).

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: add check-for-updates skill to README"
```

---

### Task 5: Update skills-guide.md

**Files:**
- Modify: `guideline/skills-guide.md`

- [ ] **Step 1: Add check-for-updates to the overview table**

In the Overview table (around line 12), after the Interview row, add:

```markdown
| [Check for Updates](#checkforupdates) | `/check-for-updates` | `memory/.harness-version` | Updated skill files |
```

- [ ] **Step 2: Add skill reference section**

After the `memory:interview` reference section (before the "## How Skills Work Together" section), add:

```markdown
---

### check-for-updates

**Purpose:** Check for new Harness Engineering releases on GitHub and update the installed skills.

**When to use:**
- Periodically, to check if newer skills are available
- After being notified that a new version has been released
- When skills seem outdated or a known fix has been published

**What it does:**
1. Reads `memory/.harness-version` to get the installed version and GitHub repo
2. Checks the latest GitHub release via `gh` CLI
3. Compares versions — if already up to date, reports and stops
4. Shows release notes and asks for confirmation
5. Downloads the release archive, extracts, and copies files into the project
6. Updates `memory/.harness-version` with the new version

**What it does NOT do:**
- Modify any files under `memory/` (content, registries, HARNESS.yaml)
- Run automatically — always requires user confirmation
- Downgrade — only updates to newer versions

**Prerequisites:**
- `gh` CLI installed and authenticated (`gh auth login`)
- `memory/.harness-version` exists with `version` and `repo` fields (created by `init.sh`)
```

- [ ] **Step 3: Verify no stale references to update.sh**

```bash
grep -n "update.sh" guideline/skills-guide.md
```

Expected: no matches.

- [ ] **Step 4: Commit**

```bash
git add guideline/skills-guide.md
git commit -m "docs: add check-for-updates to skills guide"
```

---

### Task 6: End-to-end verification

**Files:** none (verification only)

- [ ] **Step 1: Verify skill file is well-formed**

```bash
head -4 bin/skills/check-for-updates.md
```

Expected:
```
---
name: check-for-updates
description: Check for Harness Engineering updates from GitHub releases and apply them
---
```

- [ ] **Step 2: Verify init.sh installs the skill**

```bash
mkdir -p /tmp/test-e2e-harness && ./bin/init.sh /tmp/test-e2e-harness
```

Verify the skill was copied:

```bash
ls /tmp/test-e2e-harness/.claude/commands/check-for-updates.md
```

Expected: file exists.

Verify `.harness-version` format:

```bash
cat /tmp/test-e2e-harness/memory/.harness-version
```

Expected:
```yaml
version: vX.Y.Z
repo: owner/harness-engineering
```

- [ ] **Step 3: Verify old files are gone**

```bash
ls bin/update.sh 2>&1
```

Expected: "No such file or directory"

- [ ] **Step 4: Clean up**

```bash
rm -rf /tmp/test-e2e-harness
```

- [ ] **Step 5: Final review of all changes**

```bash
git log --oneline -10
```

Expected: commits for each task in this plan.
