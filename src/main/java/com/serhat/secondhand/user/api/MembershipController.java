package com.serhat.secondhand.user.api;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.user.application.MembershipService;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.dto.MembershipUpgradeRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/memberships")
@RequiredArgsConstructor
public class MembershipController {

    private final MembershipService membershipService;

    @GetMapping("/status")
    public ResponseEntity<?> getStatus(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = ((User) userDetails).getId();
        return ResultResponses.ok(Result.success(membershipService.getStatus(userId)));
    }

    @PostMapping("/upgrade")
    public ResponseEntity<?> upgradeToPremium(@AuthenticationPrincipal UserDetails userDetails, @RequestBody MembershipUpgradeRequest request) {
        Long userId = ((User) userDetails).getId();
        return ResultResponses.ok(Result.success(membershipService.upgradeToPremium(userId, request)));
    }

    @PostMapping("/cancel")
    public ResponseEntity<?> cancelSubscription(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = ((User) userDetails).getId();
        return ResultResponses.ok(Result.success(membershipService.cancelSubscription(userId)));
    }

    @PostMapping("/toggle-auto-renew")
    public ResponseEntity<?> toggleAutoRenew(@AuthenticationPrincipal UserDetails userDetails, @RequestParam boolean autoRenew) {
        Long userId = ((User) userDetails).getId();
        return ResultResponses.ok(Result.success(membershipService.toggleAutoRenew(userId, autoRenew)));
    }
}
