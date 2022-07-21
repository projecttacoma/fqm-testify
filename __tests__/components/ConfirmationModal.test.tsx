import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConfirmationModal, { ConfirmationModalProps } from '../../components/ConfirmationModal';

describe('Confirmation Modal', () => {
  it('should render a confirmation modal when set to open', () => {
    const testConfirmationModalProps: ConfirmationModalProps = {
      open: true,
      onClose: jest.fn(),
      onConfirm: jest.fn()
    };
    render(<ConfirmationModal {...testConfirmationModalProps} />);

    const confirmationModal = screen.getByRole('dialog');
    expect(confirmationModal).toBeInTheDocument();
  });

  it('should not render a confirmation modal when not set to open', () => {
    const testConfirmationModalProps: ConfirmationModalProps = {
      open: false,
      onClose: jest.fn(),
      onConfirm: jest.fn()
    };
    render(<ConfirmationModal {...testConfirmationModalProps} />);

    const confirmationModal = screen.queryByRole('dialog');
    expect(confirmationModal).not.toBeInTheDocument();
  });

  it('should call on delete patient test case when yes button is clicked', () => {
    const testConfirmationModalProps: ConfirmationModalProps = {
      open: true,
      onClose: jest.fn(),
      onConfirm: jest.fn()
    };
    render(<ConfirmationModal {...testConfirmationModalProps} />);

    const yesButton = screen.getByTestId('yes-button') as HTMLButtonElement;
    expect(yesButton).toBeInTheDocument();

    fireEvent.click(yesButton);

    expect(testConfirmationModalProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should not call on delete patient test case when cancel button is clicked', () => {
    const testConfirmationModalProps: ConfirmationModalProps = {
      open: true,
      onClose: jest.fn(),
      onConfirm: jest.fn()
    };
    render(<ConfirmationModal {...testConfirmationModalProps} />);

    const cancelButton = screen.getByTestId('cancel-button') as HTMLButtonElement;
    expect(cancelButton).toBeInTheDocument();

    fireEvent.click(cancelButton);

    expect(testConfirmationModalProps.onConfirm).toHaveBeenCalledTimes(0);
    expect(testConfirmationModalProps.onClose).toHaveBeenCalledTimes(1);
  });
});
