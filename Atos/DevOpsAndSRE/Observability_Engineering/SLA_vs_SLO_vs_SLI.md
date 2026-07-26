**SLI** measures user experience. **SLO** is the reliability target for that measure. **SLA** is the business contract if you miss it.

### SLI — Service Level Indicator
The **metric** — what you actually measure from the user’s point of view.

Examples:
- Availability: `% of successful requests`
- Latency: `% of requests faster than 300ms`
- Correctness: `% of results that match expected output`

Not “CPU at 80%” — that may matter operationally, but it’s usually not the SLI unless it directly reflects user experience.

### SLO — Service Level Objective
The **target** for an SLI over a time window.

Examples:
- `99.9%` of requests succeed over 30 days  
- `99%` of homepage loads complete in under 200ms  

This is an **internal engineering goal**. Missing an SLO should change priorities (slow releases, fix reliability) via the **error budget** — the allowed failure room (`100% − SLO`).

### SLA — Service Level Agreement
The **external contract** with customers (or between teams), usually with consequences.

Examples:
- Credits if availability drops below `99.5%`
- Penalties for sustained outages  

SLAs are typically **looser** than SLOs so you have buffer before contractual failure.

### How they stack

```
SLI  →  what you measure
SLO  →  what you aim for
SLA  →  what you promise (with consequences)
```

| | **SLI** | **SLO** | **SLA** |
|---|---|---|---|
| Nature | Measurement | Target | Contract |
| Audience | Engineers | Eng + product | Legal / customer |
| Example | 99.95% success rate this month | Aim for ≥ 99.9% | Promise ≥ 99.5% or issue credits |
| On miss | Data point | Change engineering priority | Business consequence |

**Rule of thumb:** pick user-facing SLIs → set ambitious but achievable SLOs → only put a stricter-buffered version into an SLA.