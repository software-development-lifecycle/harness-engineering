# memory:scan Implementation Plan

> **NOTE:** References to `memory:seeding` in this document now refer to `memory:analyze`. See [Memory Skills Redesign](../../memory-plan/2026-04-22-memory-skills-redesign-spec.md).

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the `memory:scan` Claude Code skill and update `init.sh` to install it alongside the memory structure.

**Architecture:** Single markdown skill file at `.claude/commands/memory-scan.md` containing the full skill instructions and embedded knowledge. `init.sh` is updated to create the `.claude/commands/` directory and copy the skill file during project scaffolding.

**Tech Stack:** Bash (init.sh), Markdown (skill file), Claude Code slash commands

---

## File Structure

| Action | Path | Responsibility |
|---|---|---|
| Create | `.claude/commands/memory-scan.md` | The skill file — full instructions and embedded knowledge for Claude Code |
| Create | `bin/skills/memory-scan.md` | Source template of the skill (init.sh copies from here to the target project) |
| Modify | `bin/init.sh` | Add `.claude/commands/` creation and skill installation |

**Design decision:** The skill source template lives in `bin/skills/` within this repo. `init.sh` copies it into the target project's `.claude/commands/`. This way the harness-engineering repo is the single source of truth for skill templates, and `init.sh` installs them.

---

### Task 1: Create the memory:scan skill file

**Files:**
- Create: `bin/skills/memory-scan.md`

This is the source template that `init.sh` will copy into target projects. It contains the complete skill with all embedded knowledge.

- [ ] **Step 1: Create the `bin/skills/` directory**

```bash
mkdir -p bin/skills
```

- [ ] **Step 2: Write the skill file `bin/skills/memory-scan.md`**

```markdown
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
| `*.csproj` | .NET target framework, NuGet packages |
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

Run `memory:seeding` — it will deep-analyze your existing source code
to generate an initial knowledge base for the technical, domain, and
rules memory stores.
```

**For empty projects:**

```
## Project Scan

**Memory status:** [Initialized (registries empty) | Partial | Populated]
**Source code:** Not detected

## Suggested Next Step

This appears to be a new project. Run `memory:seeding` with your
requirements documents (SRS, PRD, user stories) to generate an
initial knowledge base.
```

**For projects with existing memory:**

If registries already have entries, adjust the suggestion:

```
## Suggested Next Step

Your knowledge base already has content. Options:
- Run `memory:seeding` to add more memory files
- Run `memory:interview` to capture tribal knowledge
- Run `memory:extract` if you have new requirements documents
```

## Scope

This skill ONLY scans and reports. It does NOT:
- Write or modify any files
- Deep-analyze source code
- Generate memory files
- Ask the user extended questions
```

- [ ] **Step 3: Verify the skill file is well-formed**

```bash
# Check the frontmatter is valid
head -4 bin/skills/memory-scan.md
# Should show:
# ---
# name: memory:scan
# description: Quick project overview — checks memory state, samples source code, suggests next steps
# ---
```

- [ ] **Step 4: Commit**

```bash
git add bin/skills/memory-scan.md
git commit -m "feat: add memory:scan skill template"
```

---

### Task 2: Update init.sh to install skills

**Files:**
- Modify: `bin/init.sh`

Update the script to:
1. Create `.claude/commands/` in the target project
2. Copy skill files from `bin/skills/` into it
3. Update the dry-run output to show the new files

- [ ] **Step 1: Update the dry-run section of init.sh**

Find the existing dry-run block and add the new entries. Replace this section:

```bash
if [[ "$DRY_RUN" == true ]]; then
  echo "[dry-run] Would create:"
  echo "  memory/"
  echo "  memory/HARNESS.yaml"
  echo "  memory/technical/"
  echo "  memory/technical/_registry.yaml"
  echo "  memory/domain/"
  echo "  memory/domain/_registry.yaml"
  echo "  memory/rules/"
  echo "  memory/rules/_registry.yaml"
  exit 0
fi
```

With:

```bash
if [[ "$DRY_RUN" == true ]]; then
  echo "[dry-run] Would create:"
  echo "  memory/"
  echo "  memory/HARNESS.yaml"
  echo "  memory/technical/"
  echo "  memory/technical/_registry.yaml"
  echo "  memory/domain/"
  echo "  memory/domain/_registry.yaml"
  echo "  memory/rules/"
  echo "  memory/rules/_registry.yaml"
  echo "  .claude/commands/"
  echo "  .claude/commands/memory-scan.md"
  exit 0
fi
```

- [ ] **Step 2: Add skill installation after the memory structure creation**

Find the end of `init.sh` — after the registry file creation and before the final echo. Add the skill installation block. The section after the registry creation currently looks like:

```bash
echo "# technical/_registry.yaml" > "$PROJECT_DIR/memory/technical/_registry.yaml"
echo "# domain/_registry.yaml" > "$PROJECT_DIR/memory/domain/_registry.yaml"
echo "# rules/_registry.yaml" > "$PROJECT_DIR/memory/rules/_registry.yaml"

echo "Created Harness Engineering memory structure at $PROJECT_DIR/memory/"
```

Replace the final echo with:

```bash
echo "# technical/_registry.yaml" > "$PROJECT_DIR/memory/technical/_registry.yaml"
echo "# domain/_registry.yaml" > "$PROJECT_DIR/memory/domain/_registry.yaml"
echo "# rules/_registry.yaml" > "$PROJECT_DIR/memory/rules/_registry.yaml"

# Install memory toolkit skills
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$SCRIPT_DIR/skills"

