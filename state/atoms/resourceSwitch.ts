import { atom } from 'recoil';

/**
 * Atom indicating if resources on a patient bundle are to be minimized using the
 * data requirements of the provided measure bundle
 */
export const resourceSwitchOn = atom<boolean>({
  key: 'resourceSwitchOn',
  default: false
});
