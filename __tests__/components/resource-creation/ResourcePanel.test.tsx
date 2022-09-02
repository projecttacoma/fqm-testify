import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import { mantineRecoilWrap, getMockRecoilState } from '../../helpers/testHelpers';
import { patientTestCaseState } from '../../../state/atoms/patientTestCase';
import React from 'react';
import { selectedPatientState } from '../../../state/atoms/selectedPatient';
import ResourcePanel from '../../../components/resource-creation/ResourcePanel';

describe('ResourcePanel', () => {
  it('should render placeholder text with no selected patient', () => {
    const MockSelectedPatient = getMockRecoilState(selectedPatientState, null);

    render(
      mantineRecoilWrap(
        <>
          <MockSelectedPatient />
          <ResourcePanel />
        </>
      )
    );

    expect(screen.getByText(/select a patient to add resources/i)).toBeInTheDocument();
  });

  it('should render patient name and resource count when selected', async () => {
    const MockSelectedPatient = getMockRecoilState(selectedPatientState, 'example-pt');
    const MockPatientState = getMockRecoilState(patientTestCaseState, {
      'example-pt': {
        patient: {
          resourceType: 'Patient',
          id: 'example-pt',
          name: [
            {
              given: ['Test123'],
              family: 'Patient456'
            }
          ]
        } as fhir4.Patient,
        resources: []
      }
    });

    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockPatientState />
            <MockSelectedPatient />
            <ResourcePanel />
          </>
        )
      );
    });

    expect(screen.getByText(/test123 patient456 resources \(0\)/i)).toBeInTheDocument();
  });
});
