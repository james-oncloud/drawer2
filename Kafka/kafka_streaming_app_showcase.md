# Kafka Streaming App Showcase (Kafka APIs)

This guide provides a small, runnable Java app that demonstrates core Kafka APIs in one place:

- **Admin API** (`AdminClient`) to create topics
- **Producer API** (`KafkaProducer`) to publish sample events
- **Kafka Streams API** (`StreamsBuilder`) to transform, branch, aggregate, and write output topics

## 1) What This Demo Does

Input topic: `orders-input`

Each message format:

`orderId,userId,amount,status`

Example:

`o-1001,u-42,1200.0,PAID`

The stream app:

- reads from `orders-input`
- filters invalid records
- normalizes and enriches records
- routes high-value orders (`amount >= 1000`) to `orders-alerts`
- aggregates order totals per user into `orders-user-totals`

## 2) Project Structure

```text
kafka-stream-demo/
  pom.xml
  src/main/java/demo/KafkaStreamingShowcase.java
```

## 3) `pom.xml`

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>demo</groupId>
  <artifactId>kafka-stream-demo</artifactId>
  <version>1.0.0</version>

  <properties>
    <maven.compiler.source>21</maven.compiler.source>
    <maven.compiler.target>21</maven.compiler.target>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.apache.kafka</groupId>
      <artifactId>kafka-streams</artifactId>
      <version>3.7.1</version>
    </dependency>
    <dependency>
      <groupId>org.slf4j</groupId>
      <artifactId>slf4j-simple</artifactId>
      <version>2.0.13</version>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-compiler-plugin</artifactId>
        <version>3.11.0</version>
      </plugin>
      <plugin>
        <groupId>org.codehaus.mojo</groupId>
        <artifactId>exec-maven-plugin</artifactId>
        <version>3.2.0</version>
        <configuration>
          <mainClass>demo.KafkaStreamingShowcase</mainClass>
        </configuration>
      </plugin>
    </plugins>
  </build>
</project>
```

## 4) App Code (`KafkaStreamingShowcase.java`)

```java
package demo;

import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.common.serialization.StringSerializer;
import org.apache.kafka.streams.KafkaStreams;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.StreamsConfig;
import org.apache.kafka.streams.errors.StreamsUncaughtExceptionHandler;
import org.apache.kafka.streams.kstream.Branched;
import org.apache.kafka.streams.kstream.Grouped;
import org.apache.kafka.streams.kstream.KStream;
import org.apache.kafka.streams.kstream.Materialized;
import org.apache.kafka.streams.kstream.Named;
import org.apache.kafka.streams.kstream.Produced;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.UUID;

public class KafkaStreamingShowcase {

    private static final String BOOTSTRAP = "localhost:9092";
    private static final String INPUT_TOPIC = "orders-input";
    private static final String ALERTS_TOPIC = "orders-alerts";
    private static final String TOTALS_TOPIC = "orders-user-totals";

    public static void main(String[] args) throws Exception {
        createTopics();
        produceSampleData();
        startStreams();
    }

    // Admin API demo: create topics if missing
    private static void createTopics() {
        Properties adminProps = new Properties();
        adminProps.put("bootstrap.servers", BOOTSTRAP);

        try (AdminClient admin = AdminClient.create(adminProps)) {
            List<NewTopic> topics = List.of(
                new NewTopic(INPUT_TOPIC, 3, (short) 1),
                new NewTopic(ALERTS_TOPIC, 3, (short) 1),
                new NewTopic(TOTALS_TOPIC, 3, (short) 1)
            );
            admin.createTopics(topics).all().get();
            System.out.println("Topics created (or already exist).");
        } catch (Exception e) {
            System.out.println("Topic creation skipped: " + e.getMessage());
        }
    }

    // Producer API demo: send sample order events
    private static void produceSampleData() {
        Properties producerProps = new Properties();
        producerProps.put("bootstrap.servers", BOOTSTRAP);
        producerProps.put("key.serializer", StringSerializer.class.getName());
        producerProps.put("value.serializer", StringSerializer.class.getName());
        producerProps.put("acks", "all");

        try (KafkaProducer<String, String> producer = new KafkaProducer<>(producerProps)) {
            List<String> payloads = List.of(
                "o-1001,u-42,1200.0,PAID",
                "o-1002,u-17,80.5,PENDING",
                "o-1003,u-42,250.0,PAID",
                "o-1004,u-08,2200.0,PAID",
                "o-1005,u-17,11.0,CANCELLED"
            );

            for (String payload : payloads) {
                String orderId = payload.split(",")[0];
                producer.send(new ProducerRecord<>(INPUT_TOPIC, orderId, payload));
            }
            producer.flush();
            System.out.println("Sample events produced.");
        }
    }

