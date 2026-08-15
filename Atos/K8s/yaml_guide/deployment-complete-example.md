# Complete Deployment YAML Example

A single, heavily annotated `Deployment` that shows most fields you will see in production manifests. Not every field is required — copy only what you need.

> Apply note: some referenced objects (`ServiceAccount`, `ConfigMap`, `Secret`, `PVC`, `PriorityClass`) must exist first, or strip those references.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-complete
  namespace: demo
  labels:
    app: web
    app.kubernetes.io/name: web
    app.kubernetes.io/instance: web-complete
    app.kubernetes.io/version: "1.2.3"
    app.kubernetes.io/component: frontend
    app.kubernetes.io/part-of: demo-platform
    app.kubernetes.io/managed-by: kubectl
  annotations:
    description: "Reference Deployment with a wide field set"
    kubernetes.io/change-cause: "Initial complete example"

spec:
  # --- Desired replica count (HPA may overwrite this) ---
  replicas: 3

  # --- How the Deployment finds Pods it owns ---
  selector:
    matchLabels:
      app: web
      tier: frontend
    # Optional richer matching (AND with matchLabels):
    # matchExpressions:
    #   - key: environment
    #     operator: In
    #     values: ["prod", "staging"]

  # --- Rollout behavior ---
  strategy:
    type: RollingUpdate          # or Recreate
    rollingUpdate:
      maxUnavailable: 1          # int or %
      maxSurge: 1                # int or %

  minReadySeconds: 10            # Pod must stay ready this long to count as available
  revisionHistoryLimit: 5        # Kept ReplicaSets for rollbacks
  progressDeadlineSeconds: 600   # Mark progress as failed after this
  paused: false                  # true = freeze rollouts

  # --- Pod blueprint ---
  template:
    metadata:
      labels:
        app: web                 # MUST match selector
        tier: frontend
        version: "1.2.3"
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
        prometheus.io/path: "/metrics"

    spec:
      # --- Pod-level identity & scheduling ---
      serviceAccountName: web-sa
      automountServiceAccountToken: true
      restartPolicy: Always      # Deployments require Always
      terminationGracePeriodSeconds: 30
      dnsPolicy: ClusterFirst
      # hostNetwork: false
      # hostPID: false
      # hostIPC: false
      # shareProcessNamespace: false
      # enableServiceLinks: true
      # subdomain: web
      # hostname: web-0
      # setHostnameAsFQDN: false
      # runtimeClassName: gvisor
      priorityClassName: high-priority
      schedulerName: default-scheduler
      # topologySpreadConstraints, affinity, tolerations, nodeSelector below

      activeDeadlineSeconds: null  # not typical on Deployments; more for Jobs

      # --- Node placement ---
      nodeSelector:
        kubernetes.io/os: linux
        # disktype: ssd

      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
              - matchExpressions:
                  - key: topology.kubernetes.io/zone
                    operator: In
                    values: ["eu-west-1a", "eu-west-1b"]
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 80
              preference:
                matchExpressions:
                  - key: node.kubernetes.io/instance-type
                    operator: In
                    values: ["m5.large", "m5.xlarge"]
        podAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 50
              podAffinityTerm:
                labelSelector:
                  matchLabels:
                    app: cache
                topologyKey: kubernetes.io/hostname
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            - labelSelector:
                matchLabels:
                  app: web
              topologyKey: kubernetes.io/hostname   # spread web Pods across nodes

      tolerations:
        - key: "dedicated"
          operator: "Equal"
          value: "frontend"
          effect: "NoSchedule"
        - key: "node.kubernetes.io/unreachable"
          operator: "Exists"
          effect: "NoExecute"
          tolerationSeconds: 30

      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: topology.kubernetes.io/zone
          whenUnsatisfiable: DoNotSchedule
          labelSelector:
            matchLabels:
              app: web

      # --- Security (Pod-level defaults; containers can override) ---
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        runAsGroup: 3000
        fsGroup: 2000
        fsGroupChangePolicy: OnRootMismatch
        seccompProfile:
          type: RuntimeDefault
        supplementalGroups: [4000]
        # sysctls:
        #   - name: net.core.somaxconn
        #     value: "1024"

      # --- Image pulls & DNS ---
      imagePullSecrets:
        - name: ghcr-pull-secret

      dnsConfig:
        options:
          - name: ndots
            value: "2"
          - name: edns0
        # nameservers: ["1.1.1.1"]
        # searches: ["demo.svc.cluster.local"]

      # --- Init containers (run to completion before app starts) ---
      initContainers:
        - name: init-config
          image: busybox:1.36
          imagePullPolicy: IfNotPresent
          command: ["sh", "-c"]
          args:
            - |
              echo "Preparing shared config..."
              cp /config-src/app.properties /shared/app.properties
          volumeMounts:
            - name: config-volume
              mountPath: /config-src
              readOnly: true
            - name: shared-data
              mountPath: /shared
          resources:
            requests:
              cpu: 50m
              memory: 32Mi
            limits:
              cpu: 100m
              memory: 64Mi
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop: ["ALL"]

      # --- Ephemeral / sidecar-style containers (K8s 1.28+ sidecar pattern) ---
      # Uncomment if your cluster supports restartPolicy on initContainers:
      # initContainers:
      #   - name: log-shipper
      #     image: fluent/fluent-bit:2.2
      #     restartPolicy: Always
      #     ...

      containers:
        # ===== Main application container =====
        - name: web
          image: ghcr.io/example/web:1.2.3
          imagePullPolicy: IfNotPresent   # Always | Never | IfNotPresent
          workingDir: /app
          command: ["/app/server"]        # overrides image ENTRYPOINT
          args: ["--config", "/etc/web/app.properties"]

          ports:
            - name: http
              containerPort: 8080
              protocol: TCP
            - name: metrics
              containerPort: 9090
              protocol: TCP
            # hostPort: 8080             # avoid unless necessary

          env:
            - name: APP_ENV
              value: production
            - name: POD_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: POD_NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
            - name: POD_IP
              valueFrom:
                fieldRef:
                  fieldPath: status.podIP
            - name: NODE_NAME
              valueFrom:
                fieldRef:
                  fieldPath: spec.nodeName
            - name: CPU_REQUEST
              valueFrom:
                resourceFieldRef:
                  containerName: web
                  resource: requests.cpu
                  divisor: "1m"
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: web-secrets
                  key: db-password
                  optional: false
            - name: FEATURE_FLAG
              valueFrom:
                configMapKeyRef:
                  name: web-config
                  key: feature.flag
                  optional: true

          envFrom:
            - configMapRef:
                name: web-config
                optional: false
            - secretRef:
                name: web-secrets
                optional: false
            # - prefix: MYAPP_
            #   configMapRef:
            #     name: web-config

          resources:
            requests:
              cpu: 250m
              memory: 256Mi
              ephemeral-storage: 1Gi
            limits:
              cpu: "1"
              memory: 512Mi
              ephemeral-storage: 2Gi

          startupProbe:                  # slow start; disables other probes until success
            httpGet:
              path: /startup
              port: http
              httpHeaders:
                - name: X-Probe
                  value: startup
            failureThreshold: 30
            periodSeconds: 5

          readinessProbe:                # ready for Service traffic?
            httpGet:
              path: /ready
              port: http
              scheme: HTTP
            initialDelaySeconds: 5
            periodSeconds: 10
            timeoutSeconds: 2
            successThreshold: 1
            failureThreshold: 3

          livenessProbe:                 # restart if unhealthy
            httpGet:
              path: /healthz
              port: http
            initialDelaySeconds: 15
            periodSeconds: 20
            timeoutSeconds: 3
            failureThreshold: 3
            # Alternatives:
            # tcpSocket:
            #   port: 8080
            # exec:
            #   command: ["/bin/grpc_health_probe", "-addr=:8080"]
            # grpc:
            #   port: 8080

          lifecycle:
            postStart:
              exec:
                command: ["/bin/sh", "-c", "echo started > /tmp/started"]
            preStop:
              exec:
                command: ["/bin/sh", "-c", "sleep 5"]   # drain time before SIGTERM

          volumeMounts:
            - name: config-volume
              mountPath: /etc/web
              readOnly: true
            - name: secret-volume
              mountPath: /etc/web-secrets
              readOnly: true
            - name: shared-data
              mountPath: /var/shared
            - name: app-data
              mountPath: /var/lib/web
            - name: tmp
              mountPath: /tmp
            - name: cache
              mountPath: /var/cache/web
            # Subpath example:
            # - name: config-volume
            #   mountPath: /etc/web/app.properties
            #   subPath: app.properties
            #   readOnly: true

          # volumeDevices:               # block devices (rare)
          #   - name: raw-disk
          #     devicePath: /dev/xvda

          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            runAsNonRoot: true
            runAsUser: 1000
            capabilities:
              drop: ["ALL"]
              # add: ["NET_BIND_SERVICE"]
            seccompProfile:
              type: RuntimeDefault
            # seLinuxOptions:
            #   level: "s0:c123,c456"
            # procMount: Default
            # windowsOptions: {}

          # stdin: false
          # stdinOnce: false
          # tty: false
          # terminationMessagePath: /dev/termination-log
          # terminationMessagePolicy: File   # or FallbackToLogsOnError

        # ===== Sidecar (e.g. proxy or log agent) =====
        - name: sidecar-proxy
          image: public.ecr.aws/aws-observability/aws-appmesh-envoy:v1.29.0.0-prod
          imagePullPolicy: IfNotPresent
          ports:
            - name: envoy-admin
              containerPort: 9901
              protocol: TCP
          resources:
            requests:
              cpu: 50m
              memory: 64Mi
            limits:
              cpu: 200m
              memory: 128Mi
          readinessProbe:
            tcpSocket:
              port: 9901
            periodSeconds: 10
          livenessProbe:
            tcpSocket:
              port: 9901
            periodSeconds: 20
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            runAsNonRoot: true
            runAsUser: 1337
            capabilities:
              drop: ["ALL"]
          volumeMounts:
            - name: tmp
              mountPath: /tmp

      # --- Volumes available to containers ---
      volumes:
        - name: config-volume
          configMap:
            name: web-config
            defaultMode: 0444
            optional: false
            items:
              - key: app.properties
                path: app.properties
                mode: 0444

        - name: secret-volume
          secret:
            secretName: web-secrets
            defaultMode: 0400
            optional: false
            # items:
            #   - key: tls.crt
            #     path: tls.crt

        - name: shared-data
          emptyDir:
            sizeLimit: 256Mi
            # medium: Memory          # tmpfs

        - name: tmp
          emptyDir:
            medium: Memory
            sizeLimit: 64Mi

        - name: cache
          emptyDir: {}

        - name: app-data
          persistentVolumeClaim:
            claimName: web-pvc
            # readOnly: false

        # - name: projected-vol
        #   projected:
        #     sources:
        #       - configMap:
        #           name: web-config
        #       - secret:
        #           name: web-secrets
        #       - serviceAccountToken:
        #           path: token
        #           expirationSeconds: 3600

        # - name: csi-vol
        #   csi:
        #     driver: secrets-store.csi.k8s.io
        #     readOnly: true
        #     volumeAttributes:
        #       secretProviderClass: web-aws-secrets

        # - name: host-path-vol          # usually avoided in prod
        #   hostPath:
        #     path: /var/log
        #     type: Directory

        # - name: nfs-vol
        #   nfs:
        #     server: nfs.example.com
        #     path: /exports/web

      # --- Preemption / other ---
      # preemptionPolicy: PreemptLowerPriority
      # overhead: {}                     # RuntimeClass overhead (server-set often)

      # --- Host aliases (inject /etc/hosts entries) ---
      hostAliases:
        - ip: "10.0.0.10"
          hostnames:
            - "legacy-db.internal"

      # --- Additional options ---
      # securityContext.sysctls: ...
      # ephemeralContainers: []         # added via kubectl debug, not in apply YAML
