package com.serhat.secondhand.user;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.serhat.secondhand.user.domain.dto.PublicUserProfileDto;
import com.serhat.secondhand.user.domain.dto.UserDto;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class PublicUserProfileDtoTest {

    @Test
    void publicProfile_doesNotExposeContactOrPersonalData() throws Exception {
        UserDto user = UserDto.builder()
                .id(5L).name("Ayse").surname("Yilmaz")
                .email("ayse@example.com").phoneNumber("5551112233")
                .birthdate(LocalDate.of(1990, 1, 2))
                .accountCreationDate(LocalDate.of(2024, 3, 4))
                .accountVerified(true)
                .build();

        String json = new ObjectMapper().registerModule(new JavaTimeModule())
                .writeValueAsString(PublicUserProfileDto.from(user));

        assertThat(json).contains("\"name\":\"Ayse\"", "\"accountCreationDate\":\"04/03/2024\"", "\"accountVerified\":true");
        assertThat(json).doesNotContain("email", "phone", "birthdate", "gender", "role", "accountStatus");
    }
}
