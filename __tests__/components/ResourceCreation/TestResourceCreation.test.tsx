import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { mantineRecoilWrap, getMockRecoilState } from '../../helpers/testHelpers';
import TestResourceCreation from '../../../components/ResourceCreation/TestResourceCreation';
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
          <TestResourceCreation />
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
          <TestResourceCreation />
        </>
      )
    );

    const modal = screen.getByTestId('code-editor-modal');
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
            id: 'test-id'
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
          <TestResourceCreation />
        </>
      )
    );

    const editResourceButton = screen.getByRole('button', { name: 'Edit FHIR Resource' });
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
          <TestResourceCreation />
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
            id: 'test-id'
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
          <TestResourceCreation />
        </>
      )
    );

    const resourceInfo = screen.getByText(/test case resources/i);
    expect(resourceInfo).toBeInTheDocument();
  });

  it('should delete resource when button is clicked', () => {
    const MockResources = getMockRecoilState(patientTestCaseState, {
      'example-test-case': {
        patient: {
          resourceType: 'Patient',
          name: [{ given: ['Test123'], family: 'Patient456' }]
        },
        resources: [
          {
            resourceType: 'Procedure',
            id: 'test-id'
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
          <TestResourceCreation />
        </>
      )
    );

    const deleteButton = screen.getByText(/delete resource/i) as HTMLButtonElement;
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);

    const resourceInfo = screen.queryByText(/test case resources/i);
    expect(resourceInfo).not.toBeInTheDocument();
  });
});
