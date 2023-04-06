import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MeasureUploadError } from '../../../components/measure-upload/MeasureFileUpload';
import UploadErrorLog from '../../../components/measure-upload/UploadErrorLog';
import { mantineRecoilWrap, mockResizeObserver } from '../../helpers/testHelpers';

const MOCK_SIMPLE_ERROR: MeasureUploadError = {
  id: 'simple-error',
  message: 'this is a simple error',
  timestamp: '1996-07-19T20:12:00.0Z',
  attemptedFileName: 'fake-bundle.json',
  isValueSetMissingError: false
};

describe('UploadErrorLog', () => {
  beforeAll(() => {
    window.ResizeObserver = mockResizeObserver;
  });

  it('should render no errors for empty error log', () => {
    render(mantineRecoilWrap(<UploadErrorLog uploadSuccess={false} errorLog={[]} />));

    expect(screen.getByText(/no errors!/i)).toBeInTheDocument();
  });

  it('should render red error heading on unsuccessful upload with non-empty log', () => {
    render(mantineRecoilWrap(<UploadErrorLog uploadSuccess={false} errorLog={[MOCK_SIMPLE_ERROR]} />));

    const errorHeading = screen.getByText(/errors/i);
    expect(errorHeading).toBeInTheDocument();
    expect(errorHeading).not.toHaveStyle('color: #000'); // Color of text should change
  });

  afterAll(() => {
    jest.clearAllMocks();
  });
});
