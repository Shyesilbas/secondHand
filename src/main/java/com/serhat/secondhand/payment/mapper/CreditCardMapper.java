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

    @Mapping(target = "id",         source = "id")
    @Mapping(target = "cardLabel",  source = "cardLabel")
    @Mapping(target = "number",     source = "number", qualifiedByName = "mask")
    @Mapping(target = "cvv",        constant = "***")
    @Mapping(target = "expiryMonth", expression = "java(String.valueOf(card.getExpiryMonth()))")
    @Mapping(target = "expiryYear",  expression = "java(String.valueOf(card.getExpiryYear()))")
    @Mapping(target = "amount",      expression = "java(card.getAmount().toString())")
    @Mapping(target = "limit",       expression = "java(card.getLimit().toString())")
    @Mapping(target = "totalSpent",  expression = "java(card.getAmount().toString())")
    @Mapping(target = "limitLeft",   expression = "java(card.getLimit().subtract(card.getAmount()).toString())")
    CreditCardDto toDto(CreditCard card);

    default CreditCard fromCreateRequest(CreditCardRequest request, User user) {
        String number   = request.isManual() ? request.cardNumber().replaceAll("[\\s-]", "") : CreditCardHelper.generateCardNumber();
        String cvv      = request.isManual() ? request.cvv()         : CreditCardHelper.generateCvv();
        int expiryMonth = request.isManual() ? request.expiryMonth() : CreditCardHelper.generateExpiryMonth();
        int expiryYear  = request.isManual() ? request.expiryYear()  : CreditCardHelper.generateExpiryYear();

        return CreditCard.builder()
                .cardHolder(user)
                .cardLabel(request.cardLabel())
                .number(number)
                .cvv(cvv)
                .expiryMonth(expiryMonth)
                .expiryYear(expiryYear)
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
