package com.example.app;

import lombok.Getter;

public class GreetingService {

    @Getter
    private final String fallbackName = "stranger";

    public String greet(String name) {
        if (name == null || name.isBlank()) {
            return "Hello, " + getFallbackName() + "!";
        }
        return "Hello, " + name.trim() + "!";
    }
}
