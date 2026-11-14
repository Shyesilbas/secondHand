package com.serhat.secondhand.payment.api;

import org.junit.jupiter.api.Test;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;

class PaymentControllerSurfaceTest {

    /**
     * Payments are created only by flows that price them on the server (checkout, listing fee,
     * showcase, membership). A generic endpoint taking amount, type and status from the client must not exist.
     */
    @Test
    void controllerExposesNoGenericPayEndpoint() {
        boolean hasPay = Arrays.stream(PaymentController.class.getDeclaredMethods())
                .map(method -> method.getAnnotation(PostMapping.class))
                .filter(mapping -> mapping != null)
                .flatMap(mapping -> Arrays.stream(mapping.value().length > 0 ? mapping.value() : mapping.path()))
                .anyMatch("/pay"::equals);

        assertThat(hasPay).isFalse();
    }
}
