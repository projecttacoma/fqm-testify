import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { mantineRecoilWrap, getMockRecoilState } from '../helpers/testHelpers';
import TestResourcesDisplay from '../../components/TestResources';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { measureBundleState } from '../../state/atoms/measureBundle';
import noMissingVSBundle from '../fixtures/bundles/EXM130Fixture.json';
import dataRequirementsResponse from '../fixtures/DataRequirementsResponse.json';

const PATIENT_TEST_CASE_POPULATED = { pid1: { resourceType: 'Patient' } as fhir4.Patient };
const MEASURE_BUNDLE_POPULATED = {
  name: 'testName',
  content: noMissingVSBundle as fhir4.Bundle
};

describe('TestResourcesDisplay', () => {
  test('Display appears when patientTestCaseState and measureBundleState are populated', async () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, PATIENT_TEST_CASE_POPULATED);
    const MockMB = getMockRecoilState(measureBundleState, MEASURE_BUNDLE_POPULATED);
    const { Calculator } = require('fqm-execution');

    jest.spyOn(Calculator, 'calculateDataRequirements').mockImplementation(async () => dataRequirementsResponse);
    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockMB />
            <MockPatients />
            <TestResourcesDisplay />
          </>
        )
      );
    });
    const affix = screen.getByTestId('test-resource-affix');
    expect(affix).toBeInTheDocument();

    const observationText = screen.getByText('Observation');
    expect(observationText).toBeInTheDocument();
    const vsText = screen.getByText('w/ http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.198.12.1013');
    expect(vsText).toBeInTheDocument();
  });
  test('Display does not appear when patientTestCaseState is not populated', async () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, {});
    const MockMB = getMockRecoilState(measureBundleState, MEASURE_BUNDLE_POPULATED);
    const { Calculator } = require('fqm-execution');

    jest.spyOn(Calculator, 'calculateDataRequirements').mockImplementation(async () => dataRequirementsResponse);
    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockMB />
            <MockPatients />
            <TestResourcesDisplay />
          </>
        )
      );
    });
    const affix = screen.queryByTestId('test-resource-affix');
    expect(affix).not.toBeInTheDocument();
  });
  test('Display does not appear when measureBundleState is not populated', async () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, {});
    const MockMB = getMockRecoilState(measureBundleState, { name: '', content: null });
    const { Calculator } = require('fqm-execution');

    jest.spyOn(Calculator, 'calculateDataRequirements').mockImplementation(async () => dataRequirementsResponse);
    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockMB />
            <MockPatients />
            <TestResourcesDisplay />
          </>
        )
      );
    });
    const affix = screen.queryByTestId('test-resource-affix');
    expect(affix).not.toBeInTheDocument();
  });
});
