# Log Sample Generator App

This is a small plain Java application that generates sample application logs for Kibana demos.

## Output

The app writes logs to:

```text
./log-samples/app.log
```

## Compile

From this project directory:

```bash
mkdir -p out
javac -d out src/main/java/com/example/logsample/LogSampleGeneratorApplication.java
```

## Run

Generate the default 20 log cycles:

```bash
java -cp out com.example.logsample.LogSampleGeneratorApplication
```

Generate a custom number of cycles:

```bash
java -cp out com.example.logsample.LogSampleGeneratorApplication 50
```

## What gets generated

The app produces:

- `INFO` logs for normal requests
- `WARN` logs for simulated slow downstream calls
- `ERROR` logs for simulated failures
- `traceId` and `spanId` values in every sample log line

## Example Filebeat path

```yaml
filebeat.inputs:
  - type: filestream
    id: log-sample-generator
    paths:
      - /path/to/Springboot/kibana/projects/log-sample-generator-app/log-samples/app.log
```
