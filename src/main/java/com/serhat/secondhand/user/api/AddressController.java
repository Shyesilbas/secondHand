package com.serhat.secondhand.user.api;

import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.user.application.AddressService;
import com.serhat.secondhand.user.domain.dto.AddressDto;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
        return ResultResponses.ok(addressService.addAddress(user.getId(), addressDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAddress(@PathVariable Long id,
                                           @RequestBody AddressDto addressDto,
                                           @AuthenticationPrincipal User user) {
        return ResultResponses.ok(addressService.updateAddress(id, user.getId(), addressDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddress(@PathVariable Long id,
                                           @AuthenticationPrincipal User user) {
        return ResultResponses.noContent(addressService.deleteAddress(id, user.getId()));
    }

    @PostMapping("/{id}/main")
    public ResponseEntity<?> setMainAddress(@PathVariable Long id,
                                            @AuthenticationPrincipal User user) {
        return ResultResponses.ok(addressService.setMainAddress(id, user.getId()));
    }
}