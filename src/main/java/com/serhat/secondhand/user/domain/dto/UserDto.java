package com.serhat.secondhand.user.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import com.serhat.secondhand.user.domain.entity.enums.Gender;
import lombok.Builder;

import java.time.LocalDate;


@Builder
public record UserDto(
        Long id,
        String name,
        String surname,
        String email,
        String phoneNumber,
        Gender gender,
        @JsonFormat(pattern = "dd/MM/yyyy")
        LocalDate birthdate,
        @JsonFormat(pattern = "dd/MM/yyyy")
        LocalDate accountCreationDate,
        AccountStatus accountStatus,
        String fullName,
        boolean accountVerified,
        boolean canSell


) {}