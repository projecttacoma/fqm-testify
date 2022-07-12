import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { mantineRecoilWrap, getMockRecoilState } from '../../helpers/testHelpers';
import { patientTestCaseState } from '../../../state/atoms/patientTestCase';
import React from 'react';
import ResourceCreationPanel from '../../../components/ResourceCreation/ResourceCreationPanel';
import { downloadZip } from '../../../util/downloadUtil';

jest.mock('../../../util/downloadUtil', () => ({
  downloadZip: jest.fn()
}));

describe('ResourceCreationPanel', () => {
  it('should render a create patient button', () => {
    render(
      mantineRecoilWrap(
        <>
          <ResourceCreationPanel />
        </>
      )
    );

    const button = screen.getByRole('button', { name: 'Create Patient' });
    expect(button).toBeInTheDocument();
  });

  it('should render a download all patients button', () => {
    render(
      mantineRecoilWrap(
        <>
          <ResourceCreationPanel />
        </>
      )
    );

    const button = screen.getByRole('button', { name: 'Download All Patients' });
    expect(button).toBeInTheDocument();
  });

  it('download all patients button should be disabled if there are no current patients', () => {
    const MockCurrentPatients = getMockRecoilState(patientTestCaseState, {});

    render(
      mantineRecoilWrap(
        <>
          <MockCurrentPatients />
          <ResourceCreationPanel />
        </>
      )
    );

    const button = screen.getByRole('button', { name: 'Download All Patients' });
    expect(button).toBeDisabled();
  });

  it('download all patients button should be enabled if there is at least one current patient', () => {
    const MockCurrentPatients = getMockRecoilState(patientTestCaseState, {
      'example-test-case1': {
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
          <MockCurrentPatients />
          <ResourceCreationPanel />
        </>
      )
    );

    const button = screen.getByRole('button', { name: 'Download All Patients' });
    expect(button).not.toBeDisabled();
  });

  it('should call downloadZip function when download all patients button is clicked', () => {
    const MockCurrentPatients = getMockRecoilState(patientTestCaseState, {
      'example-test-case1': {
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
          <MockCurrentPatients />
          <ResourceCreationPanel />
        </>
      )
    );

    const button = screen.getByRole('button', { name: 'Download All Patients' });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(downloadZip).toBeCalledTimes(1);
  });
  // TODO (MATT/ELSA): Add test case for new button
  it('should render a import test cases(s) button', () => {
    render(
      mantineRecoilWrap(
        <>
          <ResourceCreationPanel />
        </>
      )
    );

    const button = screen.getByRole('button', { name: 'Import Test Case(s)' }); // TODO(MATT) ???????
    expect(button).toBeInTheDocument();
  });
});
