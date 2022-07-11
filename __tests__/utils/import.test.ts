import { bundleToTestCase } from '../../util/import';

const TEST_PATIENT: fhir4.Patient = {
  resourceType: 'Patient',
  id: 'test-patient'
};

const TEST_CONDITION: fhir4.Condition = {
  resourceType: 'Condition',
  id: 'test-patient',
  subject: {
    reference: 'Patient/test-patient'
  }
};

describe('bundleToTestCase', () => {
  it('should properly generate test case from bundle', () => {
    const bundle: fhir4.Bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      entry: [
        {
          resource: TEST_PATIENT
        },
        {
          resource: TEST_CONDITION
        }
      ]
    };

    const result = bundleToTestCase(bundle);

    expect(result).toEqual({
      patient: TEST_PATIENT,
      resources: [TEST_CONDITION]
    });
  });

  it('should throw error with undefined bundle entry array', () => {
    const bundleNoEntries: fhir4.Bundle = {
      resourceType: 'Bundle',
      type: 'collection'
    };

    expect(() => bundleToTestCase(bundleNoEntries)).toThrowError('Bundle has no entries');
  });

  it('should throw error with empty bundle entry array', () => {
    const bundleNoEntries: fhir4.Bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      entry: []
    };

    expect(() => bundleToTestCase(bundleNoEntries)).toThrowError('Bundle has no entries');
  });

  it('should throw error with no patient resource', () => {
    const bundleNoPatient: fhir4.Bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      entry: [
        {
          resource: TEST_CONDITION
        }
      ]
    };

    expect(() => bundleToTestCase(bundleNoPatient)).toThrowError('Bundle does not contain a patient resource');
  });
});
