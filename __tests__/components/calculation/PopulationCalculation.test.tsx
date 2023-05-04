import '@testing-library/jest-dom';
import PopulationCalculation from '../../../components/calculation/PopulationCalculation';
import { measureBundleState } from '../../../state/atoms/measureBundle';
import { patientTestCaseState } from '../../../state/atoms/patientTestCase';
import { getMockRecoilState, mantineRecoilWrap } from '../../helpers/testHelpers';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Calculator } from 'fqm-execution';
import MeasureUpload from '../../../components/measure-upload/MeasureFileUpload';
import { DetailedResult } from '../../../util/types';

const MOCK_DETAILED_RESULT: DetailedResult = {
  patientId: '',
  detailedResults: [
    {
      groupId: '',
      statementResults: [],
      populationResults: [],
      html: 'test123'
    }
  ]
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
      fileName: 'testName',
      content: MOCK_BUNDLE,
      isFile: true,
      displayMap: {},
      measureRepositoryUrl: '',
      selectedMeasureId: null
    });
    const MockPatients = getMockRecoilState(patientTestCaseState, {
      'example-pt': {
        patient: {
          resourceType: 'Patient',
          name: [{ given: ['Test123'], family: 'Patient456' }]
        },
        fullUrl: 'urn:uuid:testPatient',
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
    const MockPatients = getMockRecoilState(patientTestCaseState, {
      'example-pt': {
        patient: {
          resourceType: 'Patient',
          name: [{ given: ['Test123'], family: 'Patient456' }]
        },
        fullUrl: 'urn:uuid:testPatient',
        resources: [
          {
            resource: {
              resourceType: 'Procedure',
              id: 'test-id',
              status: 'completed',
              subject: {}
            },
            fullUrl: 'urn:uuid:test-id'
          }
        ]
      }
    });

    const MockMB = getMockRecoilState(measureBundleState, {
      fileName: 'testName',
      content: MOCK_BUNDLE,
      isFile: true,
      displayMap: {},
      measureRepositoryUrl: '',
      selectedMeasureId: null
    });

    // Mock calculate data requirements because of the changing state
    jest.spyOn(Calculator, 'calculateDataRequirements').mockResolvedValue({
      results: {
        resourceType: 'Library',
        status: 'draft',
        type: {}
      }
    });

    jest.spyOn(Calculator, 'calculate').mockResolvedValue({
      results: [MOCK_DETAILED_RESULT]
    });

    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockPatients />
            <MockMB />
            <MeasureUpload logError={jest.fn()} />
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
    const MockPatients = getMockRecoilState(patientTestCaseState, {
      'example-pt': {
        patient: {
          resourceType: 'Patient',
          name: [{ given: ['Test123'], family: 'Patient456' }]
        },
        fullUrl: 'urn:uuid:testPatient',
        resources: [
          {
            resource: {
              resourceType: 'Procedure',
              id: 'test-id',
              status: 'completed',
              subject: {}
            },
            fullUrl: 'urn:uuid:test-id'
          }
        ]
      }
    });

    const MockMB = getMockRecoilState(measureBundleState, {
      fileName: 'testName',
      content: MOCK_BUNDLE,
      isFile: true,
      displayMap: {},
      measureRepositoryUrl: '',
      selectedMeasureId: null
    });

    // Mock calculate data requirements because of the changing state
    jest.spyOn(Calculator, 'calculateDataRequirements').mockResolvedValue({
      results: {
        resourceType: 'Library',
        status: 'draft',
        type: {}
      }
    });

    jest.spyOn(Calculator, 'calculate').mockResolvedValue({
      results: [MOCK_DETAILED_RESULT]
    });

    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockPatients />
            <MockMB />
            <MeasureUpload logError={jest.fn()} />
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
    const MockPatients = getMockRecoilState(patientTestCaseState, {
      'example-pt': {
        patient: {
          resourceType: 'Patient',
          name: [{ given: ['Test123'], family: 'Patient456' }]
        },
        fullUrl: 'urn:uuid:testPatient',
        resources: [
          {
            resource: {
              resourceType: 'Procedure',
              id: 'test-id',
              status: 'completed',
              subject: {}
            },
            fullUrl: 'urn:uuid:test-id'
          }
        ]
      }
    });

    const MockMB = getMockRecoilState(measureBundleState, {
      fileName: 'testName',
      content: MOCK_BUNDLE,
      isFile: true,
      displayMap: {},
      measureRepositoryUrl: '',
      selectedMeasureId: null
    });

    // Mock calculate data requirements because of the changing state
    jest.spyOn(Calculator, 'calculateDataRequirements').mockResolvedValue({
      results: {
        resourceType: 'Library',
        status: 'draft',
        type: {}
      }
    });

    jest.spyOn(Calculator, 'calculate').mockResolvedValue({
      results: [MOCK_DETAILED_RESULT]
    });

    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockPatients />
            <MockMB />
            <MeasureUpload logError={jest.fn()} />
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
