import { atom } from 'recoil';

/**
 * Atom indicating if trustMetaProfile should be set to true
 */
export const trustMetaProfileState = atom<boolean>({
  key: 'trustMetaProfileState',
  default: false
});