mkdir -p "$PROJECT_DIR/.claude/commands"

if [[ -d "$SKILLS_DIR" ]]; then
  for skill_file in "$SKILLS_DIR"/*.md; do
    [[ -f "$skill_file" ]] || continue
    cp "$skill_file" "$PROJECT_DIR/.claude/commands/"
  done
fi

echo "Created Harness Engineering memory structure at $PROJECT_DIR/memory/"
echo "Installed memory toolkit skills at $PROJECT_DIR/.claude/commands/"
```

- [ ] **Step 3: Update the existing-memory guard to also handle .claude/commands/**

The current guard checks if `memory/` already exists and exits. We should NOT add a similar guard for `.claude/commands/` — the commands directory may already exist with other skills. The `cp` command naturally overwrites, which is fine for re-initialization of skills.

No code change needed — just noting the design decision.

- [ ] **Step 4: Verify the updated init.sh is syntactically valid**

```bash
bash -n bin/init.sh
# Should produce no output (no syntax errors)
```

- [ ] **Step 5: Commit**

```bash
git add bin/init.sh
git commit -m "feat: update init.sh to install memory toolkit skills"
```

---

### Task 3: Test init.sh installs the skill correctly

**Files:**
- No files created — manual verification

- [ ] **Step 1: Create a temporary test directory**

```bash
mkdir -p /tmp/harness-test-project
```

- [ ] **Step 2: Run init.sh on the test directory**

```bash
bash bin/init.sh /tmp/harness-test-project --name "Test Project"
```

Expected output:
```
Created Harness Engineering memory structure at /tmp/harness-test-project/memory/
Installed memory toolkit skills at /tmp/harness-test-project/.claude/commands/
```

- [ ] **Step 3: Verify the full directory structure**

```bash
find /tmp/harness-test-project/memory /tmp/harness-test-project/.claude -type f | sort
```

Expected output:
```
/tmp/harness-test-project/.claude/commands/memory-scan.md
/tmp/harness-test-project/memory/domain/_registry.yaml
/tmp/harness-test-project/memory/HARNESS.yaml
/tmp/harness-test-project/memory/rules/_registry.yaml
/tmp/harness-test-project/memory/technical/_registry.yaml
```

- [ ] **Step 4: Verify the skill file content was copied correctly**

```bash
diff bin/skills/memory-scan.md /tmp/harness-test-project/.claude/commands/memory-scan.md
```

Expected: no output (files are identical).

- [ ] **Step 5: Verify dry-run includes new entries**

```bash
rm -rf /tmp/harness-test-project
mkdir -p /tmp/harness-test-project
bash bin/init.sh /tmp/harness-test-project --dry-run
```

Expected output includes:
```
[dry-run] Would create:
  memory/
  memory/HARNESS.yaml
  memory/technical/
  memory/technical/_registry.yaml
  memory/domain/
  memory/domain/_registry.yaml
  memory/rules/
  memory/rules/_registry.yaml
  .claude/commands/
  .claude/commands/memory-scan.md
```

- [ ] **Step 6: Clean up test directory**

```bash
rm -rf /tmp/harness-test-project
```

- [ ] **Step 7: Commit (no changes — verification only)**

No commit needed for this task — it was verification only.

---

### Task 4: Install the skill in the harness-engineering repo itself

**Files:**
- Create: `.claude/commands/memory-scan.md`

Since harness-engineering already has `memory/` set up, we install the skill directly (we can't re-run init.sh because it guards against existing `memory/`).

- [ ] **Step 1: Create the commands directory**

```bash
mkdir -p .claude/commands
```

- [ ] **Step 2: Copy the skill file**

```bash
cp bin/skills/memory-scan.md .claude/commands/memory-scan.md
```

- [ ] **Step 3: Verify it was copied**

```bash
diff bin/skills/memory-scan.md .claude/commands/memory-scan.md
```

Expected: no output (files are identical).

- [ ] **Step 4: Commit**

```bash
git add .claude/commands/memory-scan.md
git commit -m "feat: install memory:scan skill in project"
```

---

### Task 5: Test the skill by running /memory:scan

**Files:**
- No files created — manual verification

- [ ] **Step 1: Run the skill in the harness-engineering project**

In Claude Code, type: `/memory:scan`

Expected behavior: Claude Code loads the skill and follows the instructions.

- [ ] **Step 2: Verify Step 1 output (memory check)**

The skill should detect that `memory/` exists with:
- `HARNESS.yaml` ✓
- `technical/_registry.yaml` ✓ (empty — comment only)
- `domain/_registry.yaml` ✓ (empty — comment only)
- `rules/_registry.yaml` ✓ (empty — comment only)

Memory status should be: "Initialized (registries empty)"

- [ ] **Step 3: Verify Step 2 output (source sampling)**

The skill should detect source indicators in the harness-engineering repo:
- `bin/` directory with scripts
- `guideline/` directory with documentation
- No typical application source folders (no `src/`, `controllers/`, etc.)
- No application manifest files (`package.json`, `go.mod`, etc.)

The repo is a methodology/documentation project, not an application — the skill may report limited source or suggest document-based seeding.

- [ ] **Step 4: Verify the output format matches the spec**

Output should follow one of the two templates from the spec:
- `## Project Scan` heading
- `**Memory status:**` line
- `**Source code:**` line
- `## Suggested Next Step` heading with actionable recommendation

- [ ] **Step 5: Note any issues for improvement**

If the skill output doesn't match expectations, note what needs to change in the skill file. Iterate by editing `bin/skills/memory-scan.md`, copying to `.claude/commands/memory-scan.md`, and re-running.
