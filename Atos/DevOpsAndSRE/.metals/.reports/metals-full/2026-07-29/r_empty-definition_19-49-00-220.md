error id: file://<WORKSPACE>/sample_app/src/main/java/com/example/sampleapp/HelloController.java:_empty_/MeterRegistry#
file://<WORKSPACE>/sample_app/src/main/java/com/example/sampleapp/HelloController.java
empty definition using pc, found symbol in pc: _empty_/MeterRegistry#
empty definition using semanticdb
empty definition using fallback
non-local guesses:

offset: 432
uri: file://<WORKSPACE>/sample_app/src/main/java/com/example/sampleapp/HelloController.java
text:
```scala
package com.example.sampleapp;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    private final Counter helloCounter;

    public HelloController(Me@@terRegistry registry) {
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

```


#### Short summary: 

empty definition using pc, found symbol in pc: _empty_/MeterRegistry#