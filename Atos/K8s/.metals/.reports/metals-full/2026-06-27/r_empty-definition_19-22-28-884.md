error id: file://<WORKSPACE>/app/src/main/java/com/example/hello/HelloController.java:_empty_/RequestParam#
file://<WORKSPACE>/app/src/main/java/com/example/hello/HelloController.java
empty definition using pc, found symbol in pc: _empty_/RequestParam#
empty definition using semanticdb
empty definition using fallback
non-local guesses:

offset: 606
uri: file://<WORKSPACE>/app/src/main/java/com/example/hello/HelloController.java
text:
```scala
package com.example.hello;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class HelloController {

    private String appId = "0";

    @GetMapping("/hello")
    public Map<String, String> hello() {
        return Map.of(
                "time", Instant.now().toString(),
                "appId", appId
        );
    }

    @GetMapping("/appid")
    public Map<String, String> setAppId(@RequestP@@aram String appId) {
        this.appId = appId;
        return Map.of("appId", this.appId);
    }
}

```


#### Short summary: 

empty definition using pc, found symbol in pc: _empty_/RequestParam#