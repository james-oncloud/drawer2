package com.example.playground;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class GreetingService {
    private final String prefix;

    public String greet(String name) {
        return prefix + ", " + name + "!";
    }
}
