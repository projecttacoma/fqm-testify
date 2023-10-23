import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MeasureUploadHeader from '../../../components/utils/MeasureFileUploadHeader';
import { createMockRouter, mantineRecoilWrap } from '../../helpers/testHelpers';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';

describe('MeasureUploadHeader', () => {
  it('renders a measure upload heading for the base url', () => {
    render(
      mantineRecoilWrap(
        <RouterContext.Provider value={createMockRouter({ pathname: '/' })}>
          <MeasureUploadHeader />
        </RouterContext.Provider>
      )
    );

    const stepHeader = screen.getByText(/Step 1:/i);
    const measureUploadHeader = screen.getByText(/Upload a Measure Bundle/i);
    expect(stepHeader).toBeInTheDocument();
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
