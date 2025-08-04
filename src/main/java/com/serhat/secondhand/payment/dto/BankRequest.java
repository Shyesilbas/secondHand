package com.serhat.secondhand.payment.dto;

import com.serhat.secondhand.user.domain.entity.User;

public record BankRequest(
        User user
) {
}
