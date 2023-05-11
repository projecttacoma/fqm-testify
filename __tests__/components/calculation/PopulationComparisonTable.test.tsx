import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import { Suspense } from 'react';
import PopulationComparisonTable from '../../../components/calculation/PopulationComparisonTable';
import { measureBundleState } from '../../../state/atoms/measureBundle';
import { patientTestCaseState, TestCase } from '../../../state/atoms/patientTestCase';
import { selectedPatientState } from '../../../state/atoms/selectedPatient';
import { getMockRecoilState, mantineRecoilWrap } from '../../helpers/testHelpers';
import { Enums } from 'fqm-execution';
import { detailedResultLookupState } from '../../../state/atoms/detailedResultLookup';
import { DetailedResult } from '../../../util/types';

const MOCK_DETAILED_RESULT: DetailedResult = {
  patientId: 'example-pt',
  detailedResults: [
    {
      groupId: '',
      statementResults: [],
      populationResults: [
        { populationType: Enums.PopulationType.IPP, criteriaExpression: 'Initial Population', result: true },
        { populationType: Enums.PopulationType.DENOM, criteriaExpression: 'Denominator', result: false },
        { populationType: Enums.PopulationType.DENEX, criteriaExpression: 'Denominator Exclusion', result: true },
        { populationType: Enums.PopulationType.NUMER, criteriaExpression: 'Numerator', result: true }
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
        scoring: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/measure-scoring',
              code: 'proportion'
            }
          ]
        },
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

const MOCK_DETAILED_RESULT_LOOKUP: Record<string, DetailedResult> = {
  'example-pt': MOCK_DETAILED_RESULT
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
    fullUrl: 'urn:uuid:testPatient',
    resources: [],
    desiredPopulations: ['initial-population']
  }
};

describe('PopulationComparisonTable', () => {
  it('should render population comparison table', async () => {
    const MockMB = getMockRecoilState(measureBundleState, MEASURE_BUNDLE_POPULATED);
    const MockPatients = getMockRecoilState(patientTestCaseState, MOCK_TEST_CASE);
    const MockSelectedPatient = getMockRecoilState(selectedPatientState, 'example-pt');
    const MockDetailedResultLookup = getMockRecoilState(detailedResultLookupState, MOCK_DETAILED_RESULT_LOOKUP);

    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockMB />
            <MockPatients />
            <MockSelectedPatient />
            <MockDetailedResultLookup />
            <Suspense>
              <PopulationComparisonTable patientId={'example-pt'} defIds={{}} />
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
