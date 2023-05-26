import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { mantineRecoilWrap, getMockRecoilState, createMockRouter } from '../../helpers/testHelpers';
import PatientCreationPanel from '../../../components/patient-creation/PatientCreationPanel';
import { patientTestCaseState } from '../../../state/atoms/patientTestCase';
import { selectedPatientState } from '../../../state/atoms/selectedPatient';
import { download } from '../../../util/downloadUtil';

jest.mock('../../../util/downloadUtil', () => ({
  download: jest.fn()
}));

// Mock out the getClientRects function to avoid warnings
document.createRange = () => {
  const range = new Range();

  range.getBoundingClientRect = jest.fn();

  range.getClientRects = jest.fn(() => ({
    item: () => null,
    length: 0,
    [Symbol.iterator]: jest.fn()
  }));

  return range;
};

describe('PatientCreationPanel', () => {
  it('should not render modal by default', () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, {});

    render(
      mantineRecoilWrap(
        <>
          <MockPatients />
          <RouterContext.Provider value={createMockRouter({ pathname: '/' })}>
            <PatientCreationPanel />
          </RouterContext.Provider>
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
          <RouterContext.Provider value={createMockRouter({ pathname: '/' })}>
            <PatientCreationPanel />
          </RouterContext.Provider>
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
          <RouterContext.Provider value={createMockRouter({ pathname: '/' })}>
            <PatientCreationPanel />
          </RouterContext.Provider>
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
        fullUrl: 'urn:uuid:testPatient',
        resources: []
      }
    });

    render(
      mantineRecoilWrap(
        <>
          <MockPatients />
          <RouterContext.Provider value={createMockRouter({ pathname: '/' })}>
            <PatientCreationPanel />
          </RouterContext.Provider>
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
        fullUrl: 'urn:uuid:testPatient',
        resources: []
      }
    });

    const MockSelectedPatient = getMockRecoilState(selectedPatientState, 'example-pt');

    render(
      mantineRecoilWrap(
        <>
          <MockPatients />
          <MockSelectedPatient />
          <RouterContext.Provider value={createMockRouter({ pathname: '/' })}>
            <PatientCreationPanel />
          </RouterContext.Provider>
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
        fullUrl: 'urn:uuid:testPatient',
        resources: []
      }
    });

    const MockSelectedPatient = getMockRecoilState(selectedPatientState, 'example-pt');

    render(
      mantineRecoilWrap(
        <>
          <MockPatients />
          <MockSelectedPatient />
          <RouterContext.Provider value={createMockRouter({ pathname: '/' })}>
            <PatientCreationPanel />
          </RouterContext.Provider>
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

    render(
      mantineRecoilWrap(
        <>
          <MockPatients />
          <RouterContext.Provider value={createMockRouter({ pathname: '/' })}>
            <PatientCreationPanel />
          </RouterContext.Provider>
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
