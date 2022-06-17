import { atom } from 'recoil';

export const selectedPatientState = atom<string | null>({
  key: 'selectedPatientState',
  default: null
});
