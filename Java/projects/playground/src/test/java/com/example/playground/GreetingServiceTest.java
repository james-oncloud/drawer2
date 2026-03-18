package com.example.playground;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class GreetingServiceTest {

    @Test
    void greetReturnsExpectedMessage() {
        GreetingService service = new GreetingService("Hi");

        String result1 = service.greet("James");

        assertThat(result1).isEqualTo("Hi, James!");
        assertThat(service.getPrefix()).isEqualTo("Hi");
    }
}
