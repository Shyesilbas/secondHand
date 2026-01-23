package com.serhat.secondhand.user.application;

import com.serhat.secondhand.user.domain.dto.AddressDto;
import com.serhat.secondhand.user.domain.entity.Address;
import com.serhat.secondhand.user.util.AddressErrorCodes;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.repository.AddressRepository;
import com.serhat.secondhand.user.domain.mapper.AddressMapper;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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

    public Result<AddressDto> addAddress(User user, AddressDto addressDto) {
        if (addressRepository.countByUser(user) >= 3) {
            return Result.error(AddressErrorCodes.MAX_ADDRESSES_EXCEEDED);
        }
        Address address = addressMapper.toEntity(addressDto);
        address.setUser(user);
        if (address.isMainAddress()) {
            selectAsMainAddress(user, address);
        }
        return Result.success(addressMapper.toDto(addressRepository.save(address)));
    }

    public Result<AddressDto> updateAddress(Long addressId, AddressDto updatedAddressDto, User user) {
        Address address = addressRepository.findById(addressId)
                .orElse(null);
        
        if (address == null) {
            return Result.error(AddressErrorCodes.ADDRESS_NOT_FOUND);
        }
        
        if (!address.getUser().getId().equals(user.getId())) {
            return Result.error(AddressErrorCodes.UNAUTHORIZED_ADDRESS_ACCESS);
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
        return Result.success(addressMapper.toDto(addressRepository.save(address)));
    }

    public Result<Void> deleteAddress(Long addressId, User user) {
        Address address = addressRepository.findById(addressId)
                .orElse(null);
        
        if (address == null) {
            return Result.error(AddressErrorCodes.ADDRESS_NOT_FOUND);
        }
        
        if (!address.getUser().getId().equals(user.getId())) {
            return Result.error(AddressErrorCodes.UNAUTHORIZED_ADDRESS_ACCESS);
        }
        
        addressRepository.delete(address);
        return Result.success();
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

    public Address getAddressById(@NotNull(message = "Shipping address ID is required") Long shippingAddressId) {
        return addressRepository.findById(shippingAddressId)
                .orElse(null);
    }
}
