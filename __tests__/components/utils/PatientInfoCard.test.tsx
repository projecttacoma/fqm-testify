import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import PatientInfoCard, { PatientInfoCardProps } from '../../../components/utils/PatientInfoCard';
import { measureBundleState } from '../../../state/atoms/measureBundle';
import { getMockRecoilState, mantineRecoilWrap } from '../../helpers/testHelpers';

const EXAMPLE_PATIENT: fhir4.Patient = {
  resourceType: 'Patient',
  id: 'example-pt',
  name: [{ given: ['Test123'], family: 'Patient456' }],
  birthDate: '1996-07-19'
};

const TEST_MEASURE_BUNDLE: fhir4.Bundle = {
  resourceType: 'Bundle',
  type: 'transaction',
  entry: [
    {
      resource: {
        resourceType: 'Measure',
        status: 'active',
        group: [
          {
            population: [
              {
                code: {
                  coding: [
                    {
                      system: 'test-system',
                      code: 'denominator',
                      display: 'Denominator'
                    }
                  ]
                },
                criteria: {
                  language: 'text/cql.identifier',
                  expression: 'Denominator'
                }
              }
            ]
          }
        ]
      }
    }
  ]
};

const MEASURE_BUNDLE_POPULATED = {
  name: 'measureBundle',
  content: TEST_MEASURE_BUNDLE
};

const MOCK_CALLBACK_PROPS: Omit<PatientInfoCardProps, 'patient'> = {
  onEditClick: jest.fn(),
  onDeleteClick: jest.fn(),
  onExportClick: jest.fn(),
  onCopyClick: jest.fn(),
  selected: true
};

describe('PatientInfoCard', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render patient name on card', () => {
    render(mantineRecoilWrap(<PatientInfoCard patient={EXAMPLE_PATIENT} {...MOCK_CALLBACK_PROPS} />));

    expect(screen.getByText(/test123 patient456/i)).toBeInTheDocument();
  });

  it('should render patient DOB on card', () => {
    render(mantineRecoilWrap(<PatientInfoCard patient={EXAMPLE_PATIENT} {...MOCK_CALLBACK_PROPS} />));

    expect(screen.getByText('DOB: 1996-07-19')).toBeInTheDocument();
  });

  it('should render export button', () => {
    render(mantineRecoilWrap(<PatientInfoCard patient={EXAMPLE_PATIENT} {...MOCK_CALLBACK_PROPS} />));

    expect(screen.getByLabelText(/export patient/i)).toBeInTheDocument();
  });

  it('should render edit button', () => {
    render(mantineRecoilWrap(<PatientInfoCard patient={EXAMPLE_PATIENT} {...MOCK_CALLBACK_PROPS} />));

    expect(screen.getByLabelText(/edit patient/i)).toBeInTheDocument();
  });

  it('should render copy button', () => {
    render(mantineRecoilWrap(<PatientInfoCard patient={EXAMPLE_PATIENT} {...MOCK_CALLBACK_PROPS} />));

    expect(screen.getByLabelText(/copy patient/i)).toBeInTheDocument();
  });

  it('should render delete button', () => {
    render(mantineRecoilWrap(<PatientInfoCard patient={EXAMPLE_PATIENT} {...MOCK_CALLBACK_PROPS} />));

    expect(screen.getByLabelText(/delete patient/i)).toBeInTheDocument();
  });

  it('should call export callback when button clicked', () => {
    render(mantineRecoilWrap(<PatientInfoCard patient={EXAMPLE_PATIENT} {...MOCK_CALLBACK_PROPS} />));

    const exportButton = screen.getByLabelText(/export patient/i) as HTMLButtonElement;

    fireEvent.click(exportButton);

    expect(MOCK_CALLBACK_PROPS.onExportClick).toHaveBeenCalledTimes(1);
    expect(MOCK_CALLBACK_PROPS.onEditClick).toHaveBeenCalledTimes(0);
    expect(MOCK_CALLBACK_PROPS.onDeleteClick).toHaveBeenCalledTimes(0);
    expect(MOCK_CALLBACK_PROPS.onCopyClick).toHaveBeenCalledTimes(0);
  });

  it('should call edit callback when button clicked', () => {
    render(mantineRecoilWrap(<PatientInfoCard patient={EXAMPLE_PATIENT} {...MOCK_CALLBACK_PROPS} />));

    const editButton = screen.getByLabelText(/edit patient/i) as HTMLButtonElement;

    fireEvent.click(editButton);

    expect(MOCK_CALLBACK_PROPS.onEditClick).toHaveBeenCalledTimes(1);
    expect(MOCK_CALLBACK_PROPS.onExportClick).toHaveBeenCalledTimes(0);
    expect(MOCK_CALLBACK_PROPS.onDeleteClick).toHaveBeenCalledTimes(0);
    expect(MOCK_CALLBACK_PROPS.onCopyClick).toHaveBeenCalledTimes(0);
  });

  it('should call copy callback when button clicked', () => {
    render(mantineRecoilWrap(<PatientInfoCard patient={EXAMPLE_PATIENT} {...MOCK_CALLBACK_PROPS} />));

    const editButton = screen.getByLabelText(/copy patient/i) as HTMLButtonElement;

    fireEvent.click(editButton);

    expect(MOCK_CALLBACK_PROPS.onCopyClick).toHaveBeenCalledTimes(1);
    expect(MOCK_CALLBACK_PROPS.onEditClick).toHaveBeenCalledTimes(0);
    expect(MOCK_CALLBACK_PROPS.onExportClick).toHaveBeenCalledTimes(0);
    expect(MOCK_CALLBACK_PROPS.onDeleteClick).toHaveBeenCalledTimes(0);
  });

  it('should call delete callback when button clicked', () => {
    render(mantineRecoilWrap(<PatientInfoCard patient={EXAMPLE_PATIENT} {...MOCK_CALLBACK_PROPS} />));

    const deleteButton = screen.getByLabelText(/delete patient/i) as HTMLButtonElement;

    fireEvent.click(deleteButton);

    expect(MOCK_CALLBACK_PROPS.onDeleteClick).toHaveBeenCalledTimes(1);
    expect(MOCK_CALLBACK_PROPS.onExportClick).toHaveBeenCalledTimes(0);
    expect(MOCK_CALLBACK_PROPS.onEditClick).toHaveBeenCalledTimes(0);
    expect(MOCK_CALLBACK_PROPS.onCopyClick).toHaveBeenCalledTimes(0);
  });

  it('should render populations dropdown if selected', () => {
    const MockMB = getMockRecoilState(measureBundleState, MEASURE_BUNDLE_POPULATED);
    render(
      mantineRecoilWrap(
        <>
          <MockMB />
          <PatientInfoCard patient={EXAMPLE_PATIENT} {...MOCK_CALLBACK_PROPS} />
        </>
      )
    );

    const populationSelector = screen.getByPlaceholderText(/select populations/i) as HTMLInputElement;
    expect(populationSelector).toBeInTheDocument();
  });
});
