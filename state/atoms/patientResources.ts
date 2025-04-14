import { atom } from 'recoil';

// type DatedResource = {
//     bundle: fhir4.BundleEntry;
//     date: String;
//     dateType: String;
// }

export const patientResourcesAtom = atom<fhir4.BundleEntry[]>({
  key: 'patientResourcesAtom',
  default: []
});

export const filteredPatientResourcesAtom = atom<fhir4.BundleEntry[]>({
  key: 'filteredPatientResourcesAtom',
  default: []
});
