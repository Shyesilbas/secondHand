package com.serhat.secondhand.user.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;

/**
 * Fields of a user that any signed-in visitor may see on a public profile page.
 * Contact and personal data (email, phone, birthdate, gender) and account internals stay in {@link UserDto}.
 */
public record PublicUserProfileDto(
        Long id,
        String name,
        String surname,
        @JsonFormat(pattern = "dd/MM/yyyy") LocalDate accountCreationDate,
        boolean accountVerified) {

    public static PublicUserProfileDto from(UserDto user) {
        return new PublicUserProfileDto(user.id(), user.name(), user.surname(),
                user.accountCreationDate(), user.accountVerified());
    }
}
