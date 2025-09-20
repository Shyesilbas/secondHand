package com.serhat.secondhand.agreements.controller;

import com.serhat.secondhand.agreements.entity.Agreement;
import com.serhat.secondhand.agreements.entity.enums.AgreementGroup;
import com.serhat.secondhand.agreements.entity.enums.AgreementType;
import com.serhat.secondhand.agreements.dto.AgreementDto;
import com.serhat.secondhand.agreements.dto.UserAgreementDto;
import com.serhat.secondhand.agreements.dto.request.AcceptAgreementRequest;
import com.serhat.secondhand.agreements.dto.request.CreateAgreementRequest;
import com.serhat.secondhand.agreements.dto.request.UpdateAgreementRequest;
import com.serhat.secondhand.agreements.mapper.AgreementMapper;
import com.serhat.secondhand.agreements.service.AgreementService;
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
    private final UserAgreementService userAgreementService;
    private final AgreementMapper agreementMapper;

    @PostMapping("/initialize")
    @Operation(summary = "Initialize all agreements", description = "Creates agreements for all types if they don't exist")
    public ResponseEntity<List<AgreementDto>> initializeAgreements() {
        log.info("Initializing agreements");
        var agreements = agreementService.createAgreements();
        var agreementDtos = agreementMapper.toDtoList(agreements);
        return ResponseEntity.ok(agreementDtos);
    }

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
            @RequestParam(value = "agreementGroup") AgreementGroup agreementGroup) {
        if (agreementGroup == null) {
            throw new IllegalArgumentException("agreementGroup parametresi zorunludur!");
        }
        var agreements = agreementService.getRequiredAgreements(agreementGroup);
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

    @PostMapping
    @Operation(summary = "Create new agreement", description = "Creates a new agreement")
    public ResponseEntity<AgreementDto> createAgreement(@Valid @RequestBody CreateAgreementRequest request) {
        var agreement = agreementService.createAgreementIfNotExists(request.getAgreementType());
        var agreementDto = agreementMapper.toDto(agreement);
        return ResponseEntity.ok(agreementDto);
    }

    @PutMapping("/{agreementId}")
    @Operation(summary = "Update agreement by ID", description = "Updates agreement version and content by ID. Version is auto-incremented if not provided.")
    public ResponseEntity<AgreementDto> updateAgreement(
            @PathVariable UUID agreementId,
            @Valid @RequestBody UpdateAgreementRequest request) {
        Agreement agreement;
        if (request.getVersion() != null && !request.getVersion().trim().isEmpty()) {
            // Manuel versiyon belirtildi
            agreement = agreementService.updateAgreementWithVersion(agreementId, request.getVersion(), request.getContent());
        } else {
            // Otomatik versiyonlama
            agreement = agreementService.updateAgreement(agreementId, request.getContent());
        }
        var agreementDto = agreementMapper.toDto(agreement);
        return ResponseEntity.ok(agreementDto);
    }

    @PutMapping("/type/{agreementType}")
    @Operation(summary = "Update agreement by type", description = "Updates agreement version and content by type. Version is auto-incremented if not provided.")
    public ResponseEntity<AgreementDto> updateAgreementByType(
            @PathVariable AgreementType agreementType,
            @Valid @RequestBody UpdateAgreementRequest request) {
        Agreement agreement;
        if (request.getVersion() != null && !request.getVersion().trim().isEmpty()) {
            // Manuel versiyon belirtildi
            agreement = agreementService.updateAgreementByTypeWithVersion(agreementType, request.getVersion(), request.getContent());
        } else {
            // Otomatik versiyonlama
            agreement = agreementService.updateAgreementByType(agreementType, request.getContent());
        }
        var agreementDto = agreementMapper.toDto(agreement);
        return ResponseEntity.ok(agreementDto);
    }

    @PostMapping("/accept")
    @Operation(summary = "Accept agreement", description = "User accepts an agreement")
    public ResponseEntity<UserAgreementDto> acceptAgreement(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AcceptAgreementRequest request) {
        var userAgreementDto = userAgreementService.acceptAgreement(user, request);
        return ResponseEntity.ok(userAgreementDto);
    }

    @GetMapping("/user/agreements")
    @Operation(summary = "Get user agreements", description = "Retrieves all agreements accepted by the user")
    public ResponseEntity<List<UserAgreementDto>> getUserAgreements(@AuthenticationPrincipal User user) {
        var userAgreements = userAgreementService.getUserAgreements(user);
        return ResponseEntity.ok(userAgreements);
    }

    @GetMapping("/user/status/{agreementType}")
    @Operation(summary = "Check specific agreement status", description = "Checks if user has accepted specific agreement type")
    public ResponseEntity<Boolean> hasUserAcceptedAgreement(
            @AuthenticationPrincipal User user,
            @PathVariable AgreementType agreementType) {
        var hasAccepted = userAgreementService.hasUserAcceptedAgreement(user, agreementType);
        return ResponseEntity.ok(hasAccepted);
    }

    @PostMapping("/admin/accept-all-users")
    @Operation(summary = "Accept agreements for all users", description = "Admin endpoint to accept required agreements for all existing users")
    public ResponseEntity<String> acceptAgreementsForAllUsers() {
        log.info("Admin requested to accept agreements for all users");
        userAgreementService.acceptRequiredAgreementsForAllUsers();
        return ResponseEntity.ok("Successfully accepted required agreements for all users");
    }

    /*
    @PostMapping("/admin/accept-user/{userId}")
    @Operation(summary = "Accept agreements for specific user", description = "Admin endpoint to accept required agreements for a specific user")
    public ResponseEntity<String> acceptAgreementsForUser(@PathVariable Long userId) {
        log.info("Admin requested to accept agreements for user ID: {}", userId);
        var user = userService.findById(userId);
        userAgreementService.acceptRequiredAgreementsForUser(user);
        return ResponseEntity.ok("Successfully accepted required agreements for user: " + user.getEmail());
    }

     */
}
