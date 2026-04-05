# ADR Template

## Status

Accepted

## Context

We need a consistent format for recording architectural decisions. Each ADR should be self-contained, concise, and easy to revisit when revising past decisions.

## Decision

Use the following structure for every Architecture Decision Record:

```markdown
# [ADR-NNNN] Title

## Status
[Proposed | Accepted | Deprecated | Superseded by ADR-NNNN]

## Context
What is the issue that we're seeing that is motivating this decision or change?

## Decision
What is the change that we're proposing and/or doing?

## Consequences
What becomes easier or more difficult to do because of this change?
```

Number ADRs sequentially starting from 001. Keep each record under 40 lines. Update the status field when a decision is revisited.

## Consequences

- Decisions are documented and traceable, improving onboarding and review.
- ADRs add a small maintenance burden -- they must be created for meaningful decisions and updated when superseded.

*Last updated: 2026-04-05*
