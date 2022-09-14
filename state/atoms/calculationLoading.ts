import { atom } from 'recoil';

/**
 * Atom indicating if measureReports are being recalculated
 */
export const calculationLoading = atom<boolean>({
  key: 'calculationLoading',
  default: false
});
