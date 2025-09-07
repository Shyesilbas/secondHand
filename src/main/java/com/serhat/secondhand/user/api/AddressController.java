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
import java.util.Optional;

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
    public ResponseEntity<AddressDto> addAddress(@RequestBody AddressDto addressDto, Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        return ResponseEntity.ok(addressService.addAddress(user, addressDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressDto> updateAddress(@PathVariable Long id, @RequestBody AddressDto addressDto, Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        return ResponseEntity.ok(addressService.updateAddress(id, addressDto, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id, Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        addressService.deleteAddress(id, user);
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
