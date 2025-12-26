package com.serhat.secondhand.ewallet.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class EWalletBalanceUtil {

    public static BigDecimal scale(BigDecimal value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    public static BigDecimal add(BigDecimal balance, BigDecimal amount) {
        return scale(balance.add(amount));
    }

    public static BigDecimal subtract(BigDecimal balance, BigDecimal amount) {
        return scale(balance.subtract(amount));
    }

    public static BigDecimal zero() {
        return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    }
}

