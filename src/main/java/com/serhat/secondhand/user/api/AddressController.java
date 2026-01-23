package com.serhat.secondhand.user.api;

import com.serhat.secondhand.user.application.AddressService;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.Address;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.dto.AddressDto;
import com.serhat.secondhand.user.domain.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {
    private final AddressService addressService;
    private final UserService userService;
    private final AddressRepository addressRepository;

    @GetMapping
    public ResponseEntity<List<AddressDto>> getAddresses(Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        return ResponseEntity.ok(addressService.getAddressesByUser(user));
    }

    @PostMapping
    public ResponseEntity<?> addAddress(@RequestBody AddressDto addressDto, Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        var result = addressService.addAddress(user, addressDto);
        if (result.isError()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAddress(@PathVariable Long id, @RequestBody AddressDto addressDto, Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        var result = addressService.updateAddress(id, addressDto, user);
        if (result.isError()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddress(@PathVariable Long id, Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        var result = addressService.deleteAddress(id, user);
        if (result.isError()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/main")
    public ResponseEntity<Void> selectAsMainAddress(@PathVariable Long id, Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Address not found"));
        if (!address.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized");
        }
        addressService.selectAsMainAddress(user, address);
        return ResponseEntity.ok().build();
    }
}
