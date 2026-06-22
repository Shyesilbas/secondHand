package com.serhat.secondhand.user.api;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.user.application.MembershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/memberships")
@RequiredArgsConstructor
public class MembershipController {

    private final MembershipService membershipService;

    @GetMapping("/status")
    public ResponseEntity<?> getStatus(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = ((com.serhat.secondhand.user.domain.entity.User) userDetails).getId();
        return ResultResponses.ok(Result.success(membershipService.getStatus(userId)));
    }

    @PostMapping("/upgrade")
    public ResponseEntity<?> upgradeToPremium(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = ((com.serhat.secondhand.user.domain.entity.User) userDetails).getId();
        return ResultResponses.ok(Result.success(membershipService.upgradeToPremium(userId)));
    }

    @PostMapping("/cancel")
    public ResponseEntity<?> cancelSubscription(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = ((com.serhat.secondhand.user.domain.entity.User) userDetails).getId();
        return ResultResponses.ok(Result.success(membershipService.cancelSubscription(userId)));
    }
}
