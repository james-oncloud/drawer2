package com.example.hello;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.UUID;

@RestController
public class HelloController {

    private String appId;

    public HelloController() {
        this.appId = UUID.randomUUID().toString();
        System.out.println("appId: " + appId);
    }

    @GetMapping("/hello")
    public Map<String, String> hello() {
        Instant now = Instant.now();
        int second = now.atZone(ZoneOffset.UTC).getSecond();
        if (second % 2 != 0) {
            System.out.println("Kill triggered: odd second " + second);
            Map<String, String> response = Map.of(
                    "time", now.toString(),
                    "appId", appId
            );
            new Thread(() -> {
                try {
                    Thread.sleep(200);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                System.exit(1);
            }).start();
            return response;
        }
        return Map.of(
                "time", now.toString(),
                "appId", appId
        );
    }

    @GetMapping("/appid")
    public Map<String, String> setAppId(@RequestParam String appId) {
        this.appId = appId;
        return Map.of("appId", this.appId);
    }
}
