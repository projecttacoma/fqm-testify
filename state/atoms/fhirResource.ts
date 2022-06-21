import { atom } from 'recoil';

export interface TestCases {
  [resourceId: string]: {
    selectedPatient: string | null;
    resource: fhir4.Resource;
  };
}

export const fhirResourceState = atom<TestCases>({
  key: 'fhirResourceState',
  default: {}
});
