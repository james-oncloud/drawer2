package com.example.payments;

import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Example: reliable local integration testing with Testcontainers.
 * CI runs the same containers — no shared staging DB required for basic coverage.
 */
@Testcontainers
class PaymentRepositoryIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
            .withDatabaseName("payments")
            .withUsername("app")
            .withPassword("local");

    @Test
    void shouldPersistRefund_whenValidRequest() {
        // Wire repository with postgres.getJdbcUrl() via @DynamicPropertySource in real service
        var repo = new PaymentRepository(postgres.getJdbcUrl(), "app", "local");
        var id = repo.saveRefund("order-1", 1000L);

        assertThat(repo.findById(id)).isPresent();
    }
}
