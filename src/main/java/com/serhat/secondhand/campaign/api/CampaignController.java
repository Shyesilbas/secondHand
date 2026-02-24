package com.serhat.secondhand.campaign.api;

import com.serhat.secondhand.campaign.dto.CreateCampaignRequest;
import com.serhat.secondhand.campaign.dto.UpdateCampaignRequest;
import com.serhat.secondhand.campaign.service.ICampaignService;
import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.user.domain.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/seller/campaigns")
@RequiredArgsConstructor
public class CampaignController {

    private final ICampaignService campaignService;

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CreateCampaignRequest request, @AuthenticationPrincipal User currentUser) {
        return ResultResponses.ok(campaignService.create(currentUser.getId(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @Valid @RequestBody UpdateCampaignRequest request, @AuthenticationPrincipal User currentUser) {
        return ResultResponses.ok(campaignService.update(currentUser.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id, @AuthenticationPrincipal User currentUser) {
        return ResultResponses.noContent(campaignService.delete(currentUser.getId(), id));
    }

    @GetMapping
    public ResponseEntity<?> list(
            @AuthenticationPrincipal User currentUser,
            @PageableDefault(size = 5, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(campaignService.listMyCampaigns(currentUser.getId(), pageable));
    }
}


