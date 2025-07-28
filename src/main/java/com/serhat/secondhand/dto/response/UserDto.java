package com.serhat.secondhand.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.serhat.secondhand.entity.enums.AccountStatus;
import com.serhat.secondhand.entity.enums.Gender;
import com.serhat.secondhand.entity.enums.UserType;
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
} 