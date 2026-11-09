package com.serhat.secondhand.ai.agent.query;

import com.serhat.secondhand.order.dto.OrderListFilter;
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
        if (userId == null) {
            return new AgentContextSection(SOURCE, "Unauthenticated user.", "skipped");
        }
        try {
            var orderResult = orderQueryService.getUserOrders(userId, OrderListFilter.NONE, PageRequest.of(0, MAX_ITEMS));
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

            String orderDetails = orders.stream()
                    .limit(MAX_ITEMS)
                    .map(OrderAgentContextAdapter::formatOrderLine)
                    .collect(Collectors.joining("; "));

            String summary = "Recent order count=" + orders.size()
                    + ", statuses=" + statusCounts
                    + (orderDetails.isBlank() ? "" : ", details=[" + orderDetails + "]");

            return new AgentContextSection(SOURCE, summary, "ok");
        } catch (Exception e) {
            log.warn("Failed to build order context for user {}: {}", userId, e.getMessage());
            return new AgentContextSection(SOURCE, "Order data is temporarily unavailable.", "unavailable");
        }
    }

    private static String formatOrderLine(OrderDto o) {
        String items = o.getOrderItems() == null ? "-" : o.getOrderItems().stream()
                .map(item -> item.getListing() != null && item.getListing().getTitle() != null
                        ? item.getListing().getTitle().trim()
                        : null)
                .filter(v -> v != null && !v.isBlank())
                .limit(3)
                .collect(Collectors.joining(" + "));
        String amount = o.getTotalAmount() != null ? o.getTotalAmount().toPlainString() : "-";
        String cur = o.getCurrency() != null ? o.getCurrency().name() : "";
        String delivery = o.getDeliveryMethod() != null ? o.getDeliveryMethod().name() : "-";
        return "%s(status=%s, payment=%s, delivery=%s, total=%s %s, items=%s)".formatted(
                o.getOrderNumber() != null ? o.getOrderNumber() : "-",
                o.getStatus() != null ? o.getStatus().name() : "UNKNOWN",
                o.getPaymentStatus() != null ? o.getPaymentStatus().name() : "-",
                delivery,
                amount,
                cur,
                items.isBlank() ? "-" : items
        );
    }
}
