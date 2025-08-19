package com.serhat.secondhand.user.domain.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.serhat.secondhand.auth.domain.entity.Token;
import com.serhat.secondhand.core.verification.Verification;
import com.serhat.secondhand.email.domain.entity.Email;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.payment.entity.Bank;
import com.serhat.secondhand.payment.entity.CreditCard;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import com.serhat.secondhand.user.domain.entity.enums.Gender;
import com.serhat.secondhand.user.domain.entity.enums.Provider;
import jakarta.persistence.*;
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

    @Enumerated(EnumType.STRING)
    private Provider provider;

    @Column(name = "surname", nullable = false)
    private String surname;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "phone", nullable = false, unique = true)
    private String phoneNumber;

    @Column(name = "password")
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

    @Column(name = "last_login_date")
    private LocalDateTime lastLoginDate;

    private String lastLoginIp;

    @Column(nullable = false)
    private boolean accountVerified;


    @Enumerated(EnumType.STRING)
    @Column(name = "acc_status", nullable = false)
    private AccountStatus accountStatus;

    @OneToMany(mappedBy = "seller", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Listing> listings = new ArrayList<>();

    @OneToOne(mappedBy = "accountHolder", cascade = CascadeType.ALL, orphanRemoval = true)
    private Bank bank;

    @OneToOne(mappedBy = "cardHolder", cascade = CascadeType.ALL, orphanRemoval = true)
    private CreditCard creditCard;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Email> emails = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Token> tokens = new ArrayList<>();
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Verification> verifications = new ArrayList<>();

    @OneToMany(mappedBy = "fromUser", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Payment> fromPayments = new ArrayList<>();

    @OneToMany(mappedBy = "toUser", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Payment> toPayments = new ArrayList<>();


    @Override
    public boolean isAccountNonExpired() {
        return true;
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
        List<SimpleGrantedAuthority> auth = new ArrayList<>();
        auth.add(new SimpleGrantedAuthority("ROLE_USER"));
        return auth;
    }

    @Override
    public String getUsername() {
        return email;
    }
}
