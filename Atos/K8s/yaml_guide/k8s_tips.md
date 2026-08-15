# 5 Kubernetes Tips (Summary)

Source: [5 Kubernetes Tips That Made Me Smarter than 85% of People](https://medium.com/@f8010/5-kubernetes-tips-that-made-me-smarter-than-85-of-people-ced0164116c7) — F8010 (May 2026)

**Theme:** Kubernetes punishes ambiguity. Most pain comes from unclear habits (namespaces, limits, probes, YAML process, logs), not from missing “advanced” YAML knowledge. Think in **systems**, not just commands.

---

## Tip 1: Namespaces Are Free — Use Them

Don’t dump everything into `default`. Use namespaces as folders for teams, environments, and apps.

| Namespace | Typical contents |
|-----------|------------------|
| `production` | Live customer workloads |
| `staging` | Pre-release testing |
| `dev` | Active development |
| `monitoring` | Logs, metrics, observability |
| `infra` | Shared platform services |

**Why:** safer deletes, clearer RBAC, easier cost attribution, faster debugging (“where do I look?”).

---

## Tip 2: Resource Limits Are Not Optional

Skipping `requests`/`limits` invites the **noisy neighbor** problem: one leaky Pod starves others → failed probes → cascading restarts.

| Field | Role |
|-------|------|
| **requests** | Minimum guaranteed; used for **scheduling** |
| **limits** | Hard **ceiling** Kubernetes enforces |

Start with a rough estimate → watch real usage → tune. Goal on day one is a **ceiling**, not perfection.

---

## Tip 3: Liveness ≠ Readiness

Both are health checks; they trigger different actions.

| Probe | Question | If it fails |
|-------|----------|-------------|
| **Liveness** | Is the process still alive / not wedged? | Restart the **container** |
| **Readiness** | Can it take traffic? | Remove from Service endpoints; **do not** kill it |

**Classic failure:** app needs 30s to warm up; an aggressive liveness probe kills it during startup → CrashLoopBackOff.

**Rule of thumb:** readiness gates traffic until ready; liveness only for true hangs/deadlocks.

> Note from article comments: failure of a liveness probe restarts the **container**, not necessarily “the Pod” as a whole.

---

## Tip 4: Treat YAML Like Production Code

Manifests *are* infrastructure. Prefer:

1. Store manifests in **Git**
2. Require **PRs** / review
3. Test in **staging** before prod
4. **Tag** releases for rollback

That mindset is **GitOps** (Flux/Argo CD automate it). Even without the tools, Git + review + rollback path prevents “what changed?” incidents.

---

## Tip 5: Learn Logs Before You’re on Fire

Read logs when things are **healthy** so you recognize normal vs scary under pressure.

| Symptom | Usual meaning |
|---------|----------------|
| **CrashLoopBackOff** | Container keeps crashing — read logs from the last run first |
| **Pending** | Scheduler blocked — resources, node selector/taints, volume attach |
| **OOMKilled** | Hit memory limit / node OOM — fix limits or leaks (not a “K8s bug”) |
| **ImagePullBackOff** | Bad image name/tag or registry credentials |

Knowing these signatures turns hours of panic into minutes of diagnosis.

---

## Self-check

- [ ] Workloads organized by namespace (not all in `default`)
- [ ] Requests and limits on every Pod
- [ ] Liveness vs readiness configured on purpose
- [ ] YAML in Git with review / rollback
- [ ] Team recognizes the four error states above

---

## Related guides in this folder

- [deployment-anatomy.md](deployment-anatomy.md) — probes & resources on Deployments
- [k8s-architecture.md](k8s-architecture.md) — why scheduling and limits matter
- [deployment-strategies.md](deployment-strategies.md) — safe rollouts / rollback
