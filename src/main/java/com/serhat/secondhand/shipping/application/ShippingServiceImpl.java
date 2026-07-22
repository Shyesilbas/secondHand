package com.serhat.secondhand.shipping.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.shipping.dto.ShippingDto;
import com.serhat.secondhand.shipping.entity.Shipping;
import com.serhat.secondhand.shipping.port.out.CargoProviderPort;
import com.serhat.secondhand.shipping.port.out.dto.CargoShipmentRequest;
import com.serhat.secondhand.shipping.port.out.dto.CargoShipmentResponse;
import com.serhat.secondhand.shipping.mapper.ShippingMapper;
import com.serhat.secondhand.shipping.repository.ShippingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.serhat.secondhand.user.domain.entity.User;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShippingServiceImpl implements ShippingService {

    private final ShippingRepository shippingRepository;
    private final ShippingMapper shippingMapper;
    private final List<CargoProviderPort> cargoProviders;

    @Override
    @Transactional
    public Result<ShippingDto> createShipmentForOrder(Long shippingId, String providerName) {
        return shippingRepository.findById(shippingId)
                .map(shipping -> {
                    CargoProviderPort provider = cargoProviders.stream()
                            .filter(p -> p.supports(providerName))
                            .findFirst()
                            .orElse(null);
                    
                    if (provider == null) {
                        return Result.<ShippingDto>error("Unsupported cargo provider: " + providerName);
                    }

                    User seller = shipping.getOrder().getOrderItems().get(0).getSeller();
                    String senderName = seller.getName() + " " + seller.getSurname();
                    String senderPhone = seller.getPhoneNumber();
                    String senderAddressLine = seller.getAddresses().stream()
                            .filter(com.serhat.secondhand.user.domain.entity.Address::isMainAddress)
                            .findFirst()
                            .map(a -> a.getAddressLine() + ", " + a.getCity())
                            .orElse("Adres Belirtilmemiş");

                    User buyer = shipping.getOrder().getUser();
                    String receiverPhone = buyer.getPhoneNumber();

                    // Create request from shipping data
                    CargoShipmentRequest request = CargoShipmentRequest.builder()
                            .orderId(shipping.getOrder().getExternalId())
                            .senderName(senderName)
                            .senderAddress(senderAddressLine)
                            .senderPhone(senderPhone)
                            .receiverName(shipping.getOrder().getName())
                            .receiverAddress(shipping.getOrder().getShippingAddress().getAddressLine() + ", " + shipping.getOrder().getShippingAddress().getCity())
                            .receiverPhone(receiverPhone)
                            .build();

                    CargoShipmentResponse response = provider.createShipment(request);

                    shipping.ship(
                            response.getProviderName(),
                            response.getTrackingNumber(),
                            response.getTrackingUrl(),
                            response.getProviderShipmentId(),
                            response.getLabelUrl(),
                            response.getEstimatedShippingCost()
                    );
                    Shipping saved = shippingRepository.save(shipping);
                    log.info("Shipping {} started with provider {} and tracking number {}", shippingId, providerName, response.getTrackingNumber());
                    return Result.success(shippingMapper.toDto(saved));
                })
                .orElseGet(() -> Result.error("Shipping not found with id: " + shippingId));
    }

    @Override
    @Transactional
    public Result<ShippingDto> completeShipping(Long shippingId) {
        return shippingRepository.findById(shippingId)
                .map(shipping -> {
                    shipping.markAsDelivered();
                    Shipping saved = shippingRepository.save(shipping);
                    log.info("Shipping {} marked as delivered", shippingId);
                    return Result.success(shippingMapper.toDto(saved));
                })
                .orElseGet(() -> Result.error("Shipping not found with id: " + shippingId));
    }

    @Override
    @Transactional
    public Result<Void> cancelShipping(Long shippingId) {
        return shippingRepository.findById(shippingId)
                .map(shipping -> {
                    shipping.cancel();
                    shippingRepository.save(shipping);
                    log.info("Shipping {} cancelled", shippingId);
                    return Result.<Void>success();
                })
                .orElseGet(() -> Result.error("Shipping not found with id: " + shippingId));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ShippingDto> getById(Long shippingId) {
        return shippingRepository.findById(shippingId)
                .map(shippingMapper::toDto);
    }
}
