package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.user.domain.entity.User;

public record PaymentPreCheckContext(User fromUser, User toUser) {
}

