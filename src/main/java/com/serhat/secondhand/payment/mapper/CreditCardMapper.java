package com.serhat.secondhand.payment.mapper;

import com.serhat.secondhand.payment.dto.CreditCardDto;
import com.serhat.secondhand.payment.entity.CreditCard;
import com.serhat.secondhand.payment.helper.CreditCardHelper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CreditCardMapper {

    @Mapping(target = "number", source = "number", qualifiedByName = "mask")
    @Mapping(target = "cvv", constant = "***")
    @Mapping(target = "expiryMonth", expression = "java(String.valueOf(card.getExpiryMonth()))")
    @Mapping(target = "expiryYear", expression = "java(String.valueOf(card.getExpiryYear()))")
    @Mapping(target = "amount", expression = "java(card.getAmount().toString())")
    @Mapping(target = "limit", expression = "java(card.getLimit().toString())")
    CreditCardDto toDto(CreditCard card);

    @Named("mask")
    static String maskNumber(String number) {
        return CreditCardHelper.maskCardNumber(number);
    }
}


