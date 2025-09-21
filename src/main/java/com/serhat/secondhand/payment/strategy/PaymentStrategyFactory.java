package com.serhat.secondhand.payment.strategy;

import com.serhat.secondhand.payment.entity.PaymentType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PaymentStrategyFactory {
    private final List<PaymentStrategy> strategies;
    private Map<PaymentType, PaymentStrategy> strategyMap;

    private void ensureMap() {
        if (strategyMap == null) {
            strategyMap = strategies.stream().collect(Collectors.toMap(PaymentStrategy::getPaymentType, Function.identity()));
        }
    }

    public PaymentStrategy getStrategy(PaymentType type) {
        ensureMap();
        PaymentStrategy strategy = strategyMap.get(type);
        if (strategy == null) throw new IllegalArgumentException("No strategy for type: " + type);
        return strategy;
    }
}
