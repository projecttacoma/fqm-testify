import { atom } from 'recoil';

/**
 * Atom tracking and controlling the value of uploaded measure bundle
 */
export const measureBundleState = atom<File | null>({
  key: 'measureBundleState',
  default: null
});
