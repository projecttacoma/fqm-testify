import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import CodeEditorModal, { CodeEditorModalProps } from '../../components/CodeEditorModal';
import { mantineRecoilWrap } from '../helpers/testHelpers';

describe('CodeEditorModal', () => {
  it('should render codemirror with provided value', () => {
    const initialValue = 'test-content';
    const testCodeModalProps: CodeEditorModalProps = {
      open: true,
      onClose: jest.fn(),
      onSave: jest.fn(),
      initialValue
    };
    render(mantineRecoilWrap(<CodeEditorModal {...testCodeModalProps} />));

    const cm = screen.getByTestId('codemirror');
    const content = within(cm).getByText(initialValue);

    expect(content).toBeInTheDocument();
  });

  it('should close without saving when cancel is clicked', () => {
    const initialValue = 'test-content';
    const testCodeModalProps: CodeEditorModalProps = {
      open: true,
      onClose: jest.fn(),
      onSave: jest.fn(),
      initialValue
    };

    render(mantineRecoilWrap(<CodeEditorModal {...testCodeModalProps} />));

    const cancelButton = screen.getByText(/cancel/i) as HTMLButtonElement;

    expect(cancelButton).toBeInTheDocument();

    fireEvent.click(cancelButton);

    expect(testCodeModalProps.onClose).toHaveBeenCalledTimes(1);
    expect(testCodeModalProps.onSave).toHaveBeenCalledTimes(0);
  });

  it('should save and close when save is clicked', () => {
    const initialValue = 'test-content';
    const testCodeModalProps: CodeEditorModalProps = {
      open: true,
      onClose: jest.fn(),
      onSave: jest.fn(),
      initialValue
    };

    render(mantineRecoilWrap(<CodeEditorModal {...testCodeModalProps} />));

    const cancelButton = screen.getByText(/save/i) as HTMLButtonElement;

    expect(cancelButton).toBeInTheDocument();

    fireEvent.click(cancelButton);

    expect(testCodeModalProps.onClose).toHaveBeenCalledTimes(1);
    expect(testCodeModalProps.onSave).toHaveBeenCalledTimes(1);
  });
});
