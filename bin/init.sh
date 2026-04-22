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
      if [[ $# -lt 2 ]]; then
        echo "Error: --name requires a value" >&2
        usage
        exit 1
      fi
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
  echo "  .claude/commands/"
  echo "  .claude/commands/memory-scan.md"
  echo "  .claude/commands/memory-analyze.md"
  echo "  .claude/commands/memory-building.md"
  echo "  .claude/commands/memory-building-knowledge/"
  echo "  .claude/commands/memory-extract.md"
  echo "  .claude/commands/memory-interview.md"
  exit 0
fi

mkdir -p "$PROJECT_DIR/memory/technical" "$PROJECT_DIR/memory/domain" "$PROJECT_DIR/memory/rules"

SAFE_NAME="${PROJECT_NAME//\"/\\\"}"

cat > "$PROJECT_DIR/memory/HARNESS.yaml" << EOF
# HARNESS.yaml

project: "$SAFE_NAME"
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

# Install memory toolkit skills
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$SCRIPT_DIR/skills"

mkdir -p "$PROJECT_DIR/.claude/commands"

if [[ -d "$SKILLS_DIR" ]]; then
  for skill_file in "$SKILLS_DIR"/*.md; do
    [[ -f "$skill_file" ]] || continue
    cp "$skill_file" "$PROJECT_DIR/.claude/commands/"
  done
  for skill_dir in "$SKILLS_DIR"/*/; do
    [[ -d "$skill_dir" ]] || continue
    cp -r "$skill_dir" "$PROJECT_DIR/.claude/commands/"
  done
fi

echo "Created Harness Engineering memory structure at $PROJECT_DIR/memory/"
echo "Installed memory toolkit skills at $PROJECT_DIR/.claude/commands/"
