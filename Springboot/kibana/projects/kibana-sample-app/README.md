# Kibana Sample App

This is a minimal Spring Boot application for demonstrating how logs and trace IDs can be viewed in Kibana.

## What it includes

- REST endpoints for success and failure cases
- file logging to `logs/orders-service.log`
- trace IDs and span IDs in each log line
- Actuator enabled for basic health/info endpoints

## Requirements

- Java 11+
- Maven 3.9+

## Run locally

```bash
mvn spring-boot:run
```

## Test endpoints

Success case:

```bash
curl http://localhost:8080/api/orders/101
```

Failure case:

```bash
curl http://localhost:8080/api/orders/500/fail
```

## Log file

The application writes logs to:

```text
logs/orders-service.log
```

## Example Filebeat input

Point Filebeat to the generated log file:

```yaml
filebeat.inputs:
  - type: filestream
    id: orders-service
    paths:
      - /path/to/kibana-sample-app/logs/orders-service.log
```

## Useful Kibana searches

- `orders-service`
- `Simulated failure`
- `traceId`
- `ERROR`
