import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MeasureUploadError } from '../../../components/measure-upload/MeasureUpload';
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
  beforeEach(() => {
    window.ResizeObserver = mockResizeObserver;
  });

  it('should render no errors for empty error log', () => {
    render(mantineRecoilWrap(<UploadErrorLog uploadSuccess={false} errorLog={[]} />));

    expect(screen.getByText(/no errors/i)).toBeInTheDocument();
  });

  it('should render current error heading on unsuccessful upload with non-empty log', () => {
    render(mantineRecoilWrap(<UploadErrorLog uploadSuccess={false} errorLog={[MOCK_SIMPLE_ERROR]} />));

    expect(screen.getByText(/current errors/i)).toBeInTheDocument();
  });

  it('should render previous error heading on successful upload with non-empty log', () => {
    render(mantineRecoilWrap(<UploadErrorLog uploadSuccess={true} errorLog={[MOCK_SIMPLE_ERROR]} />));

    expect(screen.getByText(/previous errors/i)).toBeInTheDocument();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
