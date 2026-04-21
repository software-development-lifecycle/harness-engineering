# License & Contributing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add MIT license, contributing guide, and update the README to remove the license TODO.

**Architecture:** Three files: `LICENSE` (standard MIT text), `CONTRIBUTING.md` (minimal contributor guide), and a one-line edit to `README.md`. All at project root.

**Tech Stack:** Markdown

**Spec:** `docs/superpowers/specs/2026-04-21-license-contributing-design.md`

---

### Task 1: Create LICENSE file

**Files:**
- Create: `LICENSE`

- [ ] **Step 1: Write the LICENSE file**

```
MIT License

Copyright (c) 2026 CongNT (ntcong85@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 2: Verify the copyright line**

Run: `head -3 LICENSE`

Expected:
```
MIT License

Copyright (c) 2026 CongNT (ntcong85@gmail.com)
```

- [ ] **Step 3: Commit**

```bash
git add LICENSE
git commit -m "docs: add MIT license"
```

---

### Task 2: Create CONTRIBUTING.md

**Files:**
- Create: `CONTRIBUTING.md`

- [ ] **Step 1: Write the CONTRIBUTING.md file**

```markdown
# Contributing to Harness Engineering

## How to Contribute

1. Fork or clone the repository
2. Create a branch from `develop`
3. Submit a pull request to `develop`

## Branch Strategy

- `develop` — active work; all pull requests target this branch
- `main` — stable releases only; merges require project owner approval

## Commit Conventions

Use [conventional commits](https://www.conventionalcommits.org/):

- `feat:` — new feature or content
- `fix:` — bug fix or correction
- `docs:` — documentation changes

Keep messages concise (1-2 sentences). Focus on the "why", not the "what".

## Memory Files

When creating or editing memory files:

- Follow the guidelines in `guideline/memory-management-best-practices.md`
- Always update the corresponding `_registry.yaml` when adding, modifying, or removing memory files
- Use templates from `guideline/templates/` for scaffolding new files

## Review Process

- All changes go through pull request review before merging to `develop`
- Merges from `develop` to `main` require approval from the project owner
```

- [ ] **Step 2: Verify line count**

Run: `wc -l CONTRIBUTING.md`

Expected: 30-35 lines

- [ ] **Step 3: Commit**

```bash
git add CONTRIBUTING.md
git commit -m "docs: add contributing guide"
```

---

### Task 3: Update README license section

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace the license TODO**

Find this text in `README.md`:

```
## License

TODO: Add license information.
```

Replace with:

```
## License

This project is licensed under the [MIT License](LICENSE).
```

- [ ] **Step 2: Verify the change**

Run: `tail -3 README.md`

Expected:
```
## License

This project is licensed under the [MIT License](LICENSE).
```

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: update README with license link"
```
