import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { mantineRecoilWrap, getMockRecoilState } from '../helpers/testHelpers';
import PatientCreation from '../../components/PatientCreation';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';

describe('PatientCreation', () => {
  it('should render create button', () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, {});

    render(
      mantineRecoilWrap(
        <>
          <MockPatients />
          <PatientCreation />
        </>
      )
    );

    const createButton = screen.getByText(/create test patient/i);
    expect(createButton).toBeInTheDocument();
  });

  it('should not render modal by default', () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, {});

    render(
      mantineRecoilWrap(
        <>
          <MockPatients />
          <PatientCreation />
        </>
      )
    );

    const modal = screen.queryByTestId('code-editor-modal');
    expect(modal).not.toBeInTheDocument();
  });

  it('should render modal by when create button is clicked', () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, {});

    render(
      mantineRecoilWrap(
        <>
          <MockPatients />
          <PatientCreation />
        </>
      )
    );

    const createButton = screen.getByText(/create test patient/i);

    fireEvent.click(createButton);

    const modal = screen.getByTestId('code-editor-modal');

    expect(modal).toBeInTheDocument();
  });

  it('should not render test case list with empty state', async () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, {});

    render(
      mantineRecoilWrap(
        <>
          <MockPatients />
          <PatientCreation />
        </>
      )
    );

    const testCaseList = screen.queryByText(/test cases/i);
    expect(testCaseList).not.toBeInTheDocument();
  });

  it('should render test case list with populated state', async () => {
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
          <PatientCreation />
        </>
      )
    );

    const testPatientLabel = screen.getByText(/test123 patient456/i);
    expect(testPatientLabel).toBeInTheDocument();
  });

  it('should delete patient when button is clicked', async () => {
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
          <PatientCreation />
        </>
      )
    );

    const deleteButton = screen.getByText(/delete patient/i) as HTMLButtonElement;
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);

    const testCaseList = screen.queryByText(/test cases/i);
    expect(testCaseList).not.toBeInTheDocument();
  });
});
