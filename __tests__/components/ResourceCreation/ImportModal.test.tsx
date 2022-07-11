import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import ImportModal, { ImportModalProps } from '../../../components/ResourceCreation/ImportModal';

describe('ImportModal', () => {
  it('should render a modal when set to open', () => {
    const testImportModalProps: ImportModalProps = {
      open: true,
      onClose: jest.fn(),
      onImportSubmit: jest.fn()
    };
    render(<ImportModal {...testImportModalProps} />);

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
  });

  it('should not render a modal when not set to open', () => {
    const testImportModalProps: ImportModalProps = {
      open: false,
      onClose: jest.fn(),
      onImportSubmit: jest.fn()
    };
    render(<ImportModal {...testImportModalProps} />);

    const modal = screen.queryByRole('dialog');
    expect(modal).not.toBeInTheDocument();
  });

  // TODO (Matt): look at disabledness
  it.skip('should call onImportSubmit when import button is clicked', () => {
    const testImportModalProps: ImportModalProps = {
      open: true,
      onClose: jest.fn(),
      onImportSubmit: jest.fn()
    };

    render(<ImportModal {...testImportModalProps} />);

    const submitButton = screen.getByRole('button', { name: 'Import' });
    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    expect(testImportModalProps.onImportSubmit).toHaveBeenCalledTimes(1);
    expect(testImportModalProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when cancel button is clicked', () => {
    const testImportModalProps: ImportModalProps = {
      open: true,
      onClose: jest.fn(),
      onImportSubmit: jest.fn()
    };

    render(<ImportModal {...testImportModalProps} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    expect(cancelButton).toBeInTheDocument();

    fireEvent.click(cancelButton);

    expect(testImportModalProps.onImportSubmit).toHaveBeenCalledTimes(0);
    expect(testImportModalProps.onClose).toHaveBeenCalledTimes(1);
  });
});
