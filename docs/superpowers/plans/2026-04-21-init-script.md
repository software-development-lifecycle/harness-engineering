# Init Script Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a self-contained bash script that bootstraps the Harness Engineering memory structure in any project directory.

**Architecture:** Single executable bash script at `bin/init.sh`. Parses args in any order (positional `<project-dir>`, optional `--name`, optional `--dry-run`). Creates 5 items: `memory/` directory, `HARNESS.yaml`, and 3 empty `_registry.yaml` files. All errors to stderr, exit 1 on failure.

**Tech Stack:** Bash

**Spec:** `docs/superpowers/specs/2026-04-21-init-script-design.md`

---

### Task 1: Create the init script

**Files:**
- Create: `bin/init.sh`

- [ ] **Step 1: Write the init script**

```bash
#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: init.sh <project-dir> [--name \"Project Name\"] [--dry-run]" >&2
}

PROJECT_DIR=""
PROJECT_NAME=""
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --name)
      PROJECT_NAME="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --*)
      echo "Error: unknown option $1" >&2
      usage
      exit 1
      ;;
    *)
      if [[ -z "$PROJECT_DIR" ]]; then
        PROJECT_DIR="$1"
      else
        echo "Error: unexpected argument $1" >&2
        usage
        exit 1
      fi
      shift
      ;;
  esac
done

if [[ -z "$PROJECT_DIR" ]]; then
  echo "Error: missing required argument <project-dir>" >&2
  usage
  exit 1
fi

if [[ ! -d "$PROJECT_DIR" ]]; then
  echo "Error: directory does not exist: $PROJECT_DIR" >&2
  exit 1
fi

if [[ -e "$PROJECT_DIR/memory" ]]; then
  echo "Error: memory/ already exists in $PROJECT_DIR" >&2
  exit 1
fi

if [[ -z "$PROJECT_NAME" ]]; then
  PROJECT_NAME="$(basename "$PROJECT_DIR")"
fi

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

mkdir -p "$PROJECT_DIR/memory/technical" "$PROJECT_DIR/memory/domain" "$PROJECT_DIR/memory/rules"

cat > "$PROJECT_DIR/memory/HARNESS.yaml" << EOF
# HARNESS.yaml

project: "$PROJECT_NAME"
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
EOF

echo "# technical/_registry.yaml" > "$PROJECT_DIR/memory/technical/_registry.yaml"
echo "# domain/_registry.yaml" > "$PROJECT_DIR/memory/domain/_registry.yaml"
echo "# rules/_registry.yaml" > "$PROJECT_DIR/memory/rules/_registry.yaml"

echo "Created Harness Engineering memory structure at $PROJECT_DIR/memory/"
```

- [ ] **Step 2: Make the script executable**

```bash
chmod +x bin/init.sh
```

- [ ] **Step 3: Commit**

```bash
git add bin/init.sh
git commit -m "feat: add init.sh bootstrapping script"
```

---

### Task 2: Test the script

- [ ] **Step 1: Test missing argument error**

```bash
./bin/init.sh 2>&1; echo "exit: $?"
```

Expected output:
```
Error: missing required argument <project-dir>
Usage: init.sh <project-dir> [--name "Project Name"] [--dry-run]
exit: 1
```

- [ ] **Step 2: Test nonexistent directory error**

```bash
./bin/init.sh /tmp/nonexistent-harness-test 2>&1; echo "exit: $?"
```

Expected output:
```
Error: directory does not exist: /tmp/nonexistent-harness-test
exit: 1
```

- [ ] **Step 3: Test dry-run mode**

```bash
mkdir -p /tmp/harness-test-dryrun
./bin/init.sh /tmp/harness-test-dryrun --name "Test Project" --dry-run; echo "exit: $?"
```

Expected output:
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
exit: 0
```

Then verify nothing was created:

```bash
ls /tmp/harness-test-dryrun/memory 2>&1
```

Expected: `ls: cannot access '/tmp/harness-test-dryrun/memory': No such file or directory`

- [ ] **Step 4: Test normal run with --name**

```bash
mkdir -p /tmp/harness-test-named
./bin/init.sh /tmp/harness-test-named --name "My E-Commerce App"; echo "exit: $?"
```

Expected output:
```
Created Harness Engineering memory structure at /tmp/harness-test-named/memory/
exit: 0
```

Verify structure:

```bash
find /tmp/harness-test-named/memory -type f | sort
```

Expected:
```
/tmp/harness-test-named/memory/HARNESS.yaml
/tmp/harness-test-named/memory/domain/_registry.yaml
/tmp/harness-test-named/memory/rules/_registry.yaml
/tmp/harness-test-named/memory/technical/_registry.yaml
```

Verify HARNESS.yaml content:

```bash
head -3 /tmp/harness-test-named/memory/HARNESS.yaml
```

Expected:
```
# HARNESS.yaml

project: "My E-Commerce App"
```

Verify registry content:

```bash
cat /tmp/harness-test-named/memory/technical/_registry.yaml
```

Expected: `# technical/_registry.yaml`

- [ ] **Step 5: Test normal run with default name (no --name flag)**

```bash
mkdir -p /tmp/harness-test-default
./bin/init.sh /tmp/harness-test-default; echo "exit: $?"
```

Expected output:
```
Created Harness Engineering memory structure at /tmp/harness-test-default/memory/
exit: 0
```

Verify name was derived from directory:

```bash
grep "^project:" /tmp/harness-test-default/memory/HARNESS.yaml
```

Expected: `project: "harness-test-default"`

- [ ] **Step 6: Test memory/ already exists error**

```bash
./bin/init.sh /tmp/harness-test-named 2>&1; echo "exit: $?"
```

Expected output (memory/ was created in Step 4):
```
Error: memory/ already exists in /tmp/harness-test-named
exit: 1
```

- [ ] **Step 7: Test flags before project-dir (any order)**

```bash
mkdir -p /tmp/harness-test-order
./bin/init.sh --name "Order Test" --dry-run /tmp/harness-test-order; echo "exit: $?"
```

Expected output:
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
exit: 0
```

- [ ] **Step 8: Clean up test directories**

```bash
rm -rf /tmp/harness-test-dryrun /tmp/harness-test-named /tmp/harness-test-default /tmp/harness-test-order
```
