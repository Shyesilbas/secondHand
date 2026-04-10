package com.serhat.secondhand.agreements.application;

import com.serhat.secondhand.agreements.entity.UserAgreement;
import org.springframework.stereotype.Component;

@Component
public class AgreementAcceptanceBackfillHelper {

    public boolean shouldBackfillAcceptedVersion(UserAgreement userAgreement) {
        if (userAgreement == null) return false;
        if (!userAgreement.isAcceptedTheLastVersion()) return false;
        if (userAgreement.getAgreement() == null) return false;
        if (userAgreement.getAgreement().getVersion() == null) return false;
        if (userAgreement.getAgreement().getUpdatedDate() == null) return false;
        if (userAgreement.getAcceptedDate() == null) return false;
        return !userAgreement.getAcceptedDate().isBefore(userAgreement.getAgreement().getUpdatedDate());
    }
}
