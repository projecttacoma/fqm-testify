import '@testing-library/jest-dom';
import PopulationCalculation from '../../components/PopulationCalculation';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { getMockRecoilState, mantineRecoilWrap } from '../helpers/testHelpers';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Calculator, MeasureReportBuilder } from 'fqm-execution';
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

const MOCK_BUNDLE: fhir4.Bundle = {
  resourceType: 'Bundle',
  type: 'collection'
};

describe('PopulationCalculation', () => {
  it('should not render Calculate Population Results button by default', () => {
    render(
      mantineRecoilWrap(
        <>
          <PopulationCalculation />
        </>
      )
    );

    const calculateButton = screen.queryByTestId('calculate-all-button');
    expect(calculateButton).not.toBeInTheDocument();
  });

  it('should not render Show Table button by default', () => {
    render(
      mantineRecoilWrap(
        <>
          <PopulationCalculation />
        </>
      )
    );

    const showTableButton = screen.queryByTestId('show-table-button');
    expect(showTableButton).not.toBeInTheDocument();
  });

  it('should not render Show Clause Coverage button by default', () => {
    render(
      mantineRecoilWrap(
        <>
          <PopulationCalculation />
        </>
      )
    );

    const showClauseCoverageButton = screen.queryByTestId('show-coverage-button');
    expect(showClauseCoverageButton).not.toBeInTheDocument();
  });

  it('should render Calculate Population Results button when measure bundle is present and at least one patient created', () => {
    const MockMB = getMockRecoilState(measureBundleState, {
      name: 'testName',
      content: MOCK_BUNDLE
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

    const calculateButton = screen.getByRole('button', { name: 'Calculate Population Results' }) as HTMLButtonElement;
    expect(calculateButton).toBeInTheDocument();
  });

  it('should run calculation on all patients when Calculate Population Results button is clicked', async () => {
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
      content: MOCK_BUNDLE
    });

    // Mock calculate data requirements because of the changing state
    jest.spyOn(Calculator, 'calculateDataRequirements').mockResolvedValue({
      results: {
        resourceType: 'Library',
        status: 'draft',
        type: {}
      }
    });

    jest.spyOn(MeasureReportBuilder, 'buildMeasureReports').mockImplementation(() => {
      return [MOCK_MEASURE_REPORT];
    });

    jest.spyOn(Calculator, 'calculate').mockResolvedValue({
      results: []
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

    const calculateButton = screen.getByRole('button', { name: 'Calculate Population Results' }) as HTMLButtonElement;
    expect(calculateButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(calculateButton);
    });

    await waitFor(() => {
      const table = screen.getByTestId('results-table');
      expect(table).toBeInTheDocument();
    });
  });

  it('should render Show Table button once calculation has finished so user can revisit table results', async () => {
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
      content: MOCK_BUNDLE
    });

    // Mock calculate data requirements because of the changing state
    jest.spyOn(Calculator, 'calculateDataRequirements').mockResolvedValue({
      results: {
        resourceType: 'Library',
        status: 'draft',
        type: {}
      }
    });

    jest.spyOn(MeasureReportBuilder, 'buildMeasureReports').mockImplementation(() => {
      return [MOCK_MEASURE_REPORT];
    });

    jest.spyOn(Calculator, 'calculate').mockResolvedValue({
      results: []
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

    const calculateButton = screen.getByTestId('calculate-all-button');
    expect(calculateButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(calculateButton);
    });

    await waitFor(() => {
      const showTableButton = screen.getByTestId('show-table-button');
      expect(showTableButton).toBeInTheDocument();
    });
  });

  it('should render Show Clause Coverage button once calculation has finished', async () => {
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
      content: MOCK_BUNDLE
    });

    // Mock calculate data requirements because of the changing state
    jest.spyOn(Calculator, 'calculateDataRequirements').mockResolvedValue({
      results: {
        resourceType: 'Library',
        status: 'draft',
        type: {}
      }
    });

    jest.spyOn(MeasureReportBuilder, 'buildMeasureReports').mockImplementation(() => {
      return [MOCK_MEASURE_REPORT];
    });

    jest.spyOn(Calculator, 'calculate').mockResolvedValue({
      results: []
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

    const calculateButton = screen.getByTestId('calculate-all-button');
    expect(calculateButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(calculateButton);
    });

    await waitFor(() => {
      const showClauseCoverageButton = screen.getByTestId('show-coverage-button');
      expect(showClauseCoverageButton).toBeInTheDocument();
    });
  });
});
