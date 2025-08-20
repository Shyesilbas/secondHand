package com.serhat.secondhand.agreements.mapper;

import com.serhat.secondhand.agreements.entity.Agreement;
import com.serhat.secondhand.agreements.dto.AgreementDto;
import com.serhat.secondhand.agreements.dto.request.CreateAgreementRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.time.LocalDate;
import java.util.List;

@Mapper(componentModel = "spring", imports = {LocalDate.class})
public interface AgreementMapper {
    
    AgreementMapper INSTANCE = Mappers.getMapper(AgreementMapper.class);
    
    @Mapping(target = "agreementId", ignore = true)
    @Mapping(target = "createdDate", expression = "java(LocalDate.now())")
    @Mapping(target = "updatedDate", expression = "java(LocalDate.now())")
    Agreement toEntity(CreateAgreementRequest request);
    
    AgreementDto toDto(Agreement agreement);
    
    List<AgreementDto> toDtoList(List<Agreement> agreements);
    
    @Mapping(target = "updatedDate", expression = "java(LocalDate.now())")
    @Mapping(target = "agreementType", source = "request.agreementType")
    @Mapping(target = "version", source = "request.version")
    @Mapping(target = "content", source = "request.content")
    @Mapping(target = "agreementId", source = "agreement.agreementId")
    @Mapping(target = "createdDate", source = "agreement.createdDate")
    Agreement updateFromRequest(CreateAgreementRequest request, Agreement agreement);
}
