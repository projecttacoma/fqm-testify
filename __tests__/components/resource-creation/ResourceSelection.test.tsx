import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Calculator } from 'fqm-execution';
import { Suspense } from 'react';
import ResourceSelection from '../../../components/resource-creation/ResourceSelection';
import { measureBundleState } from '../../../state/atoms/measureBundle';
import { patientTestCaseState, TestCase } from '../../../state/atoms/patientTestCase';
import { selectedPatientState } from '../../../state/atoms/selectedPatient';
import { getMockRecoilState, mantineRecoilWrap } from '../../helpers/testHelpers';

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

const MEASURE_BUNDLE_POPULATED = {
  fileName: 'measureBundle',
  content: MOCK_BUNDLE,
  isFile: true,
  displayMap: {},
  measureRepositoryUrl: '',
  selectedMeasureId: null
};

const MOCK_TEST_CASE_POPULATED: TestCase = {
  'example-pt': {
    patient: {
      resourceType: 'Patient',
      id: 'example-pt',
      name: [{ given: ['Test123'], family: 'Patient456' }]
    },
    fullUrl: 'urn:uuid:example-pt',
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

describe('ResourceSelection', () => {
  beforeAll(() => {
    window.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn()
    }));
  });

  it('should display select box of resources', async () => {
    const MockMB = getMockRecoilState(measureBundleState, MEASURE_BUNDLE_POPULATED);
    const MockPatients = getMockRecoilState(patientTestCaseState, MOCK_TEST_CASE_POPULATED);
    const MockSelectedPatient = getMockRecoilState(selectedPatientState, 'example-pt');

    jest.spyOn(Calculator, 'calculateDataRequirements').mockResolvedValue({
      results: MOCK_DATA_REQUIREMENTS
    });

    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockMB />
            <MockPatients />
            <MockSelectedPatient />
            <Suspense>
              <ResourceSelection />
            </Suspense>
          </>
        )
      );
    });

    const resourceSelector = screen.getByRole('combobox');
    expect(resourceSelector).toBeInTheDocument();
  });

  it('should show data requirements as options', async () => {
    const MockMB = getMockRecoilState(measureBundleState, MEASURE_BUNDLE_POPULATED);
    const MockPatients = getMockRecoilState(patientTestCaseState, MOCK_TEST_CASE_POPULATED);
    const MockSelectedPatient = getMockRecoilState(selectedPatientState, 'example-pt');

    jest.spyOn(Calculator, 'calculateDataRequirements').mockResolvedValue({
      results: MOCK_DATA_REQUIREMENTS
    });

    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockMB />
            <MockPatients />
            <MockSelectedPatient />
            <Suspense>
              <ResourceSelection />
            </Suspense>
          </>
        )
      );
    });

    const resourceSelector = screen.getByPlaceholderText(/select fhir resource/i) as HTMLInputElement;

    await act(async () => {
      fireEvent.click(resourceSelector);
    });

    expect(screen.getByText(/observation/i)).toBeInTheDocument();
    expect(screen.getByText(/test valueset \(http:\/\/example.com\/ValueSet\/test-vs\)/i)).toBeInTheDocument();
  });
});
