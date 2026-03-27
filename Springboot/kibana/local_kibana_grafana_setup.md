# How to Locally Set Up and Run Kibana and Grafana

This guide explains how to locally set up and run **Kibana** and **Grafana** for development and learning, especially when working with Spring Boot microservices.

Kibana and Grafana solve different problems:

- **Kibana** is mainly used for searching and visualizing logs stored in Elasticsearch.
- **Grafana** is mainly used for dashboards and visualization across metrics, logs, and traces from many backends.

In a Spring Boot microservice setup, a common pattern is:

- Spring Boot app exposes metrics through Actuator and Micrometer
- Prometheus scrapes metrics
- Grafana visualizes the metrics
- Application logs are collected into Elasticsearch
- Kibana is used to search and visualize those logs

## Key Concepts Review

- **Grafana** is a dashboard tool, not a metrics database by itself.
- **Kibana** depends on **Elasticsearch** because it reads and visualizes Elasticsearch data.
- **Prometheus** is commonly used with Grafana for Spring Boot metrics.
- **Elasticsearch + Kibana** is commonly used for log search and log dashboards.
- **Docker Compose** is usually the easiest local setup method for both tools.

---

## 1) What You Need Before Starting

For local setup, you usually need:

- Docker Desktop or Docker Engine
- A terminal
- At least a few GB of available RAM

Optional but useful:

- A Spring Boot app with `spring-boot-starter-actuator`
- `micrometer-registry-prometheus` if you want Grafana metrics
- Sample application logs if you want to test Kibana

---

## 2) Local Setup Strategy

### For Grafana
The simplest local stack is:

- Spring Boot application
- Prometheus
- Grafana

### For Kibana
The simplest local stack is:

- Elasticsearch
- Kibana

If you want both in one local environment, you can run:

- Elasticsearch
- Kibana
- Prometheus
- Grafana

---

## 3) Quickest Option: Docker Compose

This is the easiest and most common local setup approach.

Example `docker-compose.yml`:

```yaml
version: "3.9"

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.13.4
    container_name: elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
    ports:
      - "9200:9200"
    volumes:
      - esdata:/usr/share/elasticsearch/data

  kibana:
    image: docker.elastic.co/kibana/kibana:8.13.4
    container_name: kibana
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
    depends_on:
      - prometheus

volumes:
  esdata:
```

Start everything with:

```bash
docker compose up -d
```

---

## 4) Prometheus Config for Grafana

If you want Grafana to show Spring Boot metrics, Prometheus needs a scrape config.

Create `prometheus.yml`:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "spring-boot-app"
    metrics_path: "/actuator/prometheus"
    static_configs:
      - targets: ["host.docker.internal:8080"]
```

If your Spring Boot app runs directly on your machine on port `8080`, `host.docker.internal:8080` often works from Docker on macOS and Windows.

If the app also runs in Docker, use the container name instead.

---

## 5) Spring Boot Setup Needed for Grafana

To expose Prometheus metrics from Spring Boot, you typically need:

### Dependencies

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>

<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

### Application properties

```properties
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.endpoint.health.show-details=always
management.prometheus.metrics.export.enabled=true
```

Then start your Spring Boot app and verify:

```bash
curl http://localhost:8080/actuator/prometheus
```

If you see text-based metrics output, Prometheus and Grafana can use it.

---

## 6) Access URLs After Startup

After containers are up:

- Elasticsearch: `http://localhost:9200`
- Kibana: `http://localhost:5601`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3000`

Default Grafana login from the example:

- Username: `admin`
- Password: `admin`

Grafana may ask you to change the password on first login.

---

## 7) How to Set Up Grafana After Login

### Add Prometheus as a data source

1. Open `http://localhost:3000`
2. Sign in
3. Go to `Connections` or `Data Sources`
4. Choose `Prometheus`
5. Set the URL to `http://prometheus:9090` if Grafana runs in Docker
6. Save and test

### Create a dashboard

You can create panels for metrics such as:

- `http_server_requests_seconds_count`
- `http_server_requests_seconds_sum`
- `jvm_memory_used_bytes`
- `system_cpu_usage`
- `process_uptime_seconds`

You can also import community dashboards for Spring Boot and JVM metrics.

---

## 8) How to Set Up Kibana After Login

Open:

- `http://localhost:5601`

Kibana needs data in Elasticsearch before dashboards become useful.

Typical next steps:

1. Open Kibana
2. Go to data views or index patterns
3. Create a data view matching your log index, such as `logs-*`
4. Open Discover to search logs
5. Build dashboards or visualizations

If Elasticsearch has no log data yet, Kibana will open but show little useful content.

---

## 9) How Logs Reach Kibana

Kibana does not read application logs directly from Spring Boot.

The usual flow is:

1. Spring Boot writes logs
2. A log shipper collects them
3. Logs are sent to Elasticsearch
4. Kibana reads from Elasticsearch

Common log shippers:

- Filebeat
- Logstash
- Fluent Bit
- Fluentd

For local experiments, Filebeat or Logstash are common choices.

---

## 10) Optional Local Log Pipeline Example

A simple local log pipeline can be:

- Spring Boot writes logs to a file
- Filebeat reads the file
- Filebeat sends logs to Elasticsearch
- Kibana displays them

This is a very common beginner-friendly ELK setup.

---

## 11) Native Install Option

You can also install Grafana, Elasticsearch, and Kibana directly on your machine without Docker, but Docker is usually easier because:

- setup is faster
- cleanup is easier
- versions are easier to control
- local conflicts are reduced

Native installation is more common when Docker is unavailable or restricted.

---

## 12) Common Problems and Fixes

### Kibana does not start
- Check that Elasticsearch is running first
- Check memory usage
- Verify `ELASTICSEARCH_HOSTS` points to the right address

### Elasticsearch fails on startup
- Reduce JVM heap for local development
- Ensure Docker has enough memory
- Delete corrupted local volumes if needed

### Grafana cannot connect to Prometheus
- Check that Prometheus is running
- Verify the data source URL
- Confirm the Spring Boot app exposes `/actuator/prometheus`

### Prometheus shows target down
- Check app port and host
- Verify firewall or container networking
- Confirm Actuator exposure settings

### Kibana has no data
- Make sure logs are being shipped into Elasticsearch
- Verify the index exists in Elasticsearch
- Check the selected data view in Kibana

---

## 13) Recommended Learning Path

If you are learning locally, start in this order:

1. Run Spring Boot with Actuator and Prometheus metrics
2. Run Prometheus
3. Run Grafana and visualize metrics
4. Run Elasticsearch and Kibana
5. Add a log shipper and explore logs in Kibana

This keeps the setup manageable and lets you understand each tool's role clearly.

---

## 14) Summary

For local Spring Boot development:

- Use **Grafana** with **Prometheus** for metrics dashboards
- Use **Kibana** with **Elasticsearch** for log search and visualization
- Use **Docker Compose** for the easiest setup

The simplest working local stack for both tools usually includes:

- Spring Boot app
- Prometheus
- Grafana
- Elasticsearch
- Kibana

If you want, the next useful step is adding another file with a full local `docker-compose.yml` that includes Filebeat for shipping Spring Boot logs into Elasticsearch.
