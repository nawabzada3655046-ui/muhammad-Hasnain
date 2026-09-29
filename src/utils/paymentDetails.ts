export const ALL_PAYMENT_ACCOUNTS_TITLE = 'Muhammad Hasnain';

export interface PaymentAccount {
  id: 'jazzcash' | 'easypaisa' | 'ubl';
  name: string;
  accountNumber: string;
  accountTitle: string;
}

export const PAYMENT_ACCOUNTS: Record<string, PaymentAccount> = {
  jazzcash: {
    id: 'jazzcash',
    name: 'JazzCash',
    accountNumber: '03048539583',
    accountTitle: 'Muhammad Hasnain',
  },
  easypaisa: {
    id: 'easypaisa',
    name: 'Easypaisa',
    accountNumber: '03432782295',
    accountTitle: 'Muhammad Hasnain',
  },
  ubl: {
    id: 'ubl',
    name: 'UBL Bank',
    accountNumber: '0564327905374',
    accountTitle: 'Muhammad Hasnain',
  },
};
