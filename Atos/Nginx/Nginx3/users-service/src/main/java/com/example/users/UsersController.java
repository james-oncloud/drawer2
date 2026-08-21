package com.example.users;

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
 * Responses include the Pod/hostname so load balancing across replicas is visible.
 * Each request sleeps a random duration (0–10s) so NGINX telemetry can show
 * varying request_time / upstream_response_time.
 */
@RestController
public class UsersController {

    private static final Logger log = LoggerFactory.getLogger(UsersController.class);
    private static final int MAX_DELAY_MS = 10_000;

    private final String hostname = resolveHostname();

    @GetMapping({"/users", "/users/"})
    public Map<String, Object> listUsers() throws InterruptedException {
        log.info("listUsers start pod={}", hostname);
        long delayMs = randomDelayMs();
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("service", "users-service");
        body.put("pod", hostname);
        body.put("message", "List of users (demo)");
        body.put("delayMs", delayMs);
        log.info("listUsers done delayMs={}", delayMs);
        return body;
    }

    @GetMapping("/users/{userId}")
    public Map<String, Object> getUser(@PathVariable String userId) throws InterruptedException {
        log.info("getUser start userId={} pod={}", userId, hostname);
        long delayMs = randomDelayMs();
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("service", "users-service");
        body.put("pod", hostname);
        body.put("userId", userId);
        body.put("delayMs", delayMs);
        log.info("getUser done userId={} delayMs={}", userId, delayMs);
        return body;
    }

    /**
     * Echoes proxy headers forwarded by NGINX so you can verify proxy_set_header.
     */
    @GetMapping("/users/debug")
    public Map<String, Object> debugHeaders(HttpServletRequest request) throws InterruptedException {
        log.info("debugHeaders start pod={} xRealIp={} xForwardedFor={}",
                hostname, request.getHeader("X-Real-IP"), request.getHeader("X-Forwarded-For"));
        long delayMs = randomDelayMs();
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("service", "users-service");
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

    /** Sleeps 0–MAX_DELAY_MS ms and returns the chosen delay. */
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
