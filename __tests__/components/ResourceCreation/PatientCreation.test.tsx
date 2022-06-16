import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { mantineRecoilWrap, getMockRecoilState } from '../../helpers/testHelpers';
import PatientCreation from '../../../components/ResourceCreation/PatientCreation';
import { patientTestCaseState } from '../../../state/atoms/patientTestCase';

describe('PatientCreation', () => {
  const DEFAULT_PROPS = {
    closeModal: jest.fn(),
    openModal: jest.fn()
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
        resourceType: 'Patient',
        name: [{ given: ['Test123'], family: 'Patient456' }]
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

  it('should delete patient when button is clicked', () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, {
      'example-pt': {
        resourceType: 'Patient',
        name: [{ given: ['Test123'], family: 'Patient456' }]
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

    const deleteButton = screen.getByText(/delete patient/i) as HTMLButtonElement;
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);

    const testCaseList = screen.queryByTestId('patient-stack');
    expect(testCaseList).not.toBeInTheDocument();
  });
});
