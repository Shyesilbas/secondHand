package com.serhat.secondhand.payment.mapper;

import com.serhat.secondhand.payment.dto.CreditCardDto;
import com.serhat.secondhand.payment.dto.CreditCardRequest;
import com.serhat.secondhand.payment.entity.CreditCard;
import com.serhat.secondhand.payment.helper.CreditCardHelper;
import com.serhat.secondhand.user.domain.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CreditCardMapper {

    @Mapping(target = "number", source = "number", qualifiedByName = "mask")
    @Mapping(target = "cvv", constant = "***")
    @Mapping(target = "expiryMonth", expression = "java(String.valueOf(card.getExpiryMonth()))")
    @Mapping(target = "expiryYear", expression = "java(String.valueOf(card.getExpiryYear()))")
    @Mapping(target = "amount", expression = "java(card.getAmount().toString())")
    @Mapping(target = "limit", expression = "java(card.getLimit().toString())")
    @Mapping(target = "totalSpent", expression = "java(card.getAmount().toString())")
    @Mapping(target = "limitLeft", expression = "java(card.getLimit().subtract(card.getAmount()).toString())")
    CreditCardDto toDto(CreditCard card);

    default CreditCard fromCreateRequest(CreditCardRequest request, User user) {
        return CreditCard.builder()
                .cardHolder(user)
                .number(CreditCardHelper.generateCardNumber())
                .cvv(CreditCardHelper.generateCvv())
                .expiryMonth(CreditCardHelper.generateExpiryMonth())
                .expiryYear(CreditCardHelper.generateExpiryYear())
                .amount(BigDecimal.ZERO)
                .limit(request.limit())
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Named("mask")
    static String maskNumber(String number) {
        return CreditCardHelper.maskCardNumber(number);
    }
}


