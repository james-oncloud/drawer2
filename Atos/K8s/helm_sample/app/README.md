# hello-app

Spring Boot app: `GET /hello` returns time + appId.

## Quick start (Helm + LoadBalancer)

```bash
cd Atos/K8s
./shell/fireup.sh
curl http://localhost:8080/hello
```

Traffic goes through the Kubernetes Service — load-balanced across pods. When one pod dies, others keep serving.

## Local (Docker only)

```bash
cd Atos/K8s/app
DOCKER_BUILDKIT=1 docker build -t hello-app:latest .
docker run -p 8080:8080 hello-app:latest
curl http://localhost:8080/hello
```

## Kubernetes (kubectl)

```bash
DOCKER_BUILDKIT=1 docker build -t hello-app:latest .
kubectl apply -f service-headless.yaml -f statefulset.yaml -f service.yaml
curl http://localhost:8080/hello
```

## Helm (manual)

```bash
DOCKER_BUILDKIT=1 docker build -t hello-app:latest .
cd ../helm
helm upgrade --install hello hello/
curl http://localhost:8080/hello
```
