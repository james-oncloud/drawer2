package com.example.orders.web;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    private final AtomicLong sequence = new AtomicLong(1000);
    private final Map<Long, Map<String, Object>> store = new ConcurrentHashMap<>();

    @GetMapping("/{id}")
    public Map<String, Object> getOrder(@PathVariable long id) throws InterruptedException {
        log.info("Fetching order id={}", id);

        // Simulate occasional slow upstream work so Nginx $upstream_response_time stands out
        if (id % 7 == 0) {
            Thread.sleep(450);
        }

        Map<String, Object> order = store.get(id);
        if (order == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }
        return order;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, Object> body) {
        long id = sequence.incrementAndGet();
        Map<String, Object> order = Map.of(
                "id", id,
                "sku", String.valueOf(body.getOrDefault("sku", "UNKNOWN")),
                "quantity", body.getOrDefault("quantity", 1),
                "createdAt", Instant.now().toString(),
                "requestId", MDC.get(RequestIdFilter.MDC_KEY)
        );
        store.put(id, order);
        log.info("Created order id={} sku={}", id, order.get("sku"));
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping("/health-demo/boom")
    public void boom() {
        log.error("Intentional failure for Nginx 5xx telemetry demo");
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Simulated failure");
    }
}
