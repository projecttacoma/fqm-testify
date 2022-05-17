import { atom } from 'recoil';

/**
 * Atom tracking and controlling the value of uploaded measure bundle
 */
export const measureBundleState = atom({
  key: 'measureBundleState',
  default: null
});
