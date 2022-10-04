import { atom } from 'recoil';

export const cqfmTestMRLookupState = atom<Record<string, fhir4.MeasureReport>>({
  key: 'cqfmTestMRLookupState',
  default: {}
});
