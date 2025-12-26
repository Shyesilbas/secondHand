package com.serhat.secondhand.payment.mapper;

import com.serhat.secondhand.payment.dto.BankDto;
import com.serhat.secondhand.payment.entity.Bank;
import com.serhat.secondhand.payment.helper.IbanGenerator;
import com.serhat.secondhand.user.domain.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BankMapper {

    @Mapping(target = "holderName", source = "accountHolder.name")
    @Mapping(target = "holderSurname", source = "accountHolder.surname")
    BankDto toDto(Bank bank);

    default Bank fromCreateRequest(User user) {
        return Bank.builder()
                .accountHolder(user)
                .balance(BigDecimal.ZERO)
                .createdAt(LocalDateTime.now())
                .IBAN(IbanGenerator.generateIban())
                .build();
    }
}


