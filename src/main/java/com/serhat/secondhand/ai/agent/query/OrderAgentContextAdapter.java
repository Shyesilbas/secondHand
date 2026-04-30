package com.serhat.secondhand.ai.agent.query;

import com.serhat.secondhand.ai.agent.dto.AgentUiContextRequest;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.application.OrderQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderAgentContextAdapter implements AgentContextAdapter {

    private static final String SOURCE = "orders";
    private static final int MAX_ITEMS = 5;

    private final OrderQueryService orderQueryService;

    @Override
    public AgentContextSection fetch(Long userId, AgentUiContextRequest uiContext) {
        try {
            var orderResult = orderQueryService.getUserOrders(userId, PageRequest.of(0, MAX_ITEMS));
            if (orderResult.isError() || orderResult.getData() == null) {
                return new AgentContextSection(SOURCE, "No orders found for this user.", "ok");
            }
            List<OrderDto> orders = orderResult.getData().getContent();

            if (orders.isEmpty()) {
                return new AgentContextSection(SOURCE, "No orders found for this user.", "ok");
            }

            Map<String, Long> statusCounts = orders.stream()
                    .collect(Collectors.groupingBy(
                            o -> o.getStatus() == null ? "UNKNOWN" : o.getStatus().name(),
                            LinkedHashMap::new,
                            Collectors.counting()
                    ));

            String orderNumbers = orders.stream()
                    .map(OrderDto::getOrderNumber)
                    .filter(v -> v != null && !v.isBlank())
                    .limit(3)
                    .collect(Collectors.joining(", "));

            String summary = "Recent order count=" + orders.size()
                    + ", statuses=" + statusCounts
                    + (orderNumbers.isBlank() ? "" : ", examples=" + orderNumbers);

            return new AgentContextSection(SOURCE, summary, "ok");
        } catch (Exception e) {
            log.warn("Failed to build order context for user {}: {}", userId, e.getMessage());
            return new AgentContextSection(SOURCE, "Order data is temporarily unavailable.", "unavailable");
        }
    }
}
