package com.serhat.secondhand.user.application;

import com.serhat.secondhand.user.domain.dto.AddressDto;
import com.serhat.secondhand.user.domain.entity.Address;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.repository.AddressRepository;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import com.serhat.secondhand.user.domain.mapper.AddressMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AddressService {
    private final AddressRepository addressRepository;
    private final AddressMapper addressMapper;

    public List<AddressDto> getAddressesByUser(User user) {
        return addressRepository.findByUser(user)
                .stream()
                .map(addressMapper::toDto)
                .toList();
    }

    public AddressDto addAddress(User user, AddressDto addressDto) {
        if (addressRepository.countByUser(user) >= 3) {
            throw new IllegalStateException("A user can have at most 3 addresses.");
        }
        Address address = addressMapper.toEntity(addressDto);
        address.setUser(user);
        if (address.isMainAddress()) {
            selectAsMainAddress(user, address);
        }
        return addressMapper.toDto(addressRepository.save(address));
    }

    public AddressDto updateAddress(Long addressId, AddressDto updatedAddressDto, User user) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("Address not found"));
        if (!address.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized");
        }
        address.setAddressLine(updatedAddressDto.getAddressLine());
        address.setCity(updatedAddressDto.getCity());
        address.setState(updatedAddressDto.getState());
        address.setPostalCode(updatedAddressDto.getPostalCode());
        address.setCountry(updatedAddressDto.getCountry());
        address.setAddressType(updatedAddressDto.getAddressType());
        if (updatedAddressDto.isMainAddress()) {
            selectAsMainAddress(user, address);
        }
        return addressMapper.toDto(addressRepository.save(address));
    }

    public void deleteAddress(Long addressId, User user) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("Address not found"));
        if (!address.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized");
        }
        addressRepository.delete(address);
    }

    @Transactional
    public void selectAsMainAddress(User user, Address address) {
        List<Address> addresses = addressRepository.findByUser(user);
        for (Address addr : addresses) {
            if (addr.isMainAddress()) {
                addr.setMainAddress(false);
                addressRepository.save(addr);
            }
        }

        address.setMainAddress(true);
        addressRepository.save(address);
    }

}
