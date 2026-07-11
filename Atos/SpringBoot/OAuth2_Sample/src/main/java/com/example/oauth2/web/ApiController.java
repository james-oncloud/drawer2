package com.example.oauth2.web;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ApiController {

    @GetMapping("/public/health")
    public Map<String, Object> health() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "UP");
        response.put("timestamp", Instant.now().toString());
        response.put("message", "Public endpoint — no token required");
        return response;
    }

    @GetMapping("/user")
    public Map<String, Object> user(@AuthenticationPrincipal Jwt jwt) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("subject", jwt.getSubject());
        response.put("issuer", jwt.getIssuer() != null ? jwt.getIssuer().toString() : null);
        response.put("scopes", jwt.getClaimAsString("scope"));
        response.put("claims", jwt.getClaims());
        response.put("message", "Protected endpoint — Bearer token validated");
        return response;
    }

    @GetMapping("/hello")
    public Map<String, String> hello(@AuthenticationPrincipal Jwt jwt) {
        String name = jwt.getClaimAsString("preferred_username");
        if (name == null) {
            name = jwt.getSubject();
        }

        Map<String, String> response = new LinkedHashMap<>();
        response.put("greeting", "Hello, " + name + "!");
        response.put("flow", "authorization_code");
        return response;
    }
}