    // Kafka Streams API demo: topology with transform, branch, and aggregation
    private static void startStreams() {
        Properties streamsProps = new Properties();
        streamsProps.put(StreamsConfig.APPLICATION_ID_CONFIG, "orders-stream-app-" + UUID.randomUUID());
        streamsProps.put(StreamsConfig.BOOTSTRAP_SERVERS_CONFIG, BOOTSTRAP);
        streamsProps.put(StreamsConfig.DEFAULT_KEY_SERDE_CLASS_CONFIG, Serdes.String().getClass().getName());
        streamsProps.put(StreamsConfig.DEFAULT_VALUE_SERDE_CLASS_CONFIG, Serdes.String().getClass().getName());
        streamsProps.put(StreamsConfig.COMMIT_INTERVAL_MS_CONFIG, 2000);

        StreamsBuilder builder = new StreamsBuilder();

        KStream<String, String> orders = builder.stream(INPUT_TOPIC);

        KStream<String, String> validOrders = orders
            .filter((key, value) -> value != null && value.split(",").length == 4)
            .mapValues(v -> {
                String[] p = v.split(",");
                String orderId = p[0];
                String userId = p[1];
                double amount = Double.parseDouble(p[2]);
                String status = p[3].toUpperCase();
                return orderId + "," + userId + "," + amount + "," + status;
            })
            .peek((k, v) -> System.out.println("Normalized: " + v));

        // Branch: high-value orders to alerts topic
        validOrders.split(Named.as("orders-"))
            .branch((k, v) -> Double.parseDouble(v.split(",")[2]) >= 1000.0,
                Branched.withConsumer(high ->
                    high.to(ALERTS_TOPIC, Produced.with(Serdes.String(), Serdes.String()))))
            .defaultBranch(Branched.as("normal"));

        // Aggregate: total PAID amount by user
        validOrders
            .filter((k, v) -> "PAID".equals(v.split(",")[3]))
            .selectKey((oldKey, value) -> value.split(",")[1]) // key = userId
            .mapValues(v -> v.split(",")[2]) // value = amount
            .groupByKey(Grouped.with(Serdes.String(), Serdes.String()))
            .aggregate(
                () -> 0.0,
                (userId, amountString, currentTotal) -> currentTotal + Double.parseDouble(amountString),
                Materialized.with(Serdes.String(), Serdes.Double())
            )
            .toStream()
            .mapValues(total -> String.format("%.2f", total))
            .to(TOTALS_TOPIC, Produced.with(Serdes.String(), Serdes.String()));

        KafkaStreams streams = new KafkaStreams(builder.build(), streamsProps);
        streams.setUncaughtExceptionHandler((thread, throwable) -> {
            System.err.println("Stream error on " + thread.getName() + ": " + throwable.getMessage());
            return StreamsUncaughtExceptionHandler.StreamThreadExceptionResponse.SHUTDOWN_APPLICATION;
        });
        streams.start();

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("Shutting down stream app...");
            streams.close(Duration.ofSeconds(10));
        }));

        System.out.println("Streams started. Press Ctrl+C to stop.");
    }
}
```

## 5) Run Kafka Locally (Quick Option)

If you already have Kafka running on `localhost:9092`, skip this section.

Minimal Docker example:

```yaml
services:
  kafka:
    image: bitnami/kafka:3.7
    ports:
      - "9092:9092"
    environment:
      - KAFKA_CFG_NODE_ID=1
      - KAFKA_CFG_PROCESS_ROLES=broker,controller
      - KAFKA_CFG_CONTROLLER_LISTENER_NAMES=CONTROLLER
      - KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093
      - KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092
      - KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT
      - KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=1@127.0.0.1:9093
      - KAFKA_CFG_OFFSETS_TOPIC_REPLICATION_FACTOR=1
      - KAFKA_CFG_TRANSACTION_STATE_LOG_REPLICATION_FACTOR=1
      - KAFKA_CFG_TRANSACTION_STATE_LOG_MIN_ISR=1
```

## 6) Build and Run

```bash
cd kafka-stream-demo
mvn clean compile exec:java
```

## 7) Verify Output Topics

Read high-value alerts:

```bash
kafka-console-consumer --bootstrap-server localhost:9092 --topic orders-alerts --from-beginning
```

Read per-user totals:

```bash
kafka-console-consumer --bootstrap-server localhost:9092 --topic orders-user-totals --from-beginning --property print.key=true
```

## 8) Kafka APIs Demonstrated

- **Admin API**
  - `AdminClient.create(...)`
  - `createTopics(...)`
- **Producer API**
  - `KafkaProducer.send(...)`
  - durability with `acks=all`
- **Streams API**
  - `builder.stream(...)`
  - `filter(...)`, `mapValues(...)`, `peek(...)`
  - `split(...).branch(...)`
  - `selectKey(...)`, `groupByKey(...)`, `aggregate(...)`
  - output with `to(...)`

## 9) Extensions (Next Step)

- Replace CSV payloads with JSON + schema validation.
- Add exactly-once processing config.
- Add a second stream join (e.g., orders with user profile topic).
- Deploy 2+ app instances to showcase partition-parallel processing.