```

---

## Companion objects this example expects

Create these (or remove the references) before applying:

| Object | Names used above |
|--------|------------------|
| `Namespace` | `demo` |
| `ServiceAccount` | `web-sa` |
| `ConfigMap` | `web-config` (keys include `app.properties`, `feature.flag`) |
| `Secret` | `web-secrets` (key `db-password`; optional image pull secret `ghcr-pull-secret`) |
| `PersistentVolumeClaim` | `web-pvc` |
| `PriorityClass` | `high-priority` |

---

## What this file deliberately includes

| Area | Fields shown |
|------|----------------|
| Metadata | Recommended labels, change-cause annotation |
| Rollout | `strategy`, `minReadySeconds`, history & progress deadlines |
| Placement | `nodeSelector`, affinity / anti-affinity, tolerations, topology spread |
| Security | Pod + container `securityContext`, dropped capabilities, non-root |
| Containers | Main + sidecar, init container, command/args, ports |
| Config | `env`, `envFrom`, downward API, ConfigMap/Secret volumes |
| Health | `startupProbe`, `readinessProbe`, `livenessProbe` |
| Lifecycle | `postStart`, `preStop` |
| Storage | ConfigMap, Secret, emptyDir (disk + memory), PVC |
| Other | DNS options, imagePullSecrets, hostAliases, priorityClass |

---

## What is usually *not* in a Deployment file

- `status` (controller-managed)
- `ephemeralContainers` (added by `kubectl debug`)
- Owner references / UIDs / `resourceVersion`
- Every obscure PodSpec field (`os`, Windows options, `resourceClaims`, etc.) — add only when your cluster and workload need them

---

## Apply / inspect

```bash
kubectl apply -f deployment-complete.example.yaml   # if you extract the YAML block
kubectl get deploy,rs,pods -n demo -l app=web
kubectl rollout status deployment/web-complete -n demo
kubectl explain deployment --recursive
```

See also: [deployment-anatomy.md](deployment-anatomy.md) · [k8s-kinds.md](k8s-kinds.md)
