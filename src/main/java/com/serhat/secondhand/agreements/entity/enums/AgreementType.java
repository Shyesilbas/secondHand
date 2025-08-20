package com.serhat.secondhand.agreements.entity.enums;

public enum AgreementType {
    TERMS_OF_SERVICE,
    PRIVACY_POLICY,
    KVKK;
    
    public boolean isRequiredForRegistration() {
        return this == TERMS_OF_SERVICE || this == PRIVACY_POLICY || this == KVKK;
    }
    
    public static AgreementType[] getRequiredForRegistration() {
        return new AgreementType[]{TERMS_OF_SERVICE, PRIVACY_POLICY, KVKK};
    }
}
