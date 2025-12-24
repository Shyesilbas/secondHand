package com.serhat.secondhand.coupon.service;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.coupon.dto.ActiveCouponDto;
import com.serhat.secondhand.coupon.dto.CouponDto;
import com.serhat.secondhand.coupon.dto.CreateCouponRequest;
import com.serhat.secondhand.coupon.dto.UpdateCouponRequest;
import com.serhat.secondhand.coupon.entity.Coupon;
import com.serhat.secondhand.coupon.entity.CouponRedemption;
import com.serhat.secondhand.coupon.mapper.CouponMapper;
import com.serhat.secondhand.coupon.repository.CouponRedemptionRepository;
import com.serhat.secondhand.coupon.repository.CouponRepository;
import com.serhat.secondhand.coupon.util.CouponErrorCodes;
import com.serhat.secondhand.coupon.validator.CouponValidator;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponRedemptionRepository couponRedemptionRepository;
    private final CouponMapper couponMapper;
    private final CouponValidator couponValidator;

    public CouponDto create(CreateCouponRequest request) {
        Coupon coupon = couponMapper.fromCreateRequest(request);
        coupon.setCode(normalizeCode(coupon.getCode()));
        coupon.setEligibleTypes(normalizeEligibleTypes(coupon.getEligibleTypes()));

        couponValidator.validateForCreateOrUpdate(coupon);
        return couponMapper.toDto(couponRepository.save(coupon));
    }

    public CouponDto update(UUID id, UpdateCouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new BusinessException(CouponErrorCodes.COUPON_NOT_FOUND));

        couponMapper.applyUpdate(coupon, request);
        coupon.setEligibleTypes(normalizeEligibleTypes(coupon.getEligibleTypes()));

        couponValidator.validateForCreateOrUpdate(coupon);
        return couponMapper.toDto(couponRepository.save(coupon));
    }

    public void redeem(String code, User user, Order order) {
        if (code == null || code.isBlank() || user == null) {
            return;
        }

        Coupon coupon = couponRepository.findByCodeIgnoreCase(normalizeCode(code))
                .orElseThrow(() -> new BusinessException(CouponErrorCodes.COUPON_NOT_FOUND));

        CouponRedemption redemption = CouponRedemption.builder()
                .coupon(coupon)
                .user(user)
                .order(order)
                .build();

        couponRedemptionRepository.save(redemption);
    }

    @Transactional(readOnly = true)
    public List<CouponDto> listAll() {
        return couponRepository.findAll()
                .stream()
                .map(couponMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ActiveCouponDto> listActiveForUser(User user) {
        return couponRepository.findActiveNow(LocalDateTime.now())
                .stream()
                .map(coupon -> couponMapper.toActiveDto(coupon, user))
                .toList();
    }

    @Transactional(readOnly = true)
    public Coupon getValidCouponOrThrow(
            String code,
            User user,
            Set<ListingType> cartTypes,
            java.math.BigDecimal eligibleSubtotal
    ) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(normalizeCode(code))
                .orElseThrow(() -> new BusinessException(CouponErrorCodes.COUPON_NOT_FOUND));

        couponValidator.validateUsable(coupon, user);

        Set<ListingType> effectiveEligibleTypes =
                coupon.getEligibleTypes() == null || coupon.getEligibleTypes().isEmpty()
                        ? defaultEligibleTypes()
                        : coupon.getEligibleTypes();

        boolean applicable = cartTypes != null
                && cartTypes.stream().anyMatch(effectiveEligibleTypes::contains);

        if (!applicable) {
            throw new BusinessException(CouponErrorCodes.COUPON_NOT_APPLICABLE);
        }

        if (coupon.getMinSubtotal() != null
                && eligibleSubtotal != null
                && eligibleSubtotal.compareTo(coupon.getMinSubtotal()) < 0) {
            throw new BusinessException(CouponErrorCodes.COUPON_NOT_APPLICABLE);
        }

        return coupon;
    }

    private String normalizeCode(String code) {
        return code == null ? null : code.trim().toUpperCase();
    }

    private Set<ListingType> normalizeEligibleTypes(Set<ListingType> types) {
        if (types == null || types.isEmpty()) {
            return defaultEligibleTypes();
        }
        if (types.contains(ListingType.REAL_ESTATE) || types.contains(ListingType.VEHICLE)) {
            throw new BusinessException(CouponErrorCodes.COUPON_NOT_APPLICABLE);
        }
        return types;
    }

    private Set<ListingType> defaultEligibleTypes() {
        EnumSet<ListingType> all = EnumSet.allOf(ListingType.class);
        all.remove(ListingType.REAL_ESTATE);
        all.remove(ListingType.VEHICLE);
        return all;
    }
}


