import '@testing-library/jest-dom';
import { act, render, screen, fireEvent, within } from '@testing-library/react';
import { Suspense } from 'react';
import PopulationMultiSelect from '../../../components/utils/PopulationMultiSelect';
import { measureBundleState } from '../../../state/atoms/measureBundle';
import { patientTestCaseState, TestCase } from '../../../state/atoms/patientTestCase';
import { selectedPatientState } from '../../../state/atoms/selectedPatient';
import { getMockRecoilState, mantineRecoilWrap, mockResizeObserver } from '../../helpers/testHelpers';

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

const EXAMPLE_PATIENT: fhir4.Patient = {
  resourceType: 'Patient',
  id: 'example-pt',
  name: [{ given: ['Test123'], family: 'Patient456' }],
  birthDate: '1996-07-19'
};

const MOCK_TEST_CASE: TestCase = {
  'example-pt': {
    patient: EXAMPLE_PATIENT,
    fullUrl: 'urn:uuid:example-pt',
    resources: []
  }
};

describe('PopulationMultiSelect', () => {
  it('should render an information popover', () => {
    const MockMB = getMockRecoilState(measureBundleState, MEASURE_BUNDLE_POPULATED);
    const MockPatients = getMockRecoilState(patientTestCaseState, MOCK_TEST_CASE);
    const MockSelectedPatient = getMockRecoilState(selectedPatientState, 'example-pt');

    render(
      mantineRecoilWrap(
        <>
          <MockMB />
          <MockPatients />
          <MockSelectedPatient />
          <PopulationMultiSelect />
        </>
      )
    );

    expect(screen.getByLabelText(/more information/i)).toBeInTheDocument();
  });

  it('should render a select box for selecting measure populations', async () => {
    const MockMB = getMockRecoilState(measureBundleState, MEASURE_BUNDLE_POPULATED);
    const MockPatients = getMockRecoilState(patientTestCaseState, MOCK_TEST_CASE);
    const MockSelectedPatient = getMockRecoilState(selectedPatientState, 'example-pt');

    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockMB />
            <MockPatients />
            <MockSelectedPatient />
            <Suspense>
              <PopulationMultiSelect />
            </Suspense>
          </>
        )
      );
    });

    const populationSelector = screen.getByRole('combobox');
    expect(populationSelector).toBeInTheDocument();
  });

  it('should show population from measure group as a dropdown option', async () => {
    window.ResizeObserver = mockResizeObserver;
    const MockMB = getMockRecoilState(measureBundleState, MEASURE_BUNDLE_POPULATED);
    const MockPatients = getMockRecoilState(patientTestCaseState, MOCK_TEST_CASE);
    const MockSelectedPatient = getMockRecoilState(selectedPatientState, 'example-pt');

    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockMB />
            <MockPatients />
            <MockSelectedPatient />
            <Suspense>
              <PopulationMultiSelect />
            </Suspense>
          </>
        )
      );
    });

    const multiselect = screen.getByRole('combobox');
    const input = within(multiselect).getByRole('searchbox');
    multiselect.focus();

    // mock user key clicks to test input fields and drop down menus
    await act(async () => {
      fireEvent.change(input, { target: { value: 'D' } });
      fireEvent.keyDown(multiselect, { key: 'ArrowDown' });
      fireEvent.keyDown(multiselect, { key: 'Enter' });
    });

    expect(screen.getByText(/DENOM/i)).toBeInTheDocument();
  });
});
