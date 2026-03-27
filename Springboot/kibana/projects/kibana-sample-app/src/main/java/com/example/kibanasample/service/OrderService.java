package com.example.kibanasample.service;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.sleuth.Span;
import org.springframework.cloud.sleuth.Tracer;
import org.springframework.stereotype.Service;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final Tracer tracer;

    public OrderService(Tracer tracer) {
        this.tracer = tracer;
    }

    public Map<String, Object> getOrder(String id) {
        Span span = tracer.nextSpan().name("load-order").start();

        try (Tracer.SpanInScope ignored = tracer.withSpan(span)) {
            log.info("Loading order {}", id);

            Map<String, Object> order = new LinkedHashMap<>();
            order.put("id", id);
            order.put("status", "CREATED");
            order.put("updatedAt", Instant.now().toString());

            log.info("Successfully loaded order {}", id);
            return order;
        } finally {
            span.end();
        }
    }

    public Map<String, Object> failOrder(String id) {
        Span span = tracer.nextSpan().name("fail-order").start();

        try (Tracer.SpanInScope ignored = tracer.withSpan(span)) {
            log.error("Simulated failure while loading order {}", id);
            throw new IllegalStateException("Simulated order lookup failure for order " + id);
        } finally {
            span.end();
        }
    }
}
