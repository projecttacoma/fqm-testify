import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { mantineRecoilWrap, getMockRecoilState } from '../../helpers/testHelpers';
import PatientCreationPanel from '../../../components/patient-creation/PatientCreationPanel';
import { patientTestCaseState } from '../../../state/atoms/patientTestCase';
import { selectedPatientState } from '../../../state/atoms/selectedPatient';
import { download } from '../../../util/downloadUtil';

jest.mock('../../../util/downloadUtil', () => ({
  download: jest.fn()
}));

describe('PatientCreationPanel', () => {
  it('should not render modal by default', () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, {});

    render(
      mantineRecoilWrap(
        <>
          <MockPatients />
          <PatientCreationPanel />
        </>
      )
    );

    const modal = screen.queryByRole('dialog');
    expect(modal).not.toBeInTheDocument();
  });

  it('should render modal when create button is clicked', async () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, {});

    render(
      mantineRecoilWrap(
        <>
          <MockPatients />
          <PatientCreationPanel />
        </>
      )
    );

    const createButton = screen.getByRole('button', {
      name: /create/i
    });

    expect(createButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(createButton);
    });

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
  });

  it('should not render test case list with empty state', () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, {});

    render(
      mantineRecoilWrap(
        <>
          <MockPatients />
          <PatientCreationPanel />
        </>
      )
    );

    const testCaseList = screen.queryByTestId('patient-panel');
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
          <PatientCreationPanel />
        </>
      )
    );

    const testPatientLabel = screen.getByText(/test123 patient456/i);
    expect(testPatientLabel).toBeInTheDocument();
  });

  it('should render confirmation modal when delete button is clicked', async () => {
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
          <PatientCreationPanel />
        </>
      )
    );

    const deleteButton = screen.getByLabelText(/delete patient/i) as HTMLButtonElement;
    expect(deleteButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    const confirmationModal = screen.getByRole('dialog', { hidden: true });
    expect(confirmationModal).toBeInTheDocument();
  });

  it('should render modal when copy button is clicked', async () => {
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
          <PatientCreationPanel />
        </>
      )
    );

    const copyButton = screen.getByLabelText(/copy patient/i) as HTMLButtonElement;
    expect(copyButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(copyButton);
    });

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
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
          <PatientCreationPanel />
        </>
      )
    );

    const exportButton = screen.getByLabelText(/export patient/i) as HTMLButtonElement;
    expect(exportButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(exportButton);
    });

    await waitFor(() => {
      expect(download).toBeCalledTimes(1);
    });
  });
});
