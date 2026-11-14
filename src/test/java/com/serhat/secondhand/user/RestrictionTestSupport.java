package com.serhat.secondhand.user;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.user.application.UserRestrictionService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/** Restriction service mock that lets every action through, for tests not about moderation. */
public final class RestrictionTestSupport {

    private RestrictionTestSupport() {
    }

    public static UserRestrictionService allowAll() {
        UserRestrictionService service = mock(UserRestrictionService.class);
        when(service.check(any(), any())).thenReturn(Result.success());
        return service;
    }
}
