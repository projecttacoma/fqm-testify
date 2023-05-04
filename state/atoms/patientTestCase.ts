import { atom } from 'recoil';

export interface TestCaseInfo {
  patient: fhir4.Patient;
  fullUrl: string;
  resources: fhir4.BundleEntry[];
  desiredPopulations?: string[];
}

export interface TestCase {
  [patientId: string]: TestCaseInfo;
}

export const patientTestCaseState = atom<TestCase>({
  key: 'patientTestCaseState',
  default: {}
});
