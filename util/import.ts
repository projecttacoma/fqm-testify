import { TestCaseInfo } from '../state/atoms/patientTestCase';

export function bundleToTestCase(bundle: fhir4.Bundle): TestCaseInfo {
  if (!bundle.entry || bundle.entry.length === 0) {
    throw new Error('Bundle has no entries');
  }

  const patientEntry = bundle.entry.find(e => e.resource?.resourceType === 'Patient');

  const patientResource = patientEntry?.resource as fhir4.Patient | undefined;

  if (!patientResource) {
    throw new Error('Bundle does not contain a patient resource');
  }

  return {
    patient: patientResource,
    resources: bundle.entry
      .filter(e => e.resource?.resourceType !== 'Patient')
      .map(e => e.resource) as fhir4.FhirResource[]
  };
}
