package com.serhat.secondhand.user.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.user.domain.dto.AddressDto;
import com.serhat.secondhand.user.domain.entity.Address;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.mapper.AddressMapper;
import com.serhat.secondhand.user.domain.repository.AddressRepository;
import com.serhat.secondhand.user.util.AddressErrorCodes;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AddressService {

    private final AddressRepository addressRepository;
    private final AddressMapper addressMapper;
    private final IUserService userService;

    public List<AddressDto> getAddressesByUserId(Long userId) {
        return addressRepository.findByUserId(userId).stream()
                .map(addressMapper::toDto).toList();
    }

    @Transactional
    public Result<AddressDto> addAddress(Long userId, AddressDto addressDto) {
        if (addressRepository.countByUserId(userId) >= 3) {
            return Result.error(AddressErrorCodes.MAX_ADDRESSES_EXCEEDED);
        }

        var userResult = userService.findById(userId);

        if (userResult.isError()) {
            return Result.error(userResult.getErrorCode(), userResult.getMessage());
        }

        User user = userResult.getData();

        Address address = addressMapper.toEntity(addressDto);
        address.setUser(user);

        if (address.isMainAddress()) {
            addressRepository.resetMainAddressByUserId(userId);
        }

        return Result.success(addressMapper.toDto(addressRepository.save(address)));
    }

    @Transactional
    public Result<AddressDto> updateAddress(Long addressId, Long userId, AddressDto dto) {
        Address address = addressRepository.findById(addressId).orElse(null);
        if (address == null) return Result.error(AddressErrorCodes.ADDRESS_NOT_FOUND);
        if (!address.getUser().getId().equals(userId)) return Result.error(AddressErrorCodes.UNAUTHORIZED_ADDRESS_ACCESS);

        addressMapper.updateEntityFromDto(dto, address);

        if (dto.isMainAddress()) {
            addressRepository.resetMainAddressByUserId(userId);
            address.setMainAddress(true);
        }
        return Result.success(addressMapper.toDto(addressRepository.save(address)));
    }

    @Transactional
    public Result<Void> deleteAddress(Long addressId, Long userId) {
        Address address = addressRepository.findById(addressId).orElse(null);

        if (address == null) return Result.error(AddressErrorCodes.ADDRESS_NOT_FOUND);
        if (!address.getUser().getId().equals(userId)) return Result.error(AddressErrorCodes.UNAUTHORIZED_ADDRESS_ACCESS);

        addressRepository.delete(address);
        return Result.success();
    }

    @Transactional
    public Result<Void> setMainAddress(Long addressId, Long userId) {
        Address address = addressRepository.findById(addressId).orElse(null);

        if (address == null) return Result.error(AddressErrorCodes.ADDRESS_NOT_FOUND);
        if (!address.getUser().getId().equals(userId)) return Result.error(AddressErrorCodes.UNAUTHORIZED_ADDRESS_ACCESS);

        addressRepository.resetMainAddressByUserId(userId);
        address.setMainAddress(true);
        addressRepository.save(address);

        return Result.success();
    }

    public Address getAddressById(@NotNull Long addressId) {
        return addressRepository.findById(addressId).orElse(null);
    }
}