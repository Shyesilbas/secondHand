package com.serhat.secondhand.auth.domain.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.serhat.secondhand.user.domain.entity.enums.Gender;
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
public class OAuthCompleteRequest {

    // Google OAuth2 başarılı login sonrası backend tarafından üretilip frontend'e iletilen kısa ömürlü imzalı token.
    // Sunucu, kullanıcının kimliğini (email/sub) yalnızca bu token'dan kabul eder; istemcinin
    // bağımsız olarak gönderdiği email gibi alanlar token ile çapraz doğrulanır.
    @NotBlank
    private String registrationToken;

    @NotBlank
    private String name;

    @NotBlank
    private String surname;

    // Token'daki email ile eşleşmek zorundadır; eşleşmezse istek reddedilir.
    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Pattern(regexp = "^\\+?[0-9]\\d{1,14}$")
    private String phoneNumber;

    @NotNull
    private Gender gender;

    @JsonFormat(pattern = "dd/MM/yyyy")
    @Past
    private LocalDate birthdate;
}


