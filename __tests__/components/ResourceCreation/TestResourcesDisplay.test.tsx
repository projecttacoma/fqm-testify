import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { mantineRecoilWrap, getMockRecoilState } from '../../helpers/testHelpers';
import TestResourcesDisplay from '../../../components/ResourceCreation/TestResourcesDisplay';
import { patientTestCaseState, TestCase } from '../../../state/atoms/patientTestCase';
import { measureBundleState } from '../../../state/atoms/measureBundle';
import { Calculator } from 'fqm-execution';
import { Suspense } from 'react';
import { searchQueryState } from '../../../state/atoms/searchQuery';

const PATIENT_TEST_CASE_POPULATED: TestCase = {
  pid1: { patient: { resourceType: 'Patient' } as fhir4.Patient, resources: [] }
};

const MOCK_BUNDLE: fhir4.Bundle = {
  resourceType: 'Bundle',
  type: 'collection',
  entry: [
    {
      resource: {
        resourceType: 'ValueSet',
        name: 'Test ValueSet',
        status: 'draft',
        url: 'http://example.com/ValueSet/test-vs'
      }
    },
    {
      resource: {
        resourceType: 'ValueSet',
        name: 'Test ValueSet 2',
        status: 'draft',
        url: 'http://example.com/ValueSet/test-vs-2'
      }
    }
  ]
};

const MEASURE_BUNDLE_POPULATED = {
  name: 'testName',
  content: MOCK_BUNDLE
};

const MOCK_DATA_REQUIREMENTS: fhir4.Library = {
  resourceType: 'Library',
  type: {},
  status: 'draft',
  dataRequirement: [
    {
      type: 'Observation',
      codeFilter: [
        {
          path: 'code',
          valueSet: 'http://example.com/ValueSet/test-vs'
        }
      ]
    },
    {
      type: 'Encounter',
      codeFilter: [
        {
          path: 'code',
          valueSet: 'http://example.com/ValueSet/test-vs-2'
        }
      ]
    }
  ]
};

describe('TestResourcesDisplay', () => {
  it('should show display when patientTestCaseState and measureBundleState are populated', async () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, PATIENT_TEST_CASE_POPULATED);
    const MockMB = getMockRecoilState(measureBundleState, MEASURE_BUNDLE_POPULATED);

    jest.spyOn(Calculator, 'calculateDataRequirements').mockResolvedValue({
      results: MOCK_DATA_REQUIREMENTS
    });

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
    const vsText = screen.getByText('Test ValueSet (http://example.com/ValueSet/test-vs)');
    expect(vsText).toBeInTheDocument();
  });

  it('should show search bar with display when display is shown', async () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, PATIENT_TEST_CASE_POPULATED);
    const MockMB = getMockRecoilState(measureBundleState, MEASURE_BUNDLE_POPULATED);

    jest.spyOn(Calculator, 'calculateDataRequirements').mockResolvedValue({
      results: MOCK_DATA_REQUIREMENTS
    });

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
    const searchBar = screen.getByRole('textbox');
    expect(searchBar).toBeInTheDocument();
  });

  it('should not show display when patientTestCaseState is not populated', async () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, {});
    const MockMB = getMockRecoilState(measureBundleState, MEASURE_BUNDLE_POPULATED);

    jest.spyOn(Calculator, 'calculateDataRequirements').mockResolvedValue({
      results: MOCK_DATA_REQUIREMENTS
    });

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

  it('should not show display when measureBundleState is not populated', async () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, {});
    const MockMB = getMockRecoilState(measureBundleState, { name: '', content: null });

    jest.spyOn(Calculator, 'calculateDataRequirements').mockResolvedValue({
      results: MOCK_DATA_REQUIREMENTS
    });

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

  it('should show all data requirements in panel if search query (from search bar) is empty', async () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, PATIENT_TEST_CASE_POPULATED);
    const MockMB = getMockRecoilState(measureBundleState, MEASURE_BUNDLE_POPULATED);

    jest.spyOn(Calculator, 'calculateDataRequirements').mockResolvedValue({
      results: MOCK_DATA_REQUIREMENTS
    });

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
    const observationVsText = screen.getByText('Test ValueSet (http://example.com/ValueSet/test-vs)');
    expect(observationVsText).toBeInTheDocument();

    const encounterText = screen.getByText('Encounter');
    expect(encounterText).toBeInTheDocument();
    const encounterVsText = screen.getByText('Test ValueSet 2 (http://example.com/ValueSet/test-vs-2)');
    expect(encounterVsText).toBeInTheDocument();
  });

  it('should show no data requirements if fuzzy search does not return any results', async () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, PATIENT_TEST_CASE_POPULATED);
    const MockMB = getMockRecoilState(measureBundleState, MEASURE_BUNDLE_POPULATED);
    const MockSearchQuery = getMockRecoilState(searchQueryState, 'example search query that yields no results');

    jest.spyOn(Calculator, 'calculateDataRequirements').mockResolvedValue({
      results: MOCK_DATA_REQUIREMENTS
    });

    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockMB />
            <MockPatients />
            <MockSearchQuery />
            <Suspense>
              <TestResourcesDisplay />
            </Suspense>
          </>
        )
      );
    });
    const trp = screen.getByTestId('test-resource-panel');
    expect(trp).toBeInTheDocument();

    const observationText = screen.queryByText('Observation');
    expect(observationText).not.toBeInTheDocument();
    const observationVsText = screen.queryByText('Test ValueSet (http://example.com/ValueSet/test-vs)');
    expect(observationVsText).not.toBeInTheDocument();

    const encounterText = screen.queryByText('Encounter');
    expect(encounterText).not.toBeInTheDocument();
    const encounterVsText = screen.queryByText('Test ValueSet 2 (http://example.com/ValueSet/test-vs-2)');
    expect(encounterVsText).not.toBeInTheDocument();
  });

  it('should return a filtered set of the data requirements on successful fuzzy search with search bar', async () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, PATIENT_TEST_CASE_POPULATED);
    const MockMB = getMockRecoilState(measureBundleState, MEASURE_BUNDLE_POPULATED);
    const MockSearchQuery = getMockRecoilState(searchQueryState, 'encounter');

    jest.spyOn(Calculator, 'calculateDataRequirements').mockResolvedValue({
      results: MOCK_DATA_REQUIREMENTS
    });

    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockMB />
            <MockPatients />
            <MockSearchQuery />
            <Suspense>
              <TestResourcesDisplay />
            </Suspense>
          </>
        )
      );
    });
    const trp = screen.getByTestId('test-resource-panel');
    expect(trp).toBeInTheDocument();

    const observationText = screen.queryByText('Observation');
    expect(observationText).not.toBeInTheDocument();
    const observationVsText = screen.queryByText('Test ValueSet (http://example.com/ValueSet/test-vs)');
    expect(observationVsText).not.toBeInTheDocument();

    const encounterText = screen.getByText('Encounter');
    expect(encounterText).toBeInTheDocument();
    const encounterVsText = screen.getByText('Test ValueSet 2 (http://example.com/ValueSet/test-vs-2)');
    expect(encounterVsText).toBeInTheDocument();
  });
});
