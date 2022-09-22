import { atom } from 'recoil';

export interface TestCaseInfo {
  patient: fhir4.Patient;
  resources: fhir4.FhirResource[];
  desiredPopulations?: string[];
}

export interface TestCase {
  [patientId: string]: TestCaseInfo;
}

export const patientTestCaseState = atom<TestCase>({
  key: 'patientTestCaseState',
  default: {}
});
