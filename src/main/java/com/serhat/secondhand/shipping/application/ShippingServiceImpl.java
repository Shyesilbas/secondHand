package com.serhat.secondhand.shipping.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.shipping.dto.ShippingDto;
import com.serhat.secondhand.shipping.entity.Shipping;
import com.serhat.secondhand.shipping.entity.enums.Carrier;
import com.serhat.secondhand.shipping.mapper.ShippingMapper;
import com.serhat.secondhand.shipping.repository.ShippingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShippingServiceImpl implements ShippingService {

    private final ShippingRepository shippingRepository;
    private final ShippingMapper shippingMapper;

    @Override
    @Transactional
    public Result<ShippingDto> startShipping(Long shippingId, Carrier carrier, String trackingNumber) {
        return shippingRepository.findById(shippingId)
                .map(shipping -> {
                    shipping.ship(carrier, trackingNumber);
                    Shipping saved = shippingRepository.save(shipping);
                    log.info("Shipping {} started with carrier {} and tracking number {}", shippingId, carrier, trackingNumber);
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
