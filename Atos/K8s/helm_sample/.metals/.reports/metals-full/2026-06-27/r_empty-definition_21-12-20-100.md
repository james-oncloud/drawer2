error id: file://<WORKSPACE>/app/src/main/java/com/example/hello/HelloController.java:java/util/UUID#randomUUID().
file://<WORKSPACE>/app/src/main/java/com/example/hello/HelloController.java
empty definition using pc, found symbol in pc: java/util/UUID#randomUUID().
empty definition using semanticdb
empty definition using fallback
non-local guesses:

offset: 373
uri: file://<WORKSPACE>/app/src/main/java/com/example/hello/HelloController.java
text:
```scala
package com.example.hello;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@RestController
public class HelloController {

    private String appId = UUID.randomUUI@@D().toString();

    @GetMapping("/hello")
    public Map<String, String> hello() {
        return Map.of(
                "time", Instant.now().toString(),
                "appId", appId
        );
    }

    @GetMapping("/appid")
    public Map<String, String> setAppId(@RequestParam String appId) {
        this.appId = appId;
        return Map.of("appId", this.appId);
    }

    /** APP_ID env var overrides; otherwise a unique GUID is generated at startup. */
    private static String resolveAppId() {
        String env = System.getenv("APP_ID");
        if (env != null && !env.isBlank()) {
            return env;
        }
        return UUID.randomUUID().toString();
    }
}

```


#### Short summary: 

empty definition using pc, found symbol in pc: java/util/UUID#randomUUID().