package com.serhat.secondhand.payment.mapper;

import com.serhat.secondhand.payment.dto.BankDto;
import com.serhat.secondhand.payment.entity.Bank;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BankMapper {

    @Mapping(target = "holderName", source = "accountHolder.name")
    @Mapping(target = "holderSurname", source = "accountHolder.surname")
    BankDto toDto(Bank bank);
}


