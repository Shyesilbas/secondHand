package com.serhat.secondhand.payment.mapper;

import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface PaymentMapper {

    @Mapping(target = "paymentId", source = "id")
    @Mapping(target = "senderName", source = "fromUser.name")
    @Mapping(target = "senderSurname", source = "fromUser.surname")
    @Mapping(target = "receiverName", expression = "java(payment.getToUser() != null ? payment.getToUser().getName() : \"SYSTEM\")")
    @Mapping(target = "receiverSurname", expression = "java(payment.getToUser() != null ? payment.getToUser().getSurname() : \"\")")
    @Mapping(target = "listingTitle", ignore = true)
    @Mapping(target = "listingNo", ignore = true)
    @Mapping(target = "createdAt", source = "processedAt")
    @Mapping(target = "isSuccess", source = "success")
    PaymentDto toDto(Payment payment);
}


