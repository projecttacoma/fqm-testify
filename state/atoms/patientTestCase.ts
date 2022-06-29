import { atom } from 'recoil';

export interface TestCases {
  [patientId: string]: {
    patient: fhir4.Patient;
    resources: fhir4.Resource[];
  };
}

export const patientTestCaseState = atom<TestCases>({
  key: 'patientTestCaseState',
  default: {}
});
