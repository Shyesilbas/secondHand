package com.serhat.secondhand.agreements.mapper;

import com.serhat.secondhand.agreements.entity.UserAgreement;
import com.serhat.secondhand.agreements.dto.UserAgreementDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.time.LocalDate;
import java.util.List;

@Mapper(componentModel = "spring", imports = {LocalDate.class})
public interface UserAgreementMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "agreementId", source = "agreement.agreementId")
    @Mapping(target = "agreementType", source = "agreement.agreementType")
    @Mapping(target = "agreementVersion", source = "agreement.version")
    @Mapping(target = "acceptedTheLastVersion", source = "acceptedTheLastVersion")
    UserAgreementDto toDto(UserAgreement userAgreement);
    
    List<UserAgreementDto> toDtoList(List<UserAgreement> userAgreements);
}
