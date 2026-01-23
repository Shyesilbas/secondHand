package com.serhat.secondhand.campaign.api;

import com.serhat.secondhand.campaign.dto.CampaignDto;
import com.serhat.secondhand.campaign.dto.CreateCampaignRequest;
import com.serhat.secondhand.campaign.dto.UpdateCampaignRequest;
import com.serhat.secondhand.campaign.service.CampaignService;
import com.serhat.secondhand.core.result.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/seller/campaigns")
@RequiredArgsConstructor
public class CampaignController {

    private final CampaignService campaignService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateCampaignRequest request, Authentication authentication) {
        Result<CampaignDto> result = campaignService.create(request, authentication);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody UpdateCampaignRequest request, Authentication authentication) {
        Result<CampaignDto> result = campaignService.update(id, request, authentication);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id, Authentication authentication) {
        Result<Void> result = campaignService.delete(id, authentication);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<CampaignDto>> list(Authentication authentication) {
        return ResponseEntity.ok(campaignService.listMyCampaigns(authentication));
    }
}


