package com.serhat.secondhand.agreements.entity.enums;

import lombok.Getter;

@Getter
public enum AgreementGroup {
    REGISTER(new AgreementType[]{AgreementType.TERMS_OF_SERVICE, AgreementType.PRIVACY_POLICY, AgreementType.KVKK});

    private final AgreementType[] requiredTypes;

    AgreementGroup(AgreementType[] requiredTypes) {
        this.requiredTypes = requiredTypes;
    }

}
