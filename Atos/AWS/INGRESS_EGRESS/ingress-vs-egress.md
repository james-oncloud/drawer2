# Ingress vs Egress

**Ingress** = traffic **coming in**.  
**Egress** = traffic **going out**.

Direction is always relative to the resource (instance, ENI, subnet, etc.).

---

## Quick comparison

| | Ingress | Egress |
|---|---------|--------|
| **Also called** | Inbound | Outbound |
| **Direction** | Into the resource | Out of the resource |
| **Question it answers** | Who can reach me? | Where can I reach? |
| **Example** | User → web server on port 443 | Server → database on port 5432 |
| **Security Group rules** | Inbound rules | Outbound rules |
| **NACL rules** | Inbound rules | Outbound rules |
| **Source / destination** | Rule uses a **source** | Rule uses a **destination** |

---

## Simple mental model

```
Internet / Client          Your EC2 / ENI          Other service
        |                        |                        |
        |------ ingress -------->|                        |
        |                        |------- egress -------->|
        |<----- response --------|                        |
```

- Request from a client to your server = **ingress** on the server.
- Request from your server to S3, an API, or a DB = **egress** from the server.
- Because Security Groups are **stateful**, allowed ingress automatically permits the return traffic (and vice versa). You do not need a matching reverse rule in the SG.

---

## In Security Groups

| Aspect | Ingress (inbound) | Egress (outbound) |
|--------|-------------------|-------------------|
| Controls | Traffic allowed **to** the ENI | Traffic allowed **from** the ENI |
| Typical rule | Allow TCP 443 from `0.0.0.0/0` or a CIDR/SG | Allow TCP 443 to `0.0.0.0/0` (internet), or to another SG |
| Default custom SG | No inbound (deny all in) | Allow all outbound |
| Default VPC SG | Allow all from itself | Allow all outbound |
| Stateful? | Yes — reply is auto-allowed | Yes — reply is auto-allowed |

**Example**

- Web SG ingress: TCP 80/443 from the internet.
- Web SG egress: TCP 5432 to the DB security group.
- DB SG ingress: TCP 5432 from the Web security group.
- DB SG egress: often restricted (or left open, depending on policy).

---

## In Network ACLs (NACLs)

NACLs also have ingress and egress rules, but they are **stateless**:

| Aspect | Ingress | Egress |
|--------|---------|--------|
| Scope | Traffic into the **subnet** | Traffic out of the **subnet** |
| Stateful? | No | No |
| Implication | Allowing inbound does **not** auto-allow the response | You must allow return traffic explicitly on the other direction |

So for NACLs, an allowed ingress request usually needs a matching egress rule for the response (and often ephemeral ports).

---

## Everyday examples

| Scenario | Ingress on resource | Egress on resource |
|----------|---------------------|--------------------|
| Browser hits ALB | Client → ALB :443 | ALB → targets :80 |
| App calls RDS | App → RDS :5432 (ingress on RDS) | App → RDS (egress on app) |
| Instance downloads package | Package host → instance (ingress if push) | Instance → yum/apt/S3 (egress) |
| SSH to bastion | Admin → bastion :22 | Bastion → private instances :22 |

---

## Common interview / ops points

1. **Ingress locks down who can talk to you**; **egress locks down where you can talk**.
2. Many breaches and data exfiltration paths are **egress** problems (open outbound to the internet).
3. Security Groups: stateful → one direction’s allow covers the return path.
4. NACLs: stateless → both directions must be considered.
5. Least privilege usually means:
   - tight ingress (only needed ports/sources),
   - and increasingly tight egress (not “allow all out” forever).

---

## One-line summary

**Ingress = inbound (into). Egress = outbound (out of).** Same idea across Security Groups, NACLs, firewalls, and Kubernetes — only the control point changes.
