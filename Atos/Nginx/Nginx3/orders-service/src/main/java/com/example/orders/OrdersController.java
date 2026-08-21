package com.example.orders;

import jakarta.servlet.http.HttpServletRequest;
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
 * Minimal HTTP API used behind NGINX.
 * getOrder calls stock-service to update stock; stockDurationMs is timed in-process
 * (NGINX only sees the total orders upstream time, not the nested stock hop).
 */
@RestController
public class OrdersController {

    private static final Logger log = LoggerFactory.getLogger(OrdersController.class);
    private static final int MAX_DELAY_MS = 10_000;

    private final String hostname = resolveHostname();
    private final StockClient stockClient;

    public OrdersController(StockClient stockClient) {
        this.stockClient = stockClient;
    }

    @GetMapping({"/orders", "/orders/"})
    public Map<String, Object> listOrders() throws InterruptedException {
        log.info("listOrders start pod={}", hostname);
        long delayMs = randomDelayMs();
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("service", "orders-service");
        body.put("pod", hostname);
        body.put("message", "List of orders (demo)");
        body.put("delayMs", delayMs);
        log.info("listOrders done delayMs={}", delayMs);
        return body;
    }

    @GetMapping("/orders/{orderId}")
    public Map<String, Object> getOrder(@PathVariable String orderId) {
        log.info("getOrder start orderId={} pod={} (will call stock-service)", orderId, hostname);
        // Demo: treat orderId as the stock item to update.
        Map<String, Object> stock = stockClient.updateStock(orderId);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("service", "orders-service");
        body.put("pod", hostname);
        body.put("orderId", orderId);
        body.put("stock", stock);
        body.put("stockDurationMs", stock.get("stockDurationMs"));
        log.info("getOrder done orderId={} stockDurationMs={}", orderId, stock.get("stockDurationMs"));
        return body;
    }

    /**
     * Echoes proxy headers forwarded by NGINX so you can verify proxy_set_header.
     */
    @GetMapping("/orders/debug")
    public Map<String, Object> debugHeaders(HttpServletRequest request) throws InterruptedException {
        log.info("debugHeaders start pod={} xRealIp={} xForwardedFor={}",
                hostname, request.getHeader("X-Real-IP"), request.getHeader("X-Forwarded-For"));
        long delayMs = randomDelayMs();
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("service", "orders-service");
        body.put("pod", hostname);
        body.put("host", request.getHeader("Host"));
        body.put("xRealIp", request.getHeader("X-Real-IP"));
        body.put("xForwardedFor", request.getHeader("X-Forwarded-For"));
        body.put("xForwardedProto", request.getHeader("X-Forwarded-Proto"));
        body.put("remoteAddr", request.getRemoteAddr());
        body.put("delayMs", delayMs);
        log.info("debugHeaders done delayMs={}", delayMs);
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
