#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: update.sh <project-dir>" >&2
}

PROJECT_DIR=""

while [[ $# -gt 0 ]]; do
  case "$1" in
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

if [[ ! -d "$PROJECT_DIR/memory" ]]; then
  echo "Error: memory/ does not exist in $PROJECT_DIR — run init.sh first" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UPDATE_DIR="$SCRIPT_DIR/../update"

# Read current version
VERSION_FILE="$PROJECT_DIR/memory/.harness-version"
if [[ -f "$VERSION_FILE" ]]; then
  CURRENT_VERSION=$(cat "$VERSION_FILE" | tr -d '[:space:]')
else
  CURRENT_VERSION="v0.0.0"
fi

# Find and sort version folders
if [[ ! -d "$UPDATE_DIR" ]]; then
  echo "No update/ directory found. Nothing to update."
  exit 0
fi

ALL_VERSIONS=()
for dir in "$UPDATE_DIR"/v*/; do
  [[ -d "$dir" ]] || continue
  ALL_VERSIONS+=("$(basename "$dir")")
done

if [[ ${#ALL_VERSIONS[@]} -eq 0 ]]; then
  echo "No version packages found in update/. Nothing to update."
  exit 0
fi

# Sort versions
IFS=$'\n' SORTED_VERSIONS=($(printf '%s\n' "${ALL_VERSIONS[@]}" | sort -V)); unset IFS

# Filter to versions newer than current
PENDING_VERSIONS=()
for v in "${SORTED_VERSIONS[@]}"; do
  if [[ "$(printf '%s\n%s' "$CURRENT_VERSION" "$v" | sort -V | tail -1)" == "$v" && "$v" != "$CURRENT_VERSION" ]]; then
    PENDING_VERSIONS+=("$v")
  fi
done

if [[ ${#PENDING_VERSIONS[@]} -eq 0 ]]; then
  echo "Already up to date ($CURRENT_VERSION)."
  exit 0
fi

LATEST_PENDING="${PENDING_VERSIONS[${#PENDING_VERSIONS[@]}-1]}"

# Collect all changes across pending versions
FILES_TO_UPDATE=()
FILES_TO_DELETE=()

for v in "${PENDING_VERSIONS[@]}"; do
  VERSION_DIR="$UPDATE_DIR/$v"

  # Collect files to copy (exclude deletes.txt)
  while IFS= read -r -d '' file; do
    rel_path="${file#"$VERSION_DIR/"}"
    if [[ "$rel_path" != "deletes.txt" ]]; then
      FILES_TO_UPDATE+=("$rel_path")
    fi
  done < <(find "$VERSION_DIR" -type f -print0)

  # Collect files to delete
  if [[ -f "$VERSION_DIR/deletes.txt" ]]; then
    while IFS= read -r line; do
      line=$(echo "$line" | sed 's/#.*//' | xargs)
      [[ -z "$line" ]] && continue
      FILES_TO_DELETE+=("$line")
    done < "$VERSION_DIR/deletes.txt"
  fi
done

# Deduplicate
IFS=$'\n' FILES_TO_UPDATE=($(printf '%s\n' "${FILES_TO_UPDATE[@]}" | sort -u)); unset IFS
if [[ ${#FILES_TO_DELETE[@]} -gt 0 ]]; then
  IFS=$'\n' FILES_TO_DELETE=($(printf '%s\n' "${FILES_TO_DELETE[@]}" | sort -u)); unset IFS
fi

# Show warning
echo "Updating from $CURRENT_VERSION to $LATEST_PENDING (${#PENDING_VERSIONS[@]} version(s) to apply)"
echo ""

if [[ ${#FILES_TO_UPDATE[@]} -gt 0 ]]; then
  echo "Files to overwrite:"
  for f in "${FILES_TO_UPDATE[@]}"; do
    echo "  $f"
  done
  echo ""
fi

if [[ ${#FILES_TO_DELETE[@]} -gt 0 ]]; then
  echo "Files to delete:"
  for f in "${FILES_TO_DELETE[@]}"; do
    echo "  $f"
  done
  echo ""
fi

echo "Please backup your project before continuing."
read -r -p "Continue? [y/N] " response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
  echo "Update cancelled."
  exit 0
fi

# Apply each version in order
TOTAL_UPDATED=0
TOTAL_DELETED=0

for v in "${PENDING_VERSIONS[@]}"; do
  VERSION_DIR="$UPDATE_DIR/$v"
  echo ""
  echo "Applying $v..."

  # Step 1: Delete files
  if [[ -f "$VERSION_DIR/deletes.txt" ]]; then
    while IFS= read -r line; do
      line=$(echo "$line" | sed 's/#.*//' | xargs)
      [[ -z "$line" ]] && continue
      target="$PROJECT_DIR/$line"
      if [[ -e "$target" ]]; then
        rm -f "$target"
        TOTAL_DELETED=$((TOTAL_DELETED + 1))
      fi
    done < "$VERSION_DIR/deletes.txt"

    # Remove empty directories left after deletions
    find "$PROJECT_DIR/.claude/commands" -type d -empty -delete 2>/dev/null || true
  fi

  # Step 2: Copy files
  while IFS= read -r -d '' file; do
    rel_path="${file#"$VERSION_DIR/"}"
    [[ "$rel_path" == "deletes.txt" ]] && continue
    target="$PROJECT_DIR/$rel_path"
    mkdir -p "$(dirname "$target")"
    cp "$file" "$target"
    TOTAL_UPDATED=$((TOTAL_UPDATED + 1))
  done < <(find "$VERSION_DIR" -type f -print0)

  # Step 3: Update version
  echo "$v" > "$PROJECT_DIR/memory/.harness-version"
done

echo ""
echo "Updated to $LATEST_PENDING. $TOTAL_UPDATED files updated, $TOTAL_DELETED files deleted."
