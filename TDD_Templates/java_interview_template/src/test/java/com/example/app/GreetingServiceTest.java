package com.example.app;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class GreetingServiceTest {

    private final GreetingService greetingService = new GreetingService();

    @Test
    void greetReturnsPersonalizedMessage() {
        String actual = greetingService.greet("James");
        assertThat(actual).isEqualTo("Hello, James!");
    }

    @Test
    void greetHandlesBlankName() {
        String actual = greetingService.greet("   ");
        assertThat(actual).isEqualTo("Hello, stranger!");
    }

    @Test
    void greetHandlesNullName() {
        String actual = greetingService.greet(null);
        assertThat(actual).isEqualTo("Hello, stranger!");
    }
}
