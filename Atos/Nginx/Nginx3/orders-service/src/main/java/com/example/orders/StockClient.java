package com.example.orders;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * HTTP client for stock-service (Compose/K8s DNS: stock-service:8083).
 * Measures call duration so nested latency is visible in the orders response.
 */
@Component
public class StockClient {

    private static final Logger log = LoggerFactory.getLogger(StockClient.class);

    private final RestClient restClient;
    private final String baseUrl;

    public StockClient(@Value("${stock.service.base-url}") String baseUrl) {
        this.baseUrl = baseUrl;
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
        log.info("StockClient configured baseUrl={}", baseUrl);
    }

    /**
     * Calls stock-service to update stock for an item (uses orderId as itemId in the demo).
     *
     * @return map with stock response body plus stockDurationMs (client-side timing)
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> updateStock(String itemId) {
        String path = "/stock/" + itemId + "/update";
        log.info("calling stock-service {}{}", baseUrl, path);
        long started = System.nanoTime();
        try {
            Map<String, Object> stock = restClient.get()
                    .uri("/stock/{itemId}/update", itemId)
                    .retrieve()
                    .body(Map.class);
            long stockDurationMs = (System.nanoTime() - started) / 1_000_000L;

            Map<String, Object> result = new LinkedHashMap<>();
            if (stock != null) {
                result.putAll(stock);
            }
            result.put("stockDurationMs", stockDurationMs);
            log.info("stock-service ok itemId={} stockDurationMs={} stockDelayMs={}",
                    itemId, stockDurationMs, result.get("delayMs"));
            return result;
        } catch (RestClientException e) {
            long stockDurationMs = (System.nanoTime() - started) / 1_000_000L;
            log.error("stock-service failed itemId={} stockDurationMs={} error={}",
                    itemId, stockDurationMs, e.getMessage());
            throw e;
        }
    }
}
