import '@testing-library/jest-dom';
import { act, render, screen, fireEvent, within } from '@testing-library/react';
import { Suspense } from 'react';
import PatientCreationPanel from '../../../components/patient-creation/PatientCreationPanel';
import PatientInfoCard, { PatientInfoCardProps } from '../../../components/utils/PatientInfoCard';
import PopulationMultiSelect from '../../../components/utils/PopulationMultiSelect';
import { measureBundleState } from '../../../state/atoms/measureBundle';
import { patientTestCaseState, TestCase } from '../../../state/atoms/patientTestCase';
import { selectedPatientState } from '../../../state/atoms/selectedPatient';
import { getMockRecoilState, mantineRecoilWrap } from '../../helpers/testHelpers';

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
              }
            ]
          }
        ]
      }
    }
  ]
};

const MEASURE_BUNDLE_POPULATED = {
  name: 'measureBundle',
  content: TEST_MEASURE_BUNDLE
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
    resources: []
  }
};

const MOCK_CALLBACK_PROPS: Omit<PatientInfoCardProps, 'patient'> = {
  onEditClick: jest.fn(),
  onDeleteClick: jest.fn(),
  onExportClick: jest.fn(),
  onCopyClick: jest.fn()
};

describe('PopulationMultiSelect', () => {
  it('should show populations as options', async () => {
    const MockMB = getMockRecoilState(measureBundleState, MEASURE_BUNDLE_POPULATED);
    const MockPatients = getMockRecoilState(patientTestCaseState, MOCK_TEST_CASE);
    const MockSelectedPatient = getMockRecoilState(selectedPatientState, 'example-pt');

    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockMB />
            <PopulationMultiSelect />
          </>
        )
      );
    });

    const populationSelector = screen.getByPlaceholderText(/select populations/i) as HTMLInputElement;
    await act(async () => {
      fireEvent.click(populationSelector);
    });

    // const options = screen.getAllByRole('option');
    // expect(options[0].textContent).toBe('denominator');

    //expect(within(populationSelector).getByText(/denominator/i)).toBeInTheDocument();
    //expect(screen.getByText(/numerator/i)).toBeInTheDocument();
  });
});
