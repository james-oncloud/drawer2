# Prompt: Incident Postmortem Draft

```
Draft a blameless postmortem from the following incident data.

Timeline:
{{PASTE_TIMELINE}}

Logs/snippets:
{{PASTE_LOGS}}

Metrics/alerts:
{{PASTE_ALERTS}}

Output sections:
1. Summary (2-3 sentences)
2. Impact (users, duration, SLO breach)
3. Timeline (UTC)
4. Root cause (5 Whys)
5. Contributing factors
6. What went well
7. Action items (owner, due date, type: prevent/detect/mitigate)
8. Lessons learned

Tone: blameless, factual. Flag gaps where data is missing.
```
