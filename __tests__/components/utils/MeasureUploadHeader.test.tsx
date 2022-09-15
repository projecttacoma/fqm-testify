import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import MeasureUploadHeader from '../../../components/utils/MeasureUploadHeader';
import { createMockRouter, mantineRecoilWrap } from '../../helpers/testHelpers';

describe('MeasureUploadHeader', () => {
  it('renders a measure upload heading for the base url', () => {
    render(
      mantineRecoilWrap(
        <RouterContext.Provider value={createMockRouter({ pathname: '/' })}>
          <MeasureUploadHeader />
        </RouterContext.Provider>
      )
    );

    const measureUploadHeader = screen.getByText(/Step 1: Upload a Measure Bundle/i);
    expect(measureUploadHeader).toBeInTheDocument();
  });

  it('renders an information popover for the base url', () => {
    render(
      mantineRecoilWrap(
        <RouterContext.Provider value={createMockRouter({ pathname: '/' })}>
          <MeasureUploadHeader />
        </RouterContext.Provider>
      )
    );

    expect(screen.getByLabelText(/more information/i)).toBeInTheDocument();
  });
});
