import { bundleToTestCase, isTestCaseMeasureReport } from '../../util/import';

const TEST_PATIENT: fhir4.Patient = {
  resourceType: 'Patient',
  id: 'test-patient'
};

const TEST_CONDITION: fhir4.Condition = {
  resourceType: 'Condition',
  id: 'test-condition',
  subject: {
    reference: 'Patient/test-patient'
  }
};
const NON_TEST_CASE_MEASURE_REPORT: fhir4.MeasureReport = {
  resourceType: 'MeasureReport',
  id: 'test-mr',
  measure: 'http://hl7.org/fhir/us/cqfmeasures/Measure/EXM130',
  period: {
    start: '2019-01-01T00:00:00.000Z',
    end: '2019-12-31T00:00:00.000Z'
  },
  status: 'complete',
  type: 'individual'
};
const TEST_CASE_MEASURE_REPORT: fhir4.MeasureReport = {
  resourceType: 'MeasureReport',
  id: 'test-case-mr',
  measure: 'http://hl7.org/fhir/us/cqfmeasures/Measure/EXM130',
  period: {
    start: '2019-01-01T00:00:00.000Z',
    end: '2019-12-31T00:00:00.000Z'
  },
  status: 'complete',
  type: 'individual',
  meta: {
    profile: ['http://hl7.org/fhir/us/cqfmeasures/StructureDefinition/test-case-cqfm']
  },
  modifierExtension: [
    {
      url: 'http://hl7.org/fhir/us/cqfmeasures/StructureDefinition/cqfm-isTestCase',
      valueBoolean: true
    }
  ],
  group: [
    {
      population: [
        {
          code: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/measure-population',
                code: 'initial-population',
                display: 'Initial Population'
              }
            ]
          },
          count: 1
        },
        {
          code: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/measure-population',
                code: 'numerator',
                display: 'Numerator'
              }
            ]
          },
          count: 1
        },
        {
          code: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/measure-population',
                code: 'denominator',
                display: 'Denominator'
              }
            ]
          },
          count: 1
        },
        {
          code: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/measure-population',
                code: 'denominator-exclusion',
                display: 'Denominator Exclusion'
              }
            ]
          },
          count: 0
        }
      ]
    }
  ]
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

    const result = bundleToTestCase(bundle, [], {});

    expect(result).toEqual({
      patient: TEST_PATIENT,
      fullUrl: 'urn:uuid:test-patient',
      resources: [{ resource: TEST_CONDITION, fullUrl: 'urn:uuid:test-condition' }],
      minResources: false,
      desiredPopulations: []
    });
  });

  it('should throw error with undefined bundle entry array', () => {
    const bundleNoEntries: fhir4.Bundle = {
      resourceType: 'Bundle',
      type: 'collection'
    };

    expect(() => bundleToTestCase(bundleNoEntries, [], {})).toThrowError('Bundle has no entries');
  });

  it('should throw error with empty bundle entry array', () => {
    const bundleNoEntries: fhir4.Bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      entry: []
    };

    expect(() => bundleToTestCase(bundleNoEntries, [], {})).toThrowError('Bundle has no entries');
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

    expect(() => bundleToTestCase(bundleNoPatient, [], {})).toThrowError('Bundle does not contain a patient resource');
  });

  it('should properly populate desired population array when cqfm test case MeasureReport present', () => {
    const bundle: fhir4.Bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      entry: [
        {
          resource: TEST_PATIENT
        },
        {
          resource: TEST_CONDITION
        },
        {
          resource: TEST_CASE_MEASURE_REPORT
        }
      ]
    };

    const result = bundleToTestCase(
      bundle,
      ['initial-population', 'numerator', 'denominator', 'denominator-exclusion'],
      {},
      'http://hl7.org/fhir/us/cqfmeasures/Measure/EXM130'
    );

    expect(result).toEqual({
      patient: TEST_PATIENT,
      fullUrl: 'urn:uuid:test-patient',
      resources: [{ resource: TEST_CONDITION, fullUrl: 'urn:uuid:test-condition' }],
      minResources: false,
      desiredPopulations: ['initial-population', 'numerator', 'denominator']
    });
  });
  it('should throw error when cqfm test case measure report contains invalid populations', () => {
    const bundle: fhir4.Bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      entry: [
        {
          resource: TEST_PATIENT
        },
        {
          resource: TEST_CONDITION
        },
        {
          resource: TEST_CASE_MEASURE_REPORT
        }
      ]
    };
    expect(() =>
      bundleToTestCase(bundle, ['initial-population'], {}, 'http://hl7.org/fhir/us/cqfmeasures/Measure/EXM130')
    ).toThrowError(
      'Found invalid population codes: numerator, denominator. Ensure all imported desired populations are valid with uploaded measure populations'
    );
  });
  it('should throw error when multiple cqfm test case measure reports are included in bundle', () => {
    const bundle: fhir4.Bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      entry: [
        {
          resource: TEST_PATIENT
        },
        {
          resource: TEST_CONDITION
        },
        {
          resource: TEST_CASE_MEASURE_REPORT
        },
        {
          resource: TEST_CASE_MEASURE_REPORT
        }
      ]
    };
    expect(() =>
      bundleToTestCase(
        bundle,
        ['initial-population, numerator, denominator, denominator-exclusion'],
        {},
        'http://hl7.org/fhir/us/cqfmeasures/Measure/EXM130'
      )
    ).toThrowError(`Expected 0 or 1 test case measure reports in bundle that match the loaded measure, but found 2`);
  });
});

describe('isTestCaseMeasureReport', () => {
  it('returns true when resource has resourceType MeasureReport and cqfm-isTestCase modifier extension', () => {
    expect(isTestCaseMeasureReport({ resource: TEST_CASE_MEASURE_REPORT })).toBeTruthy();
  });
  it('returns false when resource is not type MeasureReport', () => {
    expect(isTestCaseMeasureReport({ resource: TEST_PATIENT })).toBeFalsy();
  });
  it('returns false when resource is of type MeasureReport but does not contain cqfm-isTestCase modifier extension', () => {
    expect(isTestCaseMeasureReport({ resource: NON_TEST_CASE_MEASURE_REPORT })).toBeFalsy();
  });
});
