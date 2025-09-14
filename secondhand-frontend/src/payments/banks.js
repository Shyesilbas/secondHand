
export const BankDto = (data) => ({
    id: data.id || data.ID || null,
    IBAN: data.IBAN || '',
    balance: data.balance || 0,
    holderName: data.holderName || '',
    holderSurname: data.holderSurname || ''
});


export const BANK_FIELD_LABELS = {
    IBAN: 'IBAN',
    balance: 'Balance',
    holderName: 'Account Holder Name',
    holderSurname: 'Account Holder Surname'
};

