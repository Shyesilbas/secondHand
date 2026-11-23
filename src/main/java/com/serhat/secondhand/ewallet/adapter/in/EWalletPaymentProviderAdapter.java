package com.serhat.secondhand.ewallet.adapter.in;

import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentResult;
import com.serhat.secondhand.payment.port.out.PaymentProviderPort;
import com.serhat.secondhand.ewallet.application.IEWalletService;
import com.serhat.secondhand.ewallet.validator.EWalletValidator;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class EWalletPaymentProviderAdapter implements PaymentProviderPort {

    private final IEWalletService eWalletService;
    private final EWalletValidator eWalletValidator;

    @Override
    public boolean supports(String providerName) {
        return "EWALLET".equalsIgnoreCase(providerName);
    }

    @Override
    public boolean canProcess(User fromUser, User toUser, BigDecimal amount) {
        return eWalletValidator.hasSufficientBalance(fromUser, amount);
    }

    @Override
    public PaymentResult process(User fromUser, User toUser, BigDecimal amount, UUID listingId, PaymentRequest request) {
        PaymentResult result = eWalletService.processEWalletPayment(fromUser, toUser, amount, listingId);
        // Platform fees are income of the system account right away; item payments are held in escrow instead.
        if (result.success() && toUser != null && request != null && request.transactionType() != null
                && request.transactionType().isPlatformFee()) {
            eWalletService.creditWalletQuietly(toUser, amount);
        }
        return result;
    }
}
