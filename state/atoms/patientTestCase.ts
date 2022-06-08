import { atom } from 'recoil';

// TODO: We might evolve this interface to determine how best to store
// FHIR data associated with this patient
export interface TestCases {
  [patientId: string]: fhir4.Patient;
}

export const patientTestCaseState = atom<TestCases>({
  key: 'patientTestCaseState',
  default: {}
});
