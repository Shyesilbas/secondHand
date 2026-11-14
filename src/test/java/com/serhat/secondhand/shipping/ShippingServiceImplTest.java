package com.serhat.secondhand.shipping;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.shipping.application.ShippingServiceImpl;
import com.serhat.secondhand.shipping.dto.ShippingDto;
import com.serhat.secondhand.shipping.entity.Shipping;
import com.serhat.secondhand.shipping.entity.enums.ShippingStatus;
import com.serhat.secondhand.shipping.mapper.ShippingMapper;
import com.serhat.secondhand.shipping.port.out.CargoProviderPort;
import com.serhat.secondhand.shipping.port.out.dto.CargoShipmentRequest;
import com.serhat.secondhand.shipping.port.out.dto.CargoShipmentResponse;
import com.serhat.secondhand.shipping.repository.ShippingRepository;
import com.serhat.secondhand.user.domain.entity.Address;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ShippingServiceImplTest {

    @Mock private ShippingRepository shippingRepository;
    @Mock private ShippingMapper shippingMapper;
    @Mock private CargoProviderPort cargoProviderPort;

    private ShippingServiceImpl shippingService;
    private Shipping shipping;
    private UUID orderExternalId;

    @BeforeEach
    void setUp() {
        shippingService = new ShippingServiceImpl(shippingRepository, shippingMapper, List.of(cargoProviderPort));
        orderExternalId = UUID.randomUUID();

        User seller = User.builder()
                .id(1L)
                .name("Ali")
                .surname("Veli")
                .phoneNumber("+905551112233")
                .addresses(List.of(Address.builder()
                        .addressLine("Seller St 1")
                        .city("Istanbul")
                        .mainAddress(true)
                        .build()))
                .build();
        User buyer = User.builder().id(2L).phoneNumber("+905559998877").build();
        Order order = Order.builder()
                .id(10L)
                .externalId(orderExternalId)
                .name("Order Receiver")
                .user(buyer)
                .shippingAddress(Address.builder().addressLine("Buyer Ave 5").city("Ankara").build())
                .orderItems(List.of(OrderItem.builder().seller(seller).build()))
                .build();
        shipping = Shipping.builder().id(100L).order(order).build();
    }

    @Test
    void createShipmentForOrder_unsupportedProvider_returnsError() {
        when(shippingRepository.findById(100L)).thenReturn(Optional.of(shipping));
        when(cargoProviderPort.supports("UnknownCargo")).thenReturn(false);

        Result<ShippingDto> result = shippingService.createShipmentForOrder(100L, "UnknownCargo");

        assertThat(result.isError()).isTrue();
        assertThat(result.getMessage()).contains("Unsupported cargo provider");
        verify(shippingRepository, org.mockito.Mockito.never()).save(any());
    }

    @Test
    void createShipmentForOrder_validProvider_shipsAndSavesDto() {
        CargoShipmentResponse response = CargoShipmentResponse.builder()
                .providerName("JetKargo")
                .providerShipmentId("SHIP-1")
                .trackingNumber("TRK-123")
                .trackingUrl("https://track.example/TRK-123")
                .labelUrl("https://label.example/1.pdf")
                .estimatedShippingCost(new BigDecimal("49.90"))
                .build();
        ShippingDto dto = ShippingDto.builder().id(100L).status(ShippingStatus.IN_TRANSIT).trackingNumber("TRK-123").build();

        when(shippingRepository.findById(100L)).thenReturn(Optional.of(shipping));
        when(cargoProviderPort.supports("JetKargo")).thenReturn(true);
        when(cargoProviderPort.createShipment(any())).thenReturn(response);
        when(shippingRepository.save(shipping)).thenReturn(shipping);
        when(shippingMapper.toDto(shipping)).thenReturn(dto);

        Result<ShippingDto> result = shippingService.createShipmentForOrder(100L, "JetKargo");

        assertThat(result.isSuccess()).isTrue();
        assertThat(shipping.getStatus()).isEqualTo(ShippingStatus.IN_TRANSIT);
        assertThat(shipping.getTrackingNumber()).isEqualTo("TRK-123");

        ArgumentCaptor<CargoShipmentRequest> requestCaptor = ArgumentCaptor.forClass(CargoShipmentRequest.class);
        verify(cargoProviderPort).createShipment(requestCaptor.capture());
        assertThat(requestCaptor.getValue().getOrderId()).isEqualTo(orderExternalId);
        assertThat(requestCaptor.getValue().getSenderAddress()).isEqualTo("Seller St 1, Istanbul");
        assertThat(requestCaptor.getValue().getReceiverAddress()).isEqualTo("Buyer Ave 5, Ankara");
    }

    @Test
    void completeShipping_andCancelShipping_updateStateAndHandleMissing() {
        ShippingDto deliveredDto = ShippingDto.builder().id(100L).status(ShippingStatus.DELIVERED).build();
        when(shippingRepository.findById(100L)).thenReturn(Optional.of(shipping));
        when(shippingRepository.save(shipping)).thenReturn(shipping);
        when(shippingMapper.toDto(shipping)).thenReturn(deliveredDto);

        Result<ShippingDto> delivered = shippingService.completeShipping(100L);
        assertThat(delivered.isSuccess()).isTrue();
        assertThat(shipping.getStatus()).isEqualTo(ShippingStatus.DELIVERED);
        assertThat(shipping.getDeliveredAt()).isNotNull();

        Result<Void> cancelled = shippingService.cancelShipping(100L);
        assertThat(cancelled.isSuccess()).isTrue();
        assertThat(shipping.getStatus()).isEqualTo(ShippingStatus.CANCELLED);

        when(shippingRepository.findById(999L)).thenReturn(Optional.empty());
        assertThat(shippingService.cancelShipping(999L).isError()).isTrue();
        verify(shippingRepository, org.mockito.Mockito.never()).delete(any());
    }
}
