import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { mantineRecoilWrap, getMockRecoilState } from '../../helpers/testHelpers';
import ResourceDisplay from '../../../components/resource-creation/ResourceDisplay';
import { patientTestCaseState, TestCase } from '../../../state/atoms/patientTestCase';
import { selectedPatientState } from '../../../state/atoms/selectedPatient';

const MOCK_TEST_CASE_EMPTY: TestCase = {
  'example-pt': {
    patient: {
      resourceType: 'Patient',
      id: 'example-pt',
      name: [{ given: ['Test123'], family: 'Patient456' }]
    },
    resources: []
  }
};

const MOCK_TEST_CASE_POPULATED: TestCase = {
  'example-pt': {
    patient: {
      resourceType: 'Patient',
      id: 'example-pt',
      name: [{ given: ['Test123'], family: 'Patient456' }]
    },
    resources: [
      {
        resource: {
          resourceType: 'Procedure',
          id: 'example-procedure',
          status: 'completed',
          subject: {
            reference: 'Patient/example-pt'
          },
          code: {
            coding: [
              {
                code: 'example-code',
                display: 'Example Code Display'
              }
            ]
          }
        },
        fullUrl: 'urn:uuid:example-procedure'
      }
    ]
  }
};

describe('ResourceDisplay', () => {
  it('should not display resources with no selected patient', () => {
    const MockTestCaseState = getMockRecoilState(patientTestCaseState, MOCK_TEST_CASE_POPULATED);
    const MockSelectedPatient = getMockRecoilState(selectedPatientState, null);

    render(
      mantineRecoilWrap(
        <>
          <MockTestCaseState />
          <MockSelectedPatient />
          <ResourceDisplay />
        </>
      )
    );

    const stack = screen.queryByTestId('resource-display-stack');
    expect(stack).not.toBeInTheDocument();
  });

  it('should not display resources with none in state', () => {
    const MockTestCaseState = getMockRecoilState(patientTestCaseState, MOCK_TEST_CASE_EMPTY);
    const MockSelectedPatient = getMockRecoilState(selectedPatientState, 'example-pt');

    render(
      mantineRecoilWrap(
        <>
          <MockTestCaseState />
          <MockSelectedPatient />
          <ResourceDisplay />
        </>
      )
    );

    const stack = screen.queryByTestId('resource-display-stack');
    expect(stack).not.toBeInTheDocument();
  });

  it('should display resource type and code info', () => {
    const MockTestCaseState = getMockRecoilState(patientTestCaseState, MOCK_TEST_CASE_POPULATED);
    const MockSelectedPatient = getMockRecoilState(selectedPatientState, 'example-pt');

    render(
      mantineRecoilWrap(
        <>
          <MockTestCaseState />
          <MockSelectedPatient />
          <ResourceDisplay />
        </>
      )
    );
    expect(screen.getByText(/procedure/i)).toBeInTheDocument();
    expect(screen.getByText(/example-code/i)).toBeInTheDocument();
    expect(screen.getByText(/example code display/i)).toBeInTheDocument();
  });
});
