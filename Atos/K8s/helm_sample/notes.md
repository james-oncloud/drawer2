

Kubernetes

User 

| Control Plane        | Worker Plane      |
| -------------------- | ----------------- |
| - api-server:        | Node              |
| - scheduler          | - kubelet         |
| - Control Manager    | - kube-proxy      |
|                      | - Pod(Containers) |


- api-server: process user commands 
- scheduler: allocate workloads to Nodes
- Control Manager: ensures actual state matches desired state

- Node: machine -> contains many Pods
- Pod: contains many Containers

- kubelet: the primary node agent in Kubernetes. It runs on every worker node and is the component that actually makes pods happen on that machine.

- kube-proxy: kube-proxy is the networking component that runs on every node and makes Kubernetes Services work — so traffic to a stable Service IP/name gets forwarded to the right Pods, even as pods come and go.






