package com.serhat.secondhand.agreements.entity.enums;

import lombok.Getter;

@Getter
public enum AgreementGroup {
    REGISTER(new AgreementType[]{AgreementType.TERMS_OF_SERVICE, AgreementType.PRIVACY_POLICY, AgreementType.KVKK}),
    ONLINE_PAYMENT(new AgreementType[]{AgreementType.DISTANCE_SELLING, AgreementType.PAYMENT_TERMS});

    private final AgreementType[] requiredTypes;

    AgreementGroup(AgreementType[] requiredTypes) {
        this.requiredTypes = requiredTypes;
    }

}
