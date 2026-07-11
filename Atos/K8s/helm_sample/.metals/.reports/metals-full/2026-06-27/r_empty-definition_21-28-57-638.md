error id: file://<WORKSPACE>/app/src/main/java/com/example/hello/RandomKillRunner.java:_empty_/ApplicationRunner#
file://<WORKSPACE>/app/src/main/java/com/example/hello/RandomKillRunner.java
empty definition using pc, found symbol in pc: _empty_/ApplicationRunner#
empty definition using semanticdb
empty definition using fallback
non-local guesses:

offset: 345
uri: file://<WORKSPACE>/app/src/main/java/com/example/hello/RandomKillRunner.java
text:
```scala
package com.example.hello;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.Random;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

@Component
public class RandomKillRunner implements Applica@@tionRunner {

    private static final int DEFAULT_MIN_SECONDS = 30;
    private static final int DEFAULT_MAX_SECONDS = 120;

    @Override
    public void run(ApplicationArguments args) {
        int minSeconds = intEnv("KILL_AFTER_MIN_SECONDS", DEFAULT_MIN_SECONDS);
        int maxSeconds = intEnv("KILL_AFTER_MAX_SECONDS", DEFAULT_MAX_SECONDS);
        if (maxSeconds < minSeconds) {
            maxSeconds = minSeconds;
        }

        int delaySeconds = minSeconds + new Random().nextInt(maxSeconds - minSeconds + 1);
        System.out.println("Random exit scheduled in " + delaySeconds + " seconds");

        Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "random-kill");
            t.setDaemon(true);
            return t;
        }).schedule(() -> {
            System.out.println("Random exit triggered after " + delaySeconds + " seconds");
            System.exit(1);
        }, delaySeconds, TimeUnit.SECONDS);
    }

    private static int intEnv(String name, int defaultValue) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }
}

```


#### Short summary: 

empty definition using pc, found symbol in pc: _empty_/ApplicationRunner#