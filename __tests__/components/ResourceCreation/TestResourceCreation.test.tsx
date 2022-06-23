import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { mantineRecoilWrap, getMockRecoilState } from '../../helpers/testHelpers';
import TestResourceCreation from '../../../components/ResourceCreation/TestResourceCreation';
import { patientTestCaseState } from '../../../state/atoms/patientTestCase';
import { selectedPatientState } from '../../../state/atoms/selectedPatient';

describe('TestResourceCreation', () => {
  it('should delete resource when button is clicked', () => {
    const MockResources = getMockRecoilState(patientTestCaseState, {
      'example-test-case': {
        patient: {
          resourceType: 'Patient',
          name: [{ given: ['Test123'], family: 'Patient456' }]
        },
        resources: [{
          resourceType: 'Procedure',
          id: 'test-id'
        }]
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

    // TODO: change this to check that the resource is not in the object of current resources
    const testCaseList = screen.queryByTestId('Procedure');
    expect(testCaseList).not.toBeInTheDocument();
  });
});
