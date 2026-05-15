package com.serhat.secondhand.campaign.api;

import com.serhat.secondhand.campaign.application.ICampaignService;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.result.ResultResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/campaigns")
@RequiredArgsConstructor
@Tag(name = "Campaign Public", description = "Public campaign operations")
public class PublicCampaignController {

    private final ICampaignService campaignService;
    private final com.serhat.secondhand.campaign.mapper.CampaignMapper campaignMapper;

    @GetMapping("/active")
    public ResponseEntity<?> getActiveCampaignsForSellers(@RequestParam List<Long> sellerIds) {
        var dtos = campaignService.loadActiveCampaignsForSellers(sellerIds)
                .stream()
                .map(campaignMapper::toDto)
                .toList();
        return ResultResponses.ok(Result.success(dtos));
    }
}
