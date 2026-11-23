package com.serhat.secondhand.user.application;

import com.serhat.secondhand.core.config.PlatformFeeConfig;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Resolves the platform system user that receives fees and commissions and funds platform coupons. */
@Service
@RequiredArgsConstructor
public class SystemAccountService {

    public static final String SYSTEM_ACCOUNT_MISSING = "SYSTEM_ACCOUNT_MISSING";

    private final UserRepository userRepository;
    private final PlatformFeeConfig platformFeeConfig;

    /** Fails fast when the seeded system user is gone: fees must never fall back to a placeholder. */
    @Transactional(readOnly = true)
    public User getSystemUser() {
        return userRepository.findByEmail(platformFeeConfig.getSystemAccountEmail())
                .orElseThrow(() -> new BusinessException("System account is not configured",
                        HttpStatus.INTERNAL_SERVER_ERROR, SYSTEM_ACCOUNT_MISSING));
    }

    public boolean isSystemAccount(User user) {
        return user != null && platformFeeConfig.getSystemAccountEmail().equalsIgnoreCase(user.getEmail());
    }
}
