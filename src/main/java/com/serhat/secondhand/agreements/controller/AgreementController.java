package com.serhat.secondhand.agreements.controller;

import com.serhat.secondhand.agreements.entity.enums.AgreementType;
import com.serhat.secondhand.agreements.dto.AgreementDto;
import com.serhat.secondhand.agreements.dto.UserAgreementDto;
import com.serhat.secondhand.agreements.dto.request.AcceptAgreementRequest;
import com.serhat.secondhand.agreements.mapper.AgreementMapper;
import com.serhat.secondhand.agreements.service.AgreementService;
import com.serhat.secondhand.agreements.service.AgreementRequirementService;
import com.serhat.secondhand.agreements.service.UserAgreementService;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/agreements")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Agreements", description = "Agreement management endpoints")
public class AgreementController {

    private final AgreementService agreementService;
    private final AgreementRequirementService agreementRequirementService;
    private final UserAgreementService userAgreementService;
    private final AgreementMapper agreementMapper;

    @GetMapping
    @Operation(summary = "Get all agreements", description = "Retrieves all available agreements")
    public ResponseEntity<List<AgreementDto>> getAllAgreements() {
        var agreements = agreementService.getAllAgreements();
        var agreementDtos = agreementMapper.toDtoList(agreements);
        return ResponseEntity.ok(agreementDtos);
    }

    @GetMapping("/required")
    @Operation(summary = "Get required agreements for a group", description = "Retrieves agreements required for a specific group (e.g. registration, payment, etc.)")
    public ResponseEntity<List<AgreementDto>> getRequiredAgreements(
            @RequestParam(value = "agreementGroup") String agreementGroup) {
        if (agreementGroup == null || agreementGroup.trim().isEmpty()) {
            throw new IllegalArgumentException("agreementGroup parameter is required");
        }
        var agreements = agreementRequirementService.getRequiredAgreements(agreementGroup);
        var agreementDtos = agreementMapper.toDtoList(agreements);
        return ResponseEntity.ok(agreementDtos);
    }

    @GetMapping("/{agreementType}")
    @Operation(summary = "Get agreement by type", description = "Retrieves agreement by its type")
    public ResponseEntity<AgreementDto> getAgreementByType(@PathVariable AgreementType agreementType) {
        var agreement = agreementService.getAgreementByType(agreementType);
        var agreementDto = agreementMapper.toDto(agreement);
        return ResponseEntity.ok(agreementDto);
    }

    @PostMapping("/accept")
    @Operation(summary = "Accept agreement", description = "User accepts an agreement")
    public ResponseEntity<UserAgreementDto> acceptAgreement(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody AcceptAgreementRequest request) {
        var userAgreementDto = userAgreementService.acceptAgreement(currentUser.getId(), request);
        return ResponseEntity.ok(userAgreementDto);
    }

    @GetMapping("/user/agreements")
    @Operation(summary = "Get user agreements", description = "Retrieves all agreements accepted by the user")
    public ResponseEntity<List<UserAgreementDto>> getUserAgreements(@AuthenticationPrincipal User user) {
        var userAgreements = userAgreementService.getUserAgreements(user.getId());
        return ResponseEntity.ok(userAgreements);
    }

    @GetMapping("/user/status/{agreementType}")
    @Operation(summary = "Check specific agreement status", description = "Checks if user has accepted specific agreement type")
    public ResponseEntity<Boolean> hasUserAcceptedAgreement(
            @AuthenticationPrincipal User user,
            @PathVariable AgreementType agreementType) {
        var hasAccepted = userAgreementService.hasUserAcceptedAgreement(user.getId(), agreementType);
        return ResponseEntity.ok(hasAccepted);
    }

    @GetMapping("/user/acceptance-history/{agreementId}")
    @Operation(summary = "Get user acceptance history for an agreement", description = "Retrieves all acceptance records for a specific agreement by the current user")
    public ResponseEntity<List<UserAgreementDto>> getUserAcceptanceHistory(
            @PathVariable UUID agreementId,
            @AuthenticationPrincipal User user) {
        var history = userAgreementService.getUserAcceptanceHistory(user.getId(), agreementId);
        return ResponseEntity.ok(history);
    }

}
