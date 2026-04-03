# Question

How should Business Analysis be conducted on a software implementation and delivery project?

## Answer

Business Analysis (BA) connects **business intent** to **buildable, testable outcomes**. On an implementation and delivery project it should be **continuous**, not a one-time upfront phase—especially in iterative delivery—while still producing enough **clarity and traceability** for decisions, build, and compliance.

### 1. Frame the problem and outcomes

- **Business goals and success measures** — What must improve (revenue, cost, risk, CX, regulatory) and how we will know it worked (KPIs, SLOs, acceptance themes).
- **Scope and constraints** — In/out of scope, fixed deadlines, budget, regulatory or contractual boundaries, “must not change” systems.
- **Stakeholder map** — Decision makers vs. subject-matter experts vs. affected users; who can resolve conflicts.

### 2. Discover and model the current state (when relevant)

- **As-is processes and systems** — Where work happens today, handoffs, data sources, pain points, and failure modes.
- **Data and integrations** — What must flow in/out, latency needs, authoritative sources, legacy constraints.

This grounds “why change” and reduces surprise during build.

### 3. Elicit and structure requirements

- **Functional requirements** — Behavior the solution must support, prioritized (MoSCoW, WSJF, or product-driven ordering).
- **Non-functional requirements** — Performance, availability, security, privacy, audit, accessibility, operability, support hours.
- **Business rules** — Policies, calculations, eligibility, exceptions; captured so they can be **tested**, not only discussed.
- **Scenarios and acceptance criteria** — Given / when / then (or similar) for critical paths; edge cases and negative paths explicitly.

Prefer **examples and prototypes** (wireframes, API sketches, walking through a story) where ambiguity is high.

### 4. Align analysis with delivery rhythm

- **Just-enough, just-in-time detail** — Deepen requirements as work nears; avoid over-specifying distant work that will change.
- **Backlog-ready artifacts** — Stories or work items include **clear acceptance criteria**, dependencies, and links to rule references—not vague titles.
- **Refinement sessions** — BA facilitates Q&A with engineering so estimates and risks surface early.
- **Traceability** — Link objectives → requirements → stories → tests (lightweight tools: tags, links in ADR/issue trackers), especially for audit or regulated domains.

### 5. Solution collaboration (not “throw over the wall”)

- **Joint design** — BA stays involved as architecture and UX choices affect feasibility and rules.
- **Impact analysis** — When scope shifts, clarify trade-offs (cost, time, risk) and **update** written expectations; avoid silent drift.

### 6. Validation and sign-off that fit your context

- **Reviews with stakeholders** — Walkthroughs of critical flows; demos of increments where possible.
- **Formal sign-off** only where the organization or regulation requires it; otherwise favor **working software + documented decisions** as evidence.

### 7. Change and issue management

- **Controlled change path** — How new requests are captured, assessed, prioritized, and reflected in scope documents or backlogs.
- **Decision log** — Record key “why we chose X” calls so future changes don’t reopen settled issues without cause.

### 8. Risks BA should surface early

- **Ambiguous ownership** of data or decisions across teams.
- **Implicit requirements** (“everyone knows”) that are never written.
- **Non-functional gaps** (security, reporting, ops) treated as afterthoughts.
- **Over-customization** vs. standard product behavior where a package or platform is deployed.

### Practical success criteria for BA on the project

- Engineering spends **minimal time** re-negotiating intent mid-sprint because outcomes were unclear.
- Testers can derive cases from **written acceptance criteria and rules**.
- Stakeholders recognize **what shipped** matches agreed priorities—or **documented scope changes** explain differences.

In short: **clarify outcomes and rules, model reality, co-create detail with delivery right before build, keep traceability and change visible**—so implementation stays aligned with business value and audit needs.

## Meta

- Asked: 2026-04-03
