import { atom } from 'recoil';

export const patientResourcesAtom = atom<fhir4.BundleEntry[]>({
  key: 'patientResourcesAtom',
  default: []
});
