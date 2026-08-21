package com.example.stock;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.net.InetAddress;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Stock API used by orders-service (service-to-service) and optionally via NGINX.
 * Each request sleeps a random duration (0–10s) so nested latency is visible.
 */
@RestController
public class StockController {

    private static final Logger log = LoggerFactory.getLogger(StockController.class);
    private static final int MAX_DELAY_MS = 10_000;

    private final String hostname = resolveHostname();

    @GetMapping({"/stock", "/stock/"})
    public Map<String, Object> listStock() throws InterruptedException {
        log.info("listStock start pod={}", hostname);
        long delayMs = randomDelayMs();
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("service", "stock-service");
        body.put("pod", hostname);
        body.put("message", "List of stock items (demo)");
        body.put("delayMs", delayMs);
        log.info("listStock done delayMs={}", delayMs);
        return body;
    }

    @GetMapping("/stock/{itemId}")
    public Map<String, Object> getStock(@PathVariable String itemId) throws InterruptedException {
        log.info("getStock start itemId={} pod={}", itemId, hostname);
        long delayMs = randomDelayMs();
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("service", "stock-service");
        body.put("pod", hostname);
        body.put("itemId", itemId);
        body.put("quantity", 42);
        body.put("delayMs", delayMs);
        log.info("getStock done itemId={} delayMs={}", itemId, delayMs);
        return body;
    }

    /**
     * Called by orders-service when an order is fetched — simulates a stock update.
     */
    @GetMapping("/stock/{itemId}/update")
    public Map<String, Object> updateStock(@PathVariable String itemId) throws InterruptedException {
        log.info("updateStock start itemId={} pod={}", itemId, hostname);
        long delayMs = randomDelayMs();
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("service", "stock-service");
        body.put("pod", hostname);
        body.put("itemId", itemId);
        body.put("updated", true);
        body.put("delayMs", delayMs);
        log.info("updateStock done itemId={} delayMs={}", itemId, delayMs);
        return body;
    }

    private static long randomDelayMs() throws InterruptedException {
        long delayMs = ThreadLocalRandom.current().nextLong(MAX_DELAY_MS + 1L);
        log.debug("sleeping delayMs={}", delayMs);
        Thread.sleep(delayMs);
        return delayMs;
    }

    private static String resolveHostname() {
        try {
            return InetAddress.getLocalHost().getHostName();
        } catch (Exception e) {
            return "unknown";
        }
    }
}
