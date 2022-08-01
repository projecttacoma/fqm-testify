import '@testing-library/jest-dom';
import PopulationCalculation from '../../components/PopulationCalculation';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { getMockRecoilState, mantineRecoilWrap } from '../helpers/testHelpers';
import testBundle from '../fixtures/bundles/EXM130Fixture.json';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Calculator } from 'fqm-execution';
import MeasureUpload from '../../components/MeasureUpload';
import PatientCreation from '../../components/ResourceCreation/PatientCreation';

const MOCK_MEASURE_REPORT: fhir4.MeasureReport = {
  resourceType: 'MeasureReport',
  type: 'individual',
  status: 'complete',
  measure: '',
  period: {
    start: '',
    end: ''
  },
  text: {
    div: 'test123',
    status: 'additional'
  }
};

describe('PopulationCalculation', () => {
  it('should not render Calculate button by default', () => {
    render(
      mantineRecoilWrap(
        <>
          <PopulationCalculation />
        </>
      )
    );

    const calculateButton = screen.queryByTestId('calculate-button');
    expect(calculateButton).not.toBeInTheDocument();
  });

  it('should render Calculate button when measure bundle is present and at least one patient created', () => {
    const MockMB = getMockRecoilState(measureBundleState, {
      name: 'testName',
      content: testBundle as fhir4.Bundle
    });
    const MockPatients = getMockRecoilState(patientTestCaseState, {
      'example-pt': {
        patient: {
          resourceType: 'Patient',
          name: [{ given: ['Test123'], family: 'Patient456' }]
        },
        resources: []
      }
    });

    render(
      mantineRecoilWrap(
        <>
          <MockMB />
          <MockPatients />
          <PopulationCalculation />
        </>
      )
    );

    const calculateButton = screen.getByTestId('calculate-all-button') as HTMLButtonElement;
    expect(calculateButton).toBeInTheDocument();
  });

  it('should run calculation on all patients when calculate button is clicked', async () => {
    const DEFAULT_PROPS = {
      closePatientModal: jest.fn(),
      openPatientModal: jest.fn()
    };

    const MockPatients = getMockRecoilState(patientTestCaseState, {
      'example-pt': {
        patient: {
          resourceType: 'Patient',
          name: [{ given: ['Test123'], family: 'Patient456' }]
        },
        resources: [
          {
            resourceType: 'Procedure',
            id: 'test-id',
            status: 'completed',
            subject: {}
          }
        ]
      }
    });

    const MockMB = getMockRecoilState(measureBundleState, {
      name: 'testName',
      content: testBundle as fhir4.Bundle
    });

    // Mock calculate data requirements because of the changing state
    jest.spyOn(Calculator, 'calculateDataRequirements').mockResolvedValue({
      results: {
        resourceType: 'Library',
        status: 'draft',
        type: {}
      }
    });

    jest.spyOn(Calculator, 'calculateMeasureReports').mockResolvedValue({
      results: [MOCK_MEASURE_REPORT]
    });

    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockPatients />
            <MockMB />
            <MeasureUpload />
            <PatientCreation {...DEFAULT_PROPS} isPatientModalOpen={false} currentPatient={null} />
            <PopulationCalculation />
          </>
        )
      );
    });

    const calculateButton = screen.getByTestId('calculate-all-button') as HTMLButtonElement;
    expect(calculateButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(calculateButton);
    });

    await waitFor(() => {
      const table = screen.getByTestId('results-table');
      expect(table).toBeInTheDocument();
    });

  });
});
