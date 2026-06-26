---
name: Frontend Audit
description: Generates a design and code quality report for any frontend page, component, or module.
triggers:
  - "frontend audit"
---

# Frontend Audit

> References:
> - `GEMINI.md`
> - `.agents/PROJECT_REPORT.md`
> - `.agents/skills/design-system/SKILL.md`
> - `.agents/skills/frontend-quality/SKILL.md`

## Trigger
Triggered by "frontend audit".
If the page name is not given, ask the user: "Which page or module should I analyze?"

## Workflow Steps

### 1. Scan Files
Identify the target page and its dependent components (hooks, panels, etc.). Check for compliance with:
- `design-system` standards (layout, typography, tokens).
- `frontend-quality` standards (React hooks, state management).

### 2. Generate the Report
Save the report as `.agents/[PAGE_NAME]_AUDIT.md`:

- General Structure
- Component Map (hierarchy — max 3 levels)
- Detected Design & Code Issues (Issue, Where, Impact, Proposed Solution)
- Color & Token Inconsistencies
- Spacing Issues
- CTA & Button Analysis
- Mobile Compatibility
- Priority Order

### 3. Request Approval for Fixes
After generating the report, ask: "The report is ready. Would you like me to apply the fixes?"
If approved, apply minimal diffs.

## Output Format
- Document issues in a table with concrete file and line references.
- Provide a single-line solution proposal for each issue.
- Prioritize by critical (rule violation) → medium (inconsistency) → low (cosmetic).
- End by asking for approval. Do not make unapproved changes.
