import { atom } from 'recoil';

/**
 * Atom tracking and controlling the value of uploaded measure bundle
 */
export const measureBundleState = atom<{ name: string; content: fhir4.Bundle | null }>({
  key: 'measureBundleState',
  default: {
    name: '',
    content: null
  }
});
