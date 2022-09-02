import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import PatientInfoCard, { PatientInfoCardProps } from '../../../components/utils/PatientInfoCard';
import { mantineRecoilWrap } from '../../helpers/testHelpers';

const EXAMPLE_PATIENT: fhir4.Patient = {
  resourceType: 'Patient',
  id: 'example-pt',
  name: [{ given: ['Test123'], family: 'Patient456' }],
  birthDate: '1996-07-19'
};

const MOCK_CALLBACK_PROPS: Omit<PatientInfoCardProps, 'patient'> = {
  onEditClick: jest.fn(),
  onDeleteClick: jest.fn(),
  onExportClick: jest.fn()
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
  });

  it('should call edit callback when button clicked', () => {
    render(mantineRecoilWrap(<PatientInfoCard patient={EXAMPLE_PATIENT} {...MOCK_CALLBACK_PROPS} />));

    const editButton = screen.getByLabelText(/edit patient/i) as HTMLButtonElement;

    fireEvent.click(editButton);

    expect(MOCK_CALLBACK_PROPS.onEditClick).toHaveBeenCalledTimes(1);
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
  });
});
