package com.serhat.secondhand.campaign.api;

import com.serhat.secondhand.campaign.config.CampaignConfigProperties;
import com.serhat.secondhand.campaign.dto.CreateCampaignRequest;
import com.serhat.secondhand.campaign.dto.UpdateCampaignRequest;
import com.serhat.secondhand.campaign.application.ICampaignService;
import com.serhat.secondhand.campaign.util.CampaignErrorCodes;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.user.domain.entity.User;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/seller/campaigns")
@RequiredArgsConstructor
@Validated
public class CampaignController {

    private final ICampaignService campaignService;
    private final CampaignConfigProperties campaignConfigProperties;

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
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(required = false) Integer size) {
        int resolvedSize = size != null ? size : campaignConfigProperties.getListDefaultSize();
        if (resolvedSize <= 0) {
            return ResultResponses.of(Result.error(CampaignErrorCodes.CAMPAIGN_INVALID), HttpStatus.OK);
        }
        Pageable pageable = PageRequest.of(page, resolvedSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(campaignService.listMyCampaigns(currentUser.getId(), pageable));
    }
}


