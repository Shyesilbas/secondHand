package com.serhat.secondhand.auth.domain.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.serhat.secondhand.user.domain.entity.enums.Gender;
import com.serhat.secondhand.user.domain.entity.enums.UserType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    @Pattern(regexp = "^[a-zA-ZğüşöçıĞÜŞÖÇİ\\s]+$", message = "Name can only contain letters")
    private String name;

    @NotBlank(message = "Surname is required")
    @Size(min = 2, max = 50, message = "Surname must be between 2 and 50 characters")
    @Pattern(regexp = "^[a-zA-ZğüşöçıĞÜŞÖÇİ\\s]+$", message = "Surname can only contain letters")
    private String surname;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+?[0-9]\\d{1,14}$", message = "Please provide a valid phone number")
    private String phoneNumber;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&.])[A-Za-z\\d@$!%*?&.]+$",
             message = "Password must contain at least one uppercase letter, one lowercase letter, one digit and one special character")
    private String password;


    @NotNull(message = "Gender is required")
    private Gender gender;

    @JsonFormat(pattern = "dd/MM/yyyy")
    @Past(message = "Birth date must be in the past")
    private LocalDate birthdate;

    @NotNull(message = "User type is required")
    private UserType userType;
} 