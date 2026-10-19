package com.serhat.secondhand.payment;

import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.repository.OrderItemRepository;
import com.serhat.secondhand.payment.application.PaymentKafkaProducer;
import com.serhat.secondhand.payment.contract.PaymentCompletedKafkaEvent;
import com.serhat.secondhand.payment.entity.Payment;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PaymentKafkaProducerTest {

    @SuppressWarnings("unchecked")
    private final KafkaTemplate<String, Object> template = mock(KafkaTemplate.class);
    private final OrderItemRepository items = mock(OrderItemRepository.class);
    private final PaymentKafkaProducer producer = new PaymentKafkaProducer(template, items);

    private PaymentCompletedKafkaEvent sent(Payment p) {
        when(template.send(anyString(), anyString(), any())).thenReturn(new CompletableFuture<>());
        producer.sendPaymentCompleted(p);
        ArgumentCaptor<Object> c = ArgumentCaptor.forClass(Object.class);
        verify(template).send(anyString(), anyString(), c.capture());
        return (PaymentCompletedKafkaEvent) c.getValue();
    }

    private int sentQuantity(Payment p) {
        return sent(p).quantity();
    }

    @Test
    void usesOrderItemQuantity() {
        OrderItem item = new OrderItem();
        item.setQuantity(3);
        when(items.findById(7L)).thenReturn(Optional.of(item));
        assertEquals(3, sentQuantity(Payment.builder().id(UUID.randomUUID()).orderItemId(7L).build()));
    }

    @Test
    void defaultsToOneWhenItemMissingOrAbsent() {
        when(items.findById(8L)).thenReturn(Optional.empty());
        assertEquals(1, sentQuantity(Payment.builder().id(UUID.randomUUID()).orderItemId(8L).build()));
    }

    @Test
    void carriesTransactionType() {
        Payment p = Payment.builder().id(UUID.randomUUID())
                .transactionType(com.serhat.secondhand.payment.entity.PaymentTransactionType.LISTING_CREATION).build();
        assertEquals("LISTING_CREATION", sent(p).transactionType());
    }
}
