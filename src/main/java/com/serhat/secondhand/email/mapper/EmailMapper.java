package com.serhat.secondhand.email.mapper;

import com.serhat.secondhand.email.domain.entity.Email;
import com.serhat.secondhand.email.dto.EmailDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface EmailMapper {

    @Mapping(target = "sentAt", source = "createdAt")
    EmailDto toDto(Email email);
}


