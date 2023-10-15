import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { mantineRecoilWrap, getMockRecoilState, createMockRouter } from '../../helpers/testHelpers';
import PatientCreationPanel from '../../../components/patient-creation/PatientCreationPanel';
import { patientTestCaseState } from '../../../state/atoms/patientTestCase';
import { selectedPatientState } from '../../../state/atoms/selectedPatient';
import { download } from '../../../util/downloadUtil';
import { Calculator } from 'fqm-execution';
import { Suspense } from 'react';
import { measureBundleState } from '../../../state/atoms/measureBundle';

jest.mock('../../../util/downloadUtil', () => ({
  download: jest.fn()
}));

// Mock out the getClientRects function to avoid warnings
document.createRange = () => {
  const range = new Range();

  range.getBoundingClientRect = jest.fn();

  range.getClientRects = jest.fn(() => ({
    item: () => null,
    length: 0,
    [Symbol.iterator]: jest.fn()
  }));

  return range;
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
      ],
      profile: ['http://hl7.org/fhir/us/qicore/StructureDefinition/qicore-observation']
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

describe('PatientCreationPanel', () => {
  it('should not render modal by default', async () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, {});

    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockPatients />
            <Suspense>
              <RouterContext.Provider value={createMockRouter({ pathname: '/' })}>
                <PatientCreationPanel />
              </RouterContext.Provider>
            </Suspense>
          </>
        )
      );
    });

    const modal = screen.queryByRole('dialog');
    expect(modal).not.toBeInTheDocument();
  });

  it('should render modal when create button is clicked', async () => {
    const MockMB = getMockRecoilState(measureBundleState, MEASURE_BUNDLE_POPULATED);
    const MockPatients = getMockRecoilState(patientTestCaseState, {});

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
              <RouterContext.Provider value={createMockRouter({ pathname: '/' })}>
                <PatientCreationPanel />
              </RouterContext.Provider>
            </Suspense>
          </>
        )
      );
    });

    const createButton = screen.getByRole('button', {
      name: /create/i
    });

    expect(createButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(createButton);
    });

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();

    const testPatientMetaProfile = screen.getByText(
      '"http://hl7.org/fhir/us/qicore/StructureDefinition/qicore-patient"'
    );
    expect(testPatientMetaProfile).toBeInTheDocument();
  });

  it('should not render test case list with empty state', async () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, {});

    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockPatients />
            <Suspense>
              <RouterContext.Provider value={createMockRouter({ pathname: '/' })}>
                <PatientCreationPanel />
              </RouterContext.Provider>
            </Suspense>
          </>
        )
      );
    });

    const testCaseList = screen.queryByTestId('patient-panel');
    expect(testCaseList).not.toBeInTheDocument();
  });

  it('should render test case list with populated state', async () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, {
      'example-pt': {
        patient: {
          resourceType: 'Patient',
          name: [{ given: ['Test123'], family: 'Patient456' }]
        },
        fullUrl: 'urn:uuid:testPatient',
        resources: []
      }
    });

    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockPatients />
            <Suspense>
              <RouterContext.Provider value={createMockRouter({ pathname: '/' })}>
                <PatientCreationPanel />
              </RouterContext.Provider>
            </Suspense>
          </>
        )
      );
    });

    const testPatientLabel = screen.getByText(/test123 patient456/i);
    expect(testPatientLabel).toBeInTheDocument();
  });

  it('should render confirmation modal when delete button is clicked', async () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, {
      'example-pt': {
        patient: {
          resourceType: 'Patient',
          name: [{ given: ['Test123'], family: 'Patient456' }]
        },
        fullUrl: 'urn:uuid:testPatient',
        resources: []
      }
    });

    const MockSelectedPatient = getMockRecoilState(selectedPatientState, 'example-pt');

    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockPatients />
            <MockSelectedPatient />
            <Suspense>
              <RouterContext.Provider value={createMockRouter({ pathname: '/' })}>
                <PatientCreationPanel />
              </RouterContext.Provider>
            </Suspense>
          </>
        )
      );
    });

    const deleteButton = screen.getByLabelText(/delete patient/i) as HTMLButtonElement;
    expect(deleteButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    const confirmationModal = screen.getByRole('dialog', { hidden: true });
    expect(confirmationModal).toBeInTheDocument();
  });

  it('should render modal when copy button is clicked', async () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, {
      'example-pt': {
        patient: {
          resourceType: 'Patient',
          name: [{ given: ['Test123'], family: 'Patient456' }]
        },
        fullUrl: 'urn:uuid:testPatient',
        resources: []
      }
    });

    const MockSelectedPatient = getMockRecoilState(selectedPatientState, 'example-pt');

    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockPatients />
            <MockSelectedPatient />
            <Suspense>
              <RouterContext.Provider value={createMockRouter({ pathname: '/' })}>
                <PatientCreationPanel />
              </RouterContext.Provider>
            </Suspense>
          </>
        )
      );
    });

    const copyButton = screen.getByLabelText(/copy patient/i) as HTMLButtonElement;
    expect(copyButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(copyButton);
    });

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
  });

  it.only('should have download function called when download patient button is clicked', async () => {
    const MockPatients = getMockRecoilState(patientTestCaseState, {
      'example-pt': {
        patient: {
          resourceType: 'Patient',
          name: [{ given: ['Test123'], family: 'Patient456' }]
        },
        fullUrl: 'urn:uuid:testPatient',
        resources: [
          {
            resource: {
              resourceType: 'Procedure',
              id: 'test-id',
              status: 'completed',
              subject: {}
            },
            fullUrl: 'urn:uuid:test-id'
          }
        ]
      }
    });

    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockPatients />
            <Suspense>
              <RouterContext.Provider value={createMockRouter({ pathname: '/' })}>
                <PatientCreationPanel />
              </RouterContext.Provider>
            </Suspense>
          </>
        )
      );
    });

    const exportButton = screen.getByLabelText(/export patient/i) as HTMLButtonElement;
    expect(exportButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(exportButton);
    });

    await waitFor(() => {
      expect(download).toBeCalledTimes(1);
    });
  });
});
