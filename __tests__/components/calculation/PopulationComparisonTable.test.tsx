import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import { MeasureReport } from 'fhir/r4';
import { Suspense } from 'react';
import PopulationComparisonTable from '../../../components/calculation/PopulationComparisonTable';
import { measureBundleState } from '../../../state/atoms/measureBundle';
import { measureReportLookupState } from '../../../state/atoms/measureReportLookup';
import { patientTestCaseState, TestCase } from '../../../state/atoms/patientTestCase';
import { selectedPatientState } from '../../../state/atoms/selectedPatient';
import { getMockRecoilState, mantineRecoilWrap } from '../../helpers/testHelpers';

const MOCK_MEASURE_REPORT: fhir4.MeasureReport = {
  resourceType: 'MeasureReport',
  type: 'individual',
  status: 'complete',
  measure: '',
  period: {
    start: '',
    end: ''
  },
  group: [
    {
      id: '',
      population: [
        {
          count: 1,
          code: {
            coding: [
              {
                system: '',
                code: 'initial-population',
                display: 'Initial Population'
              }
            ]
          }
        },
        {
          count: 1,
          code: {
            coding: [
              {
                system: '',
                code: 'numerator',
                display: 'Numerator'
              }
            ]
          }
        },
        {
          count: 1,
          code: {
            coding: [
              {
                system: '',
                code: 'denominator-exclusion',
                display: 'Denominator Exclusion'
              }
            ]
          }
        },
        {
          count: 0,
          code: {
            coding: [
              {
                system: '',
                code: 'denominator',
                display: 'Denominator'
              }
            ]
          }
        }
      ]
    }
  ]
};

const TEST_MEASURE_BUNDLE: fhir4.Bundle = {
  resourceType: 'Bundle',
  type: 'transaction',
  entry: [
    {
      resource: {
        resourceType: 'Measure',
        status: 'active',
        group: [
          {
            population: [
              {
                code: {
                  coding: [
                    {
                      system: 'test-system',
                      code: 'denominator',
                      display: 'Denominator'
                    }
                  ]
                },
                criteria: {
                  language: 'text/cql.identifier',
                  expression: 'Denominator'
                }
              },
              {
                code: {
                  coding: [
                    {
                      system: 'test-system',
                      code: 'numerator',
                      display: 'Numerator'
                    }
                  ]
                },
                criteria: {
                  language: 'text/cql.identifier',
                  expression: 'Numerator'
                }
              },
              {
                code: {
                  coding: [
                    {
                      system: 'test-system',
                      code: 'initial-population',
                      display: 'Initial Population'
                    }
                  ]
                },
                criteria: {
                  language: 'text/cql.identifier',
                  expression: 'Initial Population'
                }
              },
              {
                code: {
                  coding: [
                    {
                      system: 'test-system',
                      code: 'denominator-exclusion',
                      display: 'Denominator Exclusion'
                    }
                  ]
                },
                criteria: {
                  language: 'text/cql.identifier',
                  expression: 'Denominator Exclusion'
                }
              }
            ]
          }
        ]
      }
    }
  ]
};

const MEASURE_BUNDLE_POPULATED = {
  fileName: 'measureBundle',
  content: TEST_MEASURE_BUNDLE,
  isFile: true,
  displayMap: {},
  measureRepositoryUrl: '',
  selectedMeasureId: null
};

const MOCK_MEASURE_REPORT_LOOKUP: Record<string, MeasureReport> = {
  'example-pt': MOCK_MEASURE_REPORT
};

const EXAMPLE_PATIENT: fhir4.Patient = {
  resourceType: 'Patient',
  id: 'example-pt',
  name: [{ given: ['Test123'], family: 'Patient456' }],
  birthDate: '1996-07-19'
};

const MOCK_TEST_CASE: TestCase = {
  'example-pt': {
    patient: EXAMPLE_PATIENT,
    resources: [],
    desiredPopulations: ['initial-population']
  }
};

describe('PopulationComparisonTable', () => {
  it('should render population comparison table', async () => {
    const MockMB = getMockRecoilState(measureBundleState, MEASURE_BUNDLE_POPULATED);
    const MockPatients = getMockRecoilState(patientTestCaseState, MOCK_TEST_CASE);
    const MockSelectedPatient = getMockRecoilState(selectedPatientState, 'example-pt');
    const MockMeasureReportLookup = getMockRecoilState(measureReportLookupState, MOCK_MEASURE_REPORT_LOOKUP);

    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockMB />
            <MockPatients />
            <MockSelectedPatient />
            <MockMeasureReportLookup />
            <Suspense>
              <PopulationComparisonTable patientId={'example-pt'} />
            </Suspense>
          </>
        )
      );
    });

    const numQualified = screen.getAllByText('1');
    const numUnqualified = screen.getAllByText('0');

    expect(numQualified.length).toBe(4);
    expect(numUnqualified.length).toBe(4);
  });
});
