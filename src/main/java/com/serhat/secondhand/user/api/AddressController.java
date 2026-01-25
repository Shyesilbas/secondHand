package com.serhat.secondhand.user.api;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.user.application.AddressService;
import com.serhat.secondhand.user.domain.dto.AddressDto;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {
    private final AddressService addressService;

    @GetMapping
    public ResponseEntity<List<AddressDto>> getAddresses(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(addressService.getAddressesByUserId(user.getId()));
    }

    @PostMapping
    public ResponseEntity<?> addAddress(@RequestBody AddressDto addressDto, @AuthenticationPrincipal User user) {
        var result = addressService.addAddress(user.getId(), addressDto);
        return handleResult(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAddress(@PathVariable Long id,
                                           @RequestBody AddressDto addressDto,
                                           @AuthenticationPrincipal User user) {
        var result = addressService.updateAddress(id, user.getId(), addressDto);
        return handleResult(result);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddress(@PathVariable Long id,
                                           @AuthenticationPrincipal User user) {
        var result = addressService.deleteAddress(id, user.getId());
        return result.isError() ? handleResult(result) : ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/main")
    public ResponseEntity<?> setMainAddress(@PathVariable Long id,
                                            @AuthenticationPrincipal User user) {
        var result = addressService.setMainAddress(id, user.getId());
        return handleResult(result);
    }

    private ResponseEntity<?> handleResult(Result<?> result) {
        if (result.isError()) {
            return ResponseEntity.badRequest().body(Map.of("error", result.getErrorCode()));
        }
        return ResponseEntity.ok(result.getData());
    }
}