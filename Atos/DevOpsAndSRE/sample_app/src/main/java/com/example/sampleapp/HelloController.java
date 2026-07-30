package com.example.sampleapp;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    private final Counter helloCounter;

    public HelloController(MeterRegistry registry) {
        this.helloCounter = Counter.builder("sample_app_hello_total")
                .description("Number of hello endpoint calls")
                .register(registry);
    }

    @GetMapping("/hello")
    public String hello(@RequestParam(defaultValue = "world") String name) {
        helloCounter.increment();
        return "Hello, " + name + "!";
    }

    @GetMapping("/error-demo")
    public String errorDemo() {
        throw new IllegalStateException("Intentional error for metrics demo");
    }
}
