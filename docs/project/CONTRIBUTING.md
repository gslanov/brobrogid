---
title: Contributing to BROBROGID Docs
type: meta
audience: all-agents
last_updated: 2026-04-07
---

# How to contribute to project documentation

## Rules for all agents

### DO

1. **Read before writing** — check if the topic already has a file. Don't duplicate.
2. **Small files** — target 500-1500 words per file, hard cap 2000. Split if longer.
3. **Self-contained** — each file should be understandable without reading others, but link generously.
4. **Frontmatter required** — every `.md` file starts with YAML frontmatter:
   ```yaml
   ---
   title: Descriptive Title
   type: overview | reference | runbook | decision | postmortem | meta
   audience: all-agents | security | seo | content | dev
   owner: your-agent-name
   last_updated: YYYY-MM-DD
   ---
   ```
5. **Explicit cross-references** — use relative paths: `[see schema](../02_database/schema.md)`
6. **Facts with sources** — when documenting a fact, link to the code file or commit that proves it: `src/data/types/index.ts:42` or `commit abc1234`
7. **Update `last_updated`** when you edit a file
8. **Date format ISO** — `2026-04-07`, never `04/07/2026` or `7 Apr 2026`

### DON'T

1. **No secrets** — never paste API keys, passwords, JWT tokens. Reference their location: "see `.agent/ADMIN_CREDENTIALS.md` (gitignored)"
2. **No hard-coded absolute paths** in docs — use project-relative paths
3. **Don't delete history** — if information becomes obsolete, mark it: `> **Deprecated 2026-05-01:** ...` instead of deleting. Helps agents understand evolution.
4. **Don't duplicate content** across files — link instead
5. **Don't edit other agents' domain files without coordination** — add a `## Note from <agent-name>` section or create a sibling file

## When to create a new file vs append to existing

**Create new file when:**
- New topic (a new component, a new process, a new sprint)
- Existing file would exceed 2000 words
- Different audience (e.g. security vs content writer)

**Append to existing when:**
- Adding a new section to an existing topic
- Adding a new example or edge case
- Updating outdated info (mark with date)

## File naming conventions

- All lowercase, snake_case, `.md` extension
- Use nouns not verbs: `deploy.md` not `how_to_deploy.md`
- Numeric prefix for ordering: `03_content_site/` but individual files inside don't need numbers
- Exceptions: `README.md`, `INDEX.md`, `CONTRIBUTING.md` uppercase by convention

## Templates

### Reference doc template

```markdown
---
title: <Thing> Reference
type: reference
audience: <who>
owner: <agent>
last_updated: YYYY-MM-DD
---

# <Thing>

## What it is

One paragraph description.

## Why it exists

Motivation, problem it solves.

## Where it lives

File paths, DB tables, service endpoints.

## How it works

Key mechanism. Diagrams help.

## Dependencies

What this thing depends on. What depends on it.

## Gotchas

Things that have broken before. Non-obvious behaviors.

## Related

- `[other file](../other_section/file.md)`
```

### Runbook template

```markdown
---
title: <Task> Runbook
type: runbook
audience: <who>
owner: <agent>
last_updated: YYYY-MM-DD
---

# How to <do thing>

## When to do this

Trigger condition.

## Prerequisites

- Required access
- Required knowledge
- Required tools

## Steps

1. First step with exact command
   ```bash
   command here
   ```
2. Second step — expected output:
   ```
   expected
   ```
3. ...

## Verification

How to confirm success.

## Rollback

What to do if it fails.

## Troubleshooting

Common errors and fixes.
```

### Decision doc template

```markdown
---
title: <Decision> — ADR
type: decision
status: accepted | rejected | superseded
date: YYYY-MM-DD
owner: <agent>
---

# ADR: <Decision Title>

## Context

What situation needs a decision?

## Considered options

- Option A: pros, cons
- Option B: pros, cons
- Option C: pros, cons

## Decision

What was chosen and why (in one sentence, then paragraphs).

## Consequences

- Positive
- Negative
- Neutral

## Related

Links to implementations.
```

## Cross-agent workflow

When agents with different zones need to change the same file:

1. **Preferred:** create a sibling file in your section. For example if security wants to add notes about booking form, create `06_security/booking_form_defenses.md` instead of editing `04_pwa_app/deploy.md`.
2. **If you must edit another agent's file:** add a clearly marked section at the bottom:
   ```markdown
   ---
   ## Note from SENTINEL (2026-04-07)

   <your addition>
   ```
3. **Don't delete other agents' content** without coordination.

## Keeping docs in sync with code

When you change code that docs describe:
1. Find the doc (`grep -r "filename.ts" docs/project/`)
2. Update it
3. Update `last_updated` in frontmatter
4. Mention "docs updated" in commit message

When code changes without doc updates → file an issue in `known_issues.md` so it gets fixed.

## RAG ingestion

These docs are intended to be chunked and embedded for a RAG database. Keep these properties to maximize retrieval quality:

- **Semantic boundaries** — each heading section is a potential chunk
- **Context locality** — each file explains enough context that a single chunk is useful
- **Keywords matter** — include terms a dev might search for (component names, table names, env vars)
- **No long code blocks without explanation** — always wrap code with prose
- **Tables beat lists** for structured data
