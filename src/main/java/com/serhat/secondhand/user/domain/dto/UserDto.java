package com.serhat.secondhand.user.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import com.serhat.secondhand.user.domain.entity.enums.Gender;
import com.serhat.secondhand.user.domain.entity.enums.UserType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String name;
    private String surname;
    private String email;
    private String phoneNumber;
    private Gender gender;
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate birthdate;
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate accountCreationDate;
    private UserType userType;
    private AccountStatus accountStatus;
    private String fullName;
    private boolean canSell;
    private boolean canBuy;

    public UserDto(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.surname = user.getSurname();
        this.email = user.getEmail();
        this.phoneNumber = user.getPhoneNumber();
        this.gender = user.getGender();
        this.birthdate = user.getBirthdate();
        this.accountCreationDate = user.getAccountCreationDate();
        this.userType = user.getUserType();
        this.accountStatus = user.getAccountStatus();
        this.fullName = user.getName() + " " + user.getSurname();
        this.canSell = canUserSell(user.getUserType());
        this.canBuy = canUserBuy(user.getUserType());
    }

    private boolean canUserSell(UserType userType) {
        return userType == UserType.SELLER || userType == UserType.BOTH;
    }

    private boolean canUserBuy(UserType userType) {
        return userType == UserType.BUYER || userType == UserType.BOTH;
    }
} 