**Monitoring** answers questions you already know to ask. **Observability** lets you ask new questions when something unexpected happens.

### Simple analogy: a car

**Monitoring** is the dashboard warning lights.

- Oil pressure low → light comes on
- Engine temperature high → light comes on
- You already decided what “bad” looks like, and you watch for those known problems

**Observability** is being able to plug in a diagnostic tool and ask *any* question about what the car is doing.

- “Why is it stalling only when cold, in reverse, after 10 minutes?”
- You didn’t need a dedicated warning light for that exact failure — you can investigate from rich data

The warning light tells you **something is wrong**. Diagnostics help you discover **why**.

You want both: lights to alert you quickly, and diagnostics to explain novel problems.

---

### Monitoring
You define what “healthy” looks like in advance, then watch for known failure modes.

- Predefined metrics, dashboards, thresholds, alerts  
- Good for: CPU high, error rate above SLO, disk full, latency p99 spike  
- Workflow: alert → check known dashboards → apply known playbook  

It works well for **known unknowns** — you don’t know *when* they’ll happen, but you know *what* to look for.

### Observability
You instrument the system so you can investigate novel problems you didn’t anticipate.

- High-cardinality, high-dimensional telemetry (often structured events / traces)  
- Good for: “Why are only EU users on iOS failing after deploy X?”  
- Workflow: start from a symptom → slice and filter data → form hypotheses → find the cause  

It targets **unknown unknowns** — failures you didn’t know to dashboard or alert on.

### Quick contrast

| | **Monitoring** | **Observability** |
|---|---|---|
| Core question | Is something wrong? | Why is it wrong? |
| Questions | Predetermined | Ad hoc / exploratory |
| Typical data | Aggregated metrics, health checks | Events, traces, rich context |
| Best for | Detection & alerting | Debugging & understanding |
| Failure modes | Known patterns | Novel / combinatorial issues |
| Car analogy | Dashboard warning lights | Full diagnostics / investigation |

### How they fit together
They complement each other: monitoring detects and pages you; observability helps you explain and fix. Monitoring alone breaks down as systems get more distributed — too many possible interactions to pre-model on dashboards.
