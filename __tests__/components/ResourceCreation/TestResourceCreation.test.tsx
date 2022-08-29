import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { mantineRecoilWrap, getMockRecoilState } from '../../helpers/testHelpers';
import ResourceDisplay from '../../../components/resource-creation/ResourceDisplay';
import { patientTestCaseState } from '../../../state/atoms/patientTestCase';
import { selectedPatientState } from '../../../state/atoms/selectedPatient';
import { selectedDataRequirementState } from '../../../state/atoms/selectedDataRequirement';

describe('TestResourceCreation', () => {
  it('should not render modal by default', () => {
    const MockResources = getMockRecoilState(patientTestCaseState, {
      'example-test-case': {
        patient: {
          resourceType: 'Patient',
          name: [{ given: ['Test123'], family: 'Patient456' }]
        },
        resources: []
      }
    });
    const MockSelectedDataRequirement = getMockRecoilState(selectedDataRequirementState, {
      name: '',
      content: null
    });
    const MockSelectedPatient = getMockRecoilState(selectedPatientState, 'example-test-case');

    render(
      mantineRecoilWrap(
        <>
          <MockResources />
          <MockSelectedDataRequirement />
          <MockSelectedPatient />
          <ResourceDisplay />
        </>
      )
    );

    const modal = screen.queryByTestId('code-editor-modal');
    expect(modal).not.toBeInTheDocument();
  });

  it('should render modal when data element is selected from test resource display', () => {
    const TEST_DATA_REQ: fhir4.DataRequirement = {
      type: 'Observation',
      codeFilter: [],
      dateFilter: []
    };

    const MockResources = getMockRecoilState(patientTestCaseState, {
      'example-test-case': {
        patient: {
          resourceType: 'Patient',
          name: [{ given: ['Test123'], family: 'Patient456' }]
        },
        resources: []
      }
    });
    const MockSelectedDataRequirement = getMockRecoilState(selectedDataRequirementState, {
      name: '',
      content: TEST_DATA_REQ
    });
    const MockSelectedPatient = getMockRecoilState(selectedPatientState, 'example-test-case');

    render(
      mantineRecoilWrap(
        <>
          <MockResources />
          <MockSelectedDataRequirement />
          <MockSelectedPatient />
          <ResourceDisplay />
        </>
      )
    );

    const modal = screen.getByRole('dialog', { name: 'Edit FHIR Resource' });
    expect(modal).toBeInTheDocument();
  });

  it('should render modal when Edit Resource button is clicked', () => {
    const MockResources = getMockRecoilState(patientTestCaseState, {
      'example-test-case': {
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
    const MockSelectedPatient = getMockRecoilState(selectedPatientState, 'example-test-case');

    render(
      mantineRecoilWrap(
        <>
          <MockResources />
          <MockSelectedPatient />
          <ResourceDisplay />
        </>
      )
    );

    const editResourceButton = screen.getByTestId('edit-resource-button') as HTMLButtonElement;
    fireEvent.click(editResourceButton);

    const modal = screen.getByRole('dialog', { name: 'Edit FHIR Resource' });
    expect(modal).toBeInTheDocument();
  });

  it('should not render test resources for selected patient when list is empty', () => {
    const MockResources = getMockRecoilState(patientTestCaseState, {
      'example-test-case': {
        patient: {
          resourceType: 'Patient',
          name: [{ given: ['Test123'], family: 'Patient456' }]
        },
        resources: []
      }
    });
    const MockSelectedPatient = getMockRecoilState(selectedPatientState, 'example-test-case');

    render(
      mantineRecoilWrap(
        <>
          <MockResources />
          <MockSelectedPatient />
          <ResourceDisplay />
        </>
      )
    );

    const resourceInfo = screen.queryByText(/test case resources/i);
    expect(resourceInfo).not.toBeInTheDocument();
  });

  it('should render test resource list when populated', () => {
    const MockResources = getMockRecoilState(patientTestCaseState, {
      'example-test-case': {
        patient: {
          resourceType: 'Patient',
          name: [{ given: ['Test123'], family: 'Patient456' }]
        },
        resources: [
          {
            resourceType: 'Procedure',
            id: 'test-id',
            status: 'completed',
            subject: {},
            code: {
              coding: [
                {
                  code: '123',
                  display: 'Colectomy'
                }
              ]
            }
          }
        ]
      }
    });
    const MockSelectedPatient = getMockRecoilState(selectedPatientState, 'example-test-case');

    render(
      mantineRecoilWrap(
        <>
          <MockResources />
          <MockSelectedPatient />
          <ResourceDisplay />
        </>
      )
    );

    const resourceInfo = screen.getByText(/test case resources/i);
    expect(resourceInfo).toBeInTheDocument();

    const procedureResource = screen.getByText(/1. Procedure/i);
    expect(procedureResource).toBeInTheDocument();

    const resourceCode = screen.getByText(/123: Colectomy/i);
    expect(resourceCode).toBeInTheDocument();

    const editResourceButton = screen.getByTestId('edit-resource-button') as HTMLButtonElement;
    expect(editResourceButton).toBeInTheDocument();

    const deleteResourceButton = screen.getByTestId('delete-resource-button') as HTMLButtonElement;
    expect(deleteResourceButton).toBeInTheDocument();
  });

  it('should render confirmation modal when delete button is clicked', () => {
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

    render(
      mantineRecoilWrap(
        <>
          <MockPatients />
          <MockSelectedPatient />
          <ResourceDisplay />
        </>
      )
    );

    const deleteButton = screen.getByTestId('delete-resource-button') as HTMLButtonElement;
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);

    const confirmationModal = screen.getByRole('dialog');
    expect(confirmationModal).toBeInTheDocument();
  });
});
