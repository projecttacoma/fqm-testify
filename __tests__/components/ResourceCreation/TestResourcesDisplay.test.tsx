import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { mantineRecoilWrap, getMockRecoilState } from '../../helpers/testHelpers';
import TestResourcesDisplay from '../../../components/ResourceCreation/TestResourcesDisplay';
import { patientTestCaseState, TestCase } from '../../../state/atoms/patientTestCase';
import { measureBundleState } from '../../../state/atoms/measureBundle';
import noMissingVSBundle from '../../fixtures/bundles/EXM130Fixture.json';
import dataRequirementsResponse from '../../fixtures/DataRequirementsResponse.json';
import { Calculator } from 'fqm-execution';
import { DRCalculationOutput } from 'fqm-execution/build/types/Calculator';
import { Suspense } from 'react';

const PATIENT_TEST_CASE_POPULATED: TestCase = {
  pid1: { patient: { resourceType: 'Patient' } as fhir4.Patient, resources: [] }
};
const MEASURE_BUNDLE_POPULATED = {
  name: 'testName',
  content: noMissingVSBundle as fhir4.Bundle
};

describe('TestResourcesDisplay', () => {
  test('Display appears when patientTestCaseState and measureBundleState are populated', async () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, PATIENT_TEST_CASE_POPULATED);
    const MockMB = getMockRecoilState(measureBundleState, MEASURE_BUNDLE_POPULATED);

    jest
      .spyOn(Calculator, 'calculateDataRequirements')
      .mockImplementation(async () => dataRequirementsResponse as DRCalculationOutput);
    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockMB />
            <MockPatients />
            <Suspense>
              <TestResourcesDisplay />
            </Suspense>
          </>
        )
      );
    });
    const trp = screen.getByTestId('test-resource-panel');
    expect(trp).toBeInTheDocument();

    const observationText = screen.getByText('Observation');
    expect(observationText).toBeInTheDocument();
    const vsText = screen.getByText(
      'FITDNA (http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.108.12.1039)'
    );
    expect(vsText).toBeInTheDocument();
  });
  test('Display does not appear when patientTestCaseState is not populated', async () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, {});
    const MockMB = getMockRecoilState(measureBundleState, MEASURE_BUNDLE_POPULATED);

    jest
      .spyOn(Calculator, 'calculateDataRequirements')
      .mockImplementation(async () => dataRequirementsResponse as DRCalculationOutput);
    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockMB />
            <MockPatients />
            <Suspense>
              <TestResourcesDisplay />
            </Suspense>
          </>
        )
      );
    });
    const trp = screen.queryByTestId('test-resource-panel');
    expect(trp).not.toBeInTheDocument();
  });
  test('Display does not appear when measureBundleState is not populated', async () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, {});
    const MockMB = getMockRecoilState(measureBundleState, { name: '', content: null });

    jest
      .spyOn(Calculator, 'calculateDataRequirements')
      .mockImplementation(async () => dataRequirementsResponse as DRCalculationOutput);
    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockMB />
            <MockPatients />
            <Suspense>
              <TestResourcesDisplay />
            </Suspense>
          </>
        )
      );
    });
    const trp = screen.queryByTestId('test-resource-panel');
    expect(trp).not.toBeInTheDocument();
  });
});
