package com.serhat.secondhand.user.domain.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import com.serhat.secondhand.user.domain.entity.enums.UserType;
import com.serhat.secondhand.user.domain.entity.enums.Gender;
import jakarta.persistence.*;
import jdk.jfr.Timestamp;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "surname", nullable = false)
    private String surname;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "phone", nullable = false, unique = true)
    private String phoneNumber;

    @Column(name = "password", nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", nullable = false)
    private Gender gender;

    @JsonFormat(pattern = "dd/MM/yyyy")
    @Column(name = "birthdate")
    private LocalDate birthdate;

    @CreatedDate
    @Column(name = "acc_creation_date")
    private LocalDate accountCreationDate;

    @Timestamp
    @Column(name = "last_login_date")
    private LocalDateTime lastLoginDate;

    private String LastLoginIp;

    @Enumerated(EnumType.STRING)
    @Column(name = "acc_type", nullable = false)
    private UserType userType;

    @Enumerated(EnumType.STRING)
    @Column(name = "acc_status", nullable = false)
    private AccountStatus accountStatus;

    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();

        switch (userType) {
            case BUYER:
                authorities.add(new SimpleGrantedAuthority("ROLE_BUYER"));
                break;
            case SELLER:
                authorities.add(new SimpleGrantedAuthority("ROLE_SELLER"));
                break;
            case BOTH:
                authorities.add(new SimpleGrantedAuthority("ROLE_BUYER"));
                authorities.add(new SimpleGrantedAuthority("ROLE_SELLER"));
                break;
        }

        return authorities;
    }

    @Override
    public String getUsername() {
        return email;
    }
}
