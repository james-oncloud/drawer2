# Question

How to bridge the gap between Business Analysis and code implementation?

## Answer

The gap usually shows up as **lost intent**, **ambiguous rules**, **late surprises**, or **tests that don’t match what the business meant**. Bridging it is about **shared artifacts**, **timing**, and **shared accountability**—not heavier documents in isolation.

### 1. One shared language: examples over abstractions

- Turn “the system should handle discounts correctly” into **concrete examples**: inputs, users, states, expected outputs, and exceptions.
- Use **Given / When / Then** (or tables of cases) for critical flows so BA, dev, and QA align on the same scenarios—whether or not you automate them literally.

### 2. Bring engineering into analysis *before* coding

- **Refinement / three-amigos** (BA + dev + QA on riskiest stories): clarify rules, data, edge cases, and acceptance criteria while the story is still cheap to change.
- **Short technical spikes** when feasibility is unknown: time-boxed, with BA available to reinterpret business intent if tech constraints bite.

### 3. Build in **thin vertical slices**

- Prefer increments that **deliver a recognizable business outcome** end-to-end (even small) so feedback validates “does it do what we meant?” early.
- Avoid long stretches where BA only sees integration at the end.

### 4. Tie requirements to **boundaries in the code**

- Name domains, APIs, and modules in **business-meaningful** terms where possible; document which **business rules** live in which bounded area (even a short mapping in a wiki or ticket).
- For complex rules, a **decision table** or **rule list** linked to the epic/story reduces “telephone game” between doc and implementation.

### 5. **Living** confirmation, not static handoffs

- **Demos** to stakeholders—and crucially, **BA stays in the loop** to catch subtle misunderstandings before hardening.
- Update written acceptance when reality changes; **single source** (ticket + linked spec) beats conflicting email threads.

### 6. Tests as the contract engineers and BA can read together

- Agree what **must** be covered by automated checks vs. exploratory testing.
- Critical business rules should map to **visible test cases** or checklist items stakeholders trust—not only buried in code.

### 7. Lightweight traceability where it pays off

- For regulated or high-risk features: link **objective → requirement → story → test**.
- For low-risk UI tweaks: a clear story + acceptance may be enough—match rigor to risk.

### 8. Escalate ambiguity deliberately

- When BA and dev disagree, **time-box** a decision: named decision owner, documented outcome (mini **ADR** or decision log entry), not endless reinterpretation.

### 9. What tech leads can do specifically

- Normalize **refinement quality** (definition of ready) so stories aren’t pulled without testable criteria.
- Encourage **pairing** BA with a dev on nasty domain logic for a few hours.
- Protect **feedback loops**: demos, trunk-based or frequent integration so analysis doesn’t assume a big-bang integration phase.

### Anti-patterns that widen the gap

- **Spec dump** then silence until UAT.
- **Tickets that only have a title** and tribal knowledge elsewhere.
- **Business language in Jira, different language in code** with no glossary or mapping.
- **BA excluded from technical trade-offs** that change what’s possible for rules and SLAs.

**Summary:** Bridge with **examples everyone agrees on**, **early and recurring collaboration**, **vertical slices for real feedback**, and **traceability suited to risk**—so implementation stays accountable to business intent without guessing.

## Meta

- Asked: 2026-04-03
