import { atom } from 'recoil';

/**
 * Atom indicating if trustMetaProfile should be set to true
 */
export const trustMetaProfile = atom<boolean>({
  key: 'trustMetaProfile',
  default: false
});
