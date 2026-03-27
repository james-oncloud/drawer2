package com.example.kibanasample.controller;

import com.example.kibanasample.service.OrderService;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/{id}")
    public Map<String, Object> getOrder(@PathVariable String id) {
        log.info("Received request for order {}", id);
        Map<String, Object> order = orderService.getOrder(id);
        log.info("Returning order {} with status {}", id, order.get("status"));
        return order;
    }

    @GetMapping("/{id}/fail")
    public Map<String, Object> failOrder(@PathVariable String id) {
        log.warn("Received request that will simulate a failure for order {}", id);
        return orderService.failOrder(id);
    }
}
