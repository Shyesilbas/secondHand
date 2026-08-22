package com.serhat.secondhand.core.config;

import com.serhat.secondhand.payment.contract.PaymentCompletedKafkaEvent;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.listener.CommonErrorHandler;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.util.backoff.FixedBackOff;

import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableKafka
public class KafkaConfig {

    public static final String PAYMENT_COMPLETED_TOPIC = "payment.completed.v1";
    public static final String PAYMENT_FAILED_TOPIC = "payment.failed.v1";
    public static final String PAYMENT_REFUNDED_TOPIC = "payment.refunded.v1";

    @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
    private String bootstrapServers;

    @Bean
    public ConsumerFactory<String, PaymentCompletedKafkaEvent> consumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        JsonDeserializer<PaymentCompletedKafkaEvent> jsonDeserializer =
                new JsonDeserializer<>(PaymentCompletedKafkaEvent.class);
        jsonDeserializer.addTrustedPackages("com.serhat.secondhand.*", "*");
        jsonDeserializer.setUseTypeHeaders(false);

        ErrorHandlingDeserializer<PaymentCompletedKafkaEvent> errorHandlingValueDeserializer =
                new ErrorHandlingDeserializer<>(jsonDeserializer);

        ErrorHandlingDeserializer<String> errorHandlingKeyDeserializer =
                new ErrorHandlingDeserializer<>(new StringDeserializer());

        return new DefaultKafkaConsumerFactory<String, PaymentCompletedKafkaEvent>(
                props, errorHandlingKeyDeserializer, errorHandlingValueDeserializer);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, PaymentCompletedKafkaEvent> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, PaymentCompletedKafkaEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        factory.setCommonErrorHandler(new DefaultErrorHandler(new FixedBackOff(1000L, 2L)));
        return factory;
    }

    @Bean
    public NewTopic paymentCompletedTopic(
            @Value("${app.kafka.topics.payment-completed-partitions:3}") int partitions,
            @Value("${app.kafka.topics.payment-completed-replicas:1}") int replicas) {
        return TopicBuilder.name(PAYMENT_COMPLETED_TOPIC)
                .partitions(partitions)
                .replicas(replicas)
                .build();
    }

    @Bean
    public NewTopic paymentFailedTopic(
            @Value("${app.kafka.topics.payment-failed-partitions:3}") int partitions,
            @Value("${app.kafka.topics.payment-failed-replicas:1}") int replicas) {
        return TopicBuilder.name(PAYMENT_FAILED_TOPIC)
                .partitions(partitions)
                .replicas(replicas)
                .build();
    }

    @Bean
    public NewTopic paymentRefundedTopic(
            @Value("${app.kafka.topics.payment-refunded-partitions:3}") int partitions,
            @Value("${app.kafka.topics.payment-refunded-replicas:1}") int replicas) {
        return TopicBuilder.name(PAYMENT_REFUNDED_TOPIC)
                .partitions(partitions)
                .replicas(replicas)
                .build();
    }
}
