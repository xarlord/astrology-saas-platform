---
description: Audit a code domain for refactoring issues. Usage: /refactor-audit [domain]
---

# Refactor Audit

Analyze a code domain for architectural issues, dead code, inconsistencies, and improvement opportunities.

## Input
The user provides a domain path as argument (e.g., `backend/src/controllers`, `frontend/src/services`).

## Steps

1. **Launch refactor-researcher agent** with:
   - Target domain from argument
   - Preloaded `refactoring-patterns` skill
   - Ask it to produce a structured report

2. **Save report** to `reports/refactor/<domain-slug>.md` with sections:
   - Summary (overall health score: GREEN/YELLOW/RED)
   - HIGH priority issues (must fix)
   - MED priority issues (should fix)
   - LOW priority issues (nice to have)
   - Per-item: file path, issue description, recommended fix, estimated effort

3. **Present summary** to user with top 5 most impactful items

4. **Ask user** if they want to proceed with `/refactor-execute reports/refactor/<domain-slug>.md`