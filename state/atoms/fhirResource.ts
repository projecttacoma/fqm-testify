import { atom } from 'recoil';

export interface TestCases {
  [resourceId: string]: fhir4.Resource;
}

export const fhirResourceState = atom<TestCases>({
  key: 'fhirResourceState',
  default: {}
});
