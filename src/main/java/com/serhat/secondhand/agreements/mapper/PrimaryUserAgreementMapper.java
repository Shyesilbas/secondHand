package com.serhat.secondhand.agreements.mapper;

import com.serhat.secondhand.agreements.dto.UserAgreementDto;
import com.serhat.secondhand.agreements.entity.UserAgreement;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@Primary
public class PrimaryUserAgreementMapper implements UserAgreementMapper {

    @Override
    public UserAgreementDto toDto(UserAgreement userAgreement) {
        if (userAgreement == null) {
            return null;
        }

        UserAgreementDto dto = new UserAgreementDto();
        dto.setUserAgreementId(userAgreement.getUserAgreementId());
        dto.setAcceptedDate(userAgreement.getAcceptedDate());
        dto.setAcceptedTheLastVersion(userAgreement.isAcceptedTheLastVersion());
        dto.setAcceptedVersion(userAgreement.getAcceptedVersion());

        if (userAgreement.getUser() != null) {
            dto.setUserId(userAgreement.getUser().getId());
        }

        if (userAgreement.getAgreement() != null) {
            dto.setAgreementId(userAgreement.getAgreement().getAgreementId());
            dto.setAgreementVersion(userAgreement.getAgreement().getVersion());
            if (userAgreement.getAgreement().getAgreementType() != null) {
                dto.setAgreementType(userAgreement.getAgreement().getAgreementType().name());
            }
        }

        return dto;
    }

    @Override
    public List<UserAgreementDto> toDtoList(List<UserAgreement> userAgreements) {
        if (userAgreements == null) {
            return null;
        }

        List<UserAgreementDto> dtos = new ArrayList<>(userAgreements.size());
        for (UserAgreement userAgreement : userAgreements) {
            dtos.add(toDto(userAgreement));
        }
        return dtos;
    }
}
