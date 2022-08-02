import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { mantineRecoilWrap, getMockRecoilState } from '../../helpers/testHelpers';
import PatientCreation from '../../../components/ResourceCreation/PatientCreation';
import { patientTestCaseState } from '../../../state/atoms/patientTestCase';
import { download } from '../../../util/downloadUtil';
import { selectedPatientState } from '../../../state/atoms/selectedPatient';
import { measureBundleState } from '../../../state/atoms/measureBundle';
import MeasureUpload from '../../../components/MeasureUpload';
import { Calculator } from 'fqm-execution';

jest.mock('../../../util/downloadUtil', () => ({
  download: jest.fn()
}));

const MOCK_MEASURE_BUNDLE: fhir4.Bundle = {
  resourceType: 'Bundle',
  type: 'collection',
  entry: []
};

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

describe('PatientCreation', () => {
  const DEFAULT_PROPS = {
    closePatientModal: jest.fn(),
    openPatientModal: jest.fn()
  };

  it('should not render modal by default', () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, {});

    render(
      mantineRecoilWrap(
        <>
          <MockPatients />
          <PatientCreation {...DEFAULT_PROPS} isPatientModalOpen={false} currentPatient={null} />
        </>
      )
    );

    const modal = screen.queryByTestId('code-editor-modal');
    expect(modal).not.toBeInTheDocument();
  });

  it('should render modal by when isPatientModalOpen is true', () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, {});

    render(
      mantineRecoilWrap(
        <>
          <MockPatients />
          <PatientCreation {...DEFAULT_PROPS} isPatientModalOpen={true} currentPatient={null} />
        </>
      )
    );

    const modal = screen.getByTestId('code-editor-modal');

    expect(modal).toBeInTheDocument();
  });

  it('should not render test case list with empty state', () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, {});

    render(
      mantineRecoilWrap(
        <>
          <MockPatients />
          <PatientCreation {...DEFAULT_PROPS} isPatientModalOpen={false} currentPatient={null} />
        </>
      )
    );

    const testCaseList = screen.queryByTestId('patient-stack');
    expect(testCaseList).not.toBeInTheDocument();
  });

  it('should render test case list with populated state', () => {
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
          <MockPatients />
          <PatientCreation {...DEFAULT_PROPS} isPatientModalOpen={false} currentPatient={null} />
        </>
      )
    );

    const testPatientLabel = screen.getByText(/test123 patient456/i);
    expect(testPatientLabel).toBeInTheDocument();
  });

  it('should render confirmation modal when delete button is clicked', () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, {
      'example-pt': {
        patient: {
          resourceType: 'Patient',
          name: [{ given: ['Test123'], family: 'Patient456' }]
        },
        resources: []
      }
    });

    const MockSelectedPatient = getMockRecoilState(selectedPatientState, 'example-pt');

    render(
      mantineRecoilWrap(
        <>
          <MockPatients />
          <MockSelectedPatient />
          <PatientCreation {...DEFAULT_PROPS} isPatientModalOpen={false} currentPatient={null} />
        </>
      )
    );

    const deleteButton = screen.getByTestId('delete-patient-button') as HTMLButtonElement;
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);

    const confirmationModal = screen.getByRole('dialog');
    expect(confirmationModal).toBeInTheDocument();
  });

  it('should have download function called when download patient button is clicked', async () => {
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

    render(
      mantineRecoilWrap(
        <>
          <MockPatients />
          <PatientCreation {...DEFAULT_PROPS} isPatientModalOpen={false} currentPatient={null} />
        </>
      )
    );

    const exportButton = screen.getByTestId('export-patient-button') as HTMLButtonElement;
    expect(exportButton).toBeInTheDocument();

    fireEvent.click(exportButton);
    await waitFor(() => {
      expect(download).toBeCalledTimes(1);
    });
  });

  it('should have calculate function called when calcuate button is clicked', async () => {
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

    const MockSelectedPatient = getMockRecoilState(selectedPatientState, 'example-pt');

    const MockMB = getMockRecoilState(measureBundleState, {
      name: 'testName',
      content: MOCK_MEASURE_BUNDLE
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

    render(
      mantineRecoilWrap(
        <>
          <MockPatients />
          <MockSelectedPatient />
          <MockMB />
          <MeasureUpload />
          <PatientCreation {...DEFAULT_PROPS} isPatientModalOpen={false} currentPatient={null} />
        </>
      )
    );

    const calculateButton = screen.getByRole('button', { name: 'Calculate' }) as HTMLButtonElement;
    expect(calculateButton).toBeInTheDocument();

    const toggleShowCalculationButton = screen.queryByRole('button', {
      name: 'Show Logic Highlighting'
    }) as HTMLButtonElement;
    expect(toggleShowCalculationButton).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.click(calculateButton);
    });

    waitFor(() => {
      const toggleShowCalculationButton = screen.getByRole('button', {
        name: 'Hide Logic Highlighting'
      }) as HTMLButtonElement;
      expect(toggleShowCalculationButton).toBeInTheDocument();
      const textDiv = screen.getByText('test123');
      expect(textDiv).toBeInTheDocument();
    });
  });
});
