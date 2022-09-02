import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import ResourceInfoCard, { ResourceInfoCardProps } from '../../../components/utils/ResourceInfoCard';
import { mantineRecoilWrap } from '../../helpers/testHelpers';

const EXAMPLE_RESOURCE_TYPE = 'Procedure';
const EXAMPLE_LABEL = 'Colonoscopy (http://example.com/ValueSet/example-vs)';

const MOCK_CALLBACK_PROPS: Omit<ResourceInfoCardProps, 'resourceType' | 'label'> = {
  onEditClick: jest.fn(),
  onDeleteClick: jest.fn()
};

describe('ResourceInfoCard', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render resourceType on card', () => {
    render(
      mantineRecoilWrap(
        <ResourceInfoCard resourceType={EXAMPLE_RESOURCE_TYPE} label={EXAMPLE_LABEL} {...MOCK_CALLBACK_PROPS} />
      )
    );

    expect(screen.getByText(EXAMPLE_RESOURCE_TYPE)).toBeInTheDocument();
  });

  it('should render label on card', () => {
    render(
      mantineRecoilWrap(
        <ResourceInfoCard resourceType={EXAMPLE_RESOURCE_TYPE} label={EXAMPLE_LABEL} {...MOCK_CALLBACK_PROPS} />
      )
    );

    expect(screen.getByText(EXAMPLE_LABEL)).toBeInTheDocument();
  });

  it('should render edit button', () => {
    render(
      mantineRecoilWrap(
        <ResourceInfoCard resourceType={EXAMPLE_RESOURCE_TYPE} label={EXAMPLE_LABEL} {...MOCK_CALLBACK_PROPS} />
      )
    );

    expect(screen.getByLabelText(/edit resource/i)).toBeInTheDocument();
  });

  it('should render delete button', () => {
    render(
      mantineRecoilWrap(
        <ResourceInfoCard resourceType={EXAMPLE_RESOURCE_TYPE} label={EXAMPLE_LABEL} {...MOCK_CALLBACK_PROPS} />
      )
    );

    expect(screen.getByLabelText(/delete resource/i)).toBeInTheDocument();
  });

  it('should call edit callback when button clicked', () => {
    render(
      mantineRecoilWrap(
        <ResourceInfoCard resourceType={EXAMPLE_RESOURCE_TYPE} label={EXAMPLE_LABEL} {...MOCK_CALLBACK_PROPS} />
      )
    );

    const editButton = screen.getByLabelText(/edit resource/i) as HTMLButtonElement;

    fireEvent.click(editButton);

    expect(MOCK_CALLBACK_PROPS.onEditClick).toHaveBeenCalledTimes(1);
    expect(MOCK_CALLBACK_PROPS.onDeleteClick).toHaveBeenCalledTimes(0);
  });

  it('should call edit callback when button clicked', () => {
    render(
      mantineRecoilWrap(
        <ResourceInfoCard resourceType={EXAMPLE_RESOURCE_TYPE} label={EXAMPLE_LABEL} {...MOCK_CALLBACK_PROPS} />
      )
    );

    const deleteButton = screen.getByLabelText(/delete resource/i) as HTMLButtonElement;

    fireEvent.click(deleteButton);

    expect(MOCK_CALLBACK_PROPS.onDeleteClick).toHaveBeenCalledTimes(1);
    expect(MOCK_CALLBACK_PROPS.onEditClick).toHaveBeenCalledTimes(0);
  });
});
