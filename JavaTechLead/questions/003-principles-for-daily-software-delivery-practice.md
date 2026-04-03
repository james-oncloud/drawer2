# Question

List principles the team should care about in daily practice of software delivery—like share knowledge, testing and quality, be vocal, and so on.

## Answer — principles for daily practice

### Knowledge and collaboration

- **Share knowledge deliberately** — Pair, document decisions, walk through tricky areas; avoid single points of failure (“only Alex knows that service”).
- **Be vocal early** — Raise risks, blockers, and unknowns in standups, chats, or design discussions; silence often costs more than a rough question.
- **Assume good intent, be specific** — Critique work and ideas, not people; point to evidence (logs, metrics, code) when disagreeing.
- **Review constructively** — PR feedback teaches the whole team; aim for clarity and teachable moments, not gatekeeping.

### Quality and testing

- **Left-shift quality** — Clarify acceptance criteria and edge cases before coding deep; test design is part of design.
- **Automate the boring checks** — Tests, linters, type checks, security scans in CI; don’t rely on memory for regression safety.
- **Own production behavior** — Design for observability, failure modes, and rollbacks; monitor what you ship.
- **Refactor in small steps** — Prefer incremental improvements tied to features or fixes over big-bang rewrites.

### Delivery flow

- **Small, incremental changes** — Smaller PRs and releases reduce risk and speed up feedback.
- **Finish vertical slices** — Prefer end-to-end slices of value over layers blocked in parallel for long periods.
- **Definition of done is shared** — Agree what “done” means (tests, docs, metrics, feature flags, etc.) and hold to it lightly but consistently.
- **WIP limits** — Too many half-done items slow everyone; swarm blockers when it helps.

### Safety and responsibility

- **Blameless learning** — After incidents, focus on system and process fixes, not individual fault.
- **Secure and compliant by habit** — Secrets, dependencies, auth patterns—treat as everyday constraints, not afterthoughts.
- **Backpressure is OK** — Say no or negotiate scope when speed would sacrifice safety or burn people out.

### Communication with stakeholders

- **Transparent status** — Honest progress (including slips) builds trust; surprises late are expensive.
- **Speak in outcomes and trade-offs** — Tie technical choices to user impact, cost, and time when talking to product or leadership.

### Culture and sustainability

- **Sustainable pace** — Ongoing overtime erodes judgment and quality; protect focus time for deep work.
- **Inclusive participation** — Invite quieter voices; decisions shouldn’t only reflect the loudest person in the room.
- **Continuous improvement** — Retros that produce one or two real experiments, not only venting.

These are habits more than slogans: the goal is **faster, safer learning loops** with **shared ownership** and **humane pacing**.

## Meta

- Asked: 2026-04-03
