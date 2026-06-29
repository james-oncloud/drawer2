error id: file://<WORKSPACE>/app/src/main/java/com/example/monitoring/App.java:com/sun/net/httpserver/HttpExchange#getResponseBody().
file://<WORKSPACE>/app/src/main/java/com/example/monitoring/App.java
empty definition using pc, found symbol in pc: com/sun/net/httpserver/HttpExchange#getResponseBody().
empty definition using semanticdb
empty definition using fallback
non-local guesses:

offset: 6983
uri: file://<WORKSPACE>/app/src/main/java/com/example/monitoring/App.java
text:
```scala
package com.example.monitoring;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.Timer;
import io.micrometer.prometheusmetrics.PrometheusConfig;
import io.micrometer.prometheusmetrics.PrometheusMeterRegistry;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Random;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Minimal HTTP service that exposes Prometheus metrics via Micrometer.
 * Prometheus scrapes {@code /metrics}; Grafana charts the stored time series.
 */
public class App {

    private static final int PORT = 8080;
    private static final Random RANDOM = new Random();

    public static void main(String[] args) throws IOException {
        
        // Registry serialises all registered meters into Prometheus text format on scrape.
        PrometheusMeterRegistry registry = new PrometheusMeterRegistry(PrometheusConfig.DEFAULT);

        Counter requestsTotal = Counter.builder("app_requests_total")
                .description("Total processed requests")
                .tag("endpoint", "work")
                .register(registry);

        Counter errorsTotal = Counter.builder("app_errors_total")
                .description("Total failed requests")
                .register(registry);

        // Micrometer Timers are exported as Prometheus histograms (_bucket, _count, _sum).
        Timer requestDuration = Timer.builder("app_request_duration_seconds")
                .description("Request processing duration")
                .register(registry);

        // Gauge reads live value; AtomicInteger lets concurrent handlers update safely.
        AtomicInteger activeTasks = new AtomicInteger(0);
        Gauge.builder("app_active_tasks", activeTasks, AtomicInteger::get)
                .description("Currently running tasks")
                .register(registry);

        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.createContext("/metrics", new MetricsHandler(registry));
        server.createContext("/work", exchange -> handleWork(exchange, requestsTotal, errorsTotal, requestDuration, activeTasks));
        server.createContext("/health", exchange -> {
            byte[] body = "ok".getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(200, body.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(body);
            }
        });
        // Cached thread pool: each request runs on its own thread (fine for a demo workload).
        server.setExecutor(Executors.newCachedThreadPool());
        server.start();

        // Background traffic so Grafana panels populate without manual curl calls.
        ScheduledExecutorService simulator = Executors.newSingleThreadScheduledExecutor();
        simulator.scheduleAtFixedRate(
                () -> simulateWork(requestsTotal, errorsTotal, requestDuration, activeTasks),
                2,   // initial delay
                3,   // period
                TimeUnit.SECONDS
        );

        System.out.printf("Monitoring demo running on http://localhost:%d%n", PORT);
        System.out.printf("  /metrics  Prometheus scrape endpoint%n");
        System.out.printf("  /work     Trigger a sample request%n");
        System.out.printf("  /health   Health check%n");
    }

    /** HTTP handler for {@code GET /work}; delegates to shared processing logic. */
    private static void handleWork(
            HttpExchange exchange,
            Counter requestsTotal,
            Counter errorsTotal,
            Timer requestDuration,
            AtomicInteger activeTasks
    ) throws IOException {
        if (!"GET".equals(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(405, -1);
            exchange.close();
            return;
        }

        boolean success = processWork(requestsTotal, errorsTotal, requestDuration, activeTasks);
        byte[] body = (success ? "done" : "error").getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(success ? 200 : 500, body.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(body);
        }
    }

    /** Same processing path as {@link #handleWork}, but invoked by the background scheduler. */
    private static void simulateWork(
            Counter requestsTotal,
            Counter errorsTotal,
            Timer requestDuration,
            AtomicInteger activeTasks
    ) {
        processWork(requestsTotal, errorsTotal, requestDuration, activeTasks);
    }

    /**
     * Simulates work with variable latency and a ~10% failure rate.
     * activeTasks is incremented before work starts and always decremented in finally,
     * so the gauge reflects in-flight count even when an error occurs.
     */
    private static boolean processWork(
            Counter requestsTotal,
            Counter errorsTotal,
            Timer requestDuration,
            AtomicInteger activeTasks
    ) {
        activeTasks.incrementAndGet();
        try {
            return requestDuration.record(() -> {
                try {
                    Thread.sleep(50 + RANDOM.nextInt(200));
                    // Deliberate failures to produce non-zero error-rate charts in Grafana.
                    if (RANDOM.nextDouble() < 0.1) {
                        errorsTotal.increment();
                        return false;
                    }
                    requestsTotal.increment();
                    return true;
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    errorsTotal.increment();
                    return false;
                }
            });
        } finally {
            activeTasks.decrementAndGet();
        }
    }

    /** Serves the Prometheus exposition format expected by scrapers. */
    private static final class MetricsHandler implements HttpHandler {
        private final PrometheusMeterRegistry registry;

        private MetricsHandler(PrometheusMeterRegistry registry) {
            this.registry = registry;
        }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            byte[] body = registry.scrape().getBytes(StandardCharsets.UTF_8);
            // Content-Type required by the Prometheus exposition format spec.
            exchange.getResponseHeaders().set("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
            exchange.sendResponseHeaders(200, body.length);
            try (OutputStream os = exchange.getResp@@onseBody()) {
                os.write(body);
            }
        }
    }
}

```


#### Short summary: 

empty definition using pc, found symbol in pc: com/sun/net/httpserver/HttpExchange#getResponseBody().