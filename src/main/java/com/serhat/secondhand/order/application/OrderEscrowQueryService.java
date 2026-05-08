package com.serhat.secondhand.order.application;

import com.serhat.secondhand.escrow.application.EscrowService;
import com.serhat.secondhand.user.application.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class OrderEscrowQueryService {

    private final EscrowService escrowService;
    private final IUserService userService;

    @Transactional(readOnly = true)
    public BigDecimal getPendingEscrowAmount(Long sellerId) {
        var sellerResult = userService.findById(sellerId);
        if (sellerResult.isError()) {
            return BigDecimal.ZERO;
        }
        return escrowService.getPendingEscrowAmount(sellerResult.getData());
    }
}
