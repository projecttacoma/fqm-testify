import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { MeasureUploadError } from '../../../util/MeasureUploadUtils';
import UploadErrorInfo from '../../../components/utils/UploadErrorInfo';
import { mantineRecoilWrap } from '../../helpers/testHelpers';

const MOCK_SIMPLE_ERROR: MeasureUploadError = {
  id: 'simple-error',
  message: 'this is a simple error',
  timestamp: '1996-07-19T20:12:00.0Z',
  attemptedBundleDisplay: 'fake-bundle.json',
  isValueSetMissingError: false
};

const MOCK_VALUESET_ERROR: MeasureUploadError = {
  id: 'valueset-error',
  message: ['http://example.com/ValueSet/1', 'http://example.com/ValueSet/2'],
  timestamp: '1996-07-19T20:12:00.0Z',
  attemptedBundleDisplay: 'fake-bundle.json',
  isValueSetMissingError: true
};

describe('UploadErrorInfo', () => {
  it('should render file name and timestamp of error', () => {
    render(mantineRecoilWrap(<UploadErrorInfo error={MOCK_SIMPLE_ERROR} />));

    expect(screen.getByText(MOCK_SIMPLE_ERROR.attemptedBundleDisplay as string)).toBeInTheDocument();
    expect(screen.getByText(MOCK_SIMPLE_ERROR.timestamp)).toBeInTheDocument();
  });

  it('should render text of simple error message', () => {
    render(mantineRecoilWrap(<UploadErrorInfo error={MOCK_SIMPLE_ERROR} />));

    expect(screen.getByText(MOCK_SIMPLE_ERROR.message as string)).toBeInTheDocument();
  });

  it('should render missing valueset message with expand button for valueset error', () => {
    render(mantineRecoilWrap(<UploadErrorInfo error={MOCK_VALUESET_ERROR} />));

    expect(screen.getByText(/missing required valuesets/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Show Missing ValueSet URLs'
      })
    ).toBeInTheDocument();
  });

  it('should show valueset urls on expand button click', () => {
    render(mantineRecoilWrap(<UploadErrorInfo error={MOCK_VALUESET_ERROR} />));

    const expandButton = screen.getByRole('button', {
      name: 'Show Missing ValueSet URLs'
    });

    fireEvent.click(expandButton);

    // Button should change to "hide" display text
    expect(screen.getByText(/hide/i)).toBeInTheDocument();

    expect(screen.getByText(MOCK_VALUESET_ERROR.message[0])).toBeInTheDocument();
    expect(screen.getByText(MOCK_VALUESET_ERROR.message[1])).toBeInTheDocument();
  });
});
