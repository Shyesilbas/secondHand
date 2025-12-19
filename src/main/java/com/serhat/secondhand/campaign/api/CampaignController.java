package com.serhat.secondhand.campaign.api;

import com.serhat.secondhand.campaign.dto.CampaignDto;
import com.serhat.secondhand.campaign.dto.CreateCampaignRequest;
import com.serhat.secondhand.campaign.dto.UpdateCampaignRequest;
import com.serhat.secondhand.campaign.service.CampaignService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/seller/campaigns")
@RequiredArgsConstructor
public class CampaignController {

    private final CampaignService campaignService;

    @PostMapping
    public ResponseEntity<CampaignDto> create(@RequestBody CreateCampaignRequest request, Authentication authentication) {
        return ResponseEntity.ok(campaignService.create(request, authentication));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CampaignDto> update(@PathVariable UUID id, @RequestBody UpdateCampaignRequest request, Authentication authentication) {
        return ResponseEntity.ok(campaignService.update(id, request, authentication));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, Authentication authentication) {
        campaignService.delete(id, authentication);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<CampaignDto>> list(Authentication authentication) {
        return ResponseEntity.ok(campaignService.listMyCampaigns(authentication));
    }
}

