import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createMockRouter, getMockRecoilState, mantineRecoilWrap } from '../../helpers/testHelpers';
import AppHeader from '../../../components/utils/AppHeader';
import { MOCK_MEASURE_BUNDLE } from '../../../fixtures/test/measureBundle';
import { measurementPeriodEndState, measurementPeriodStartState } from '../../../state/atoms/measurementPeriod';
import { DateTime } from 'luxon';
import { measureBundleState } from '../../../state/atoms/measureBundle';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';

describe('AppHeader', () => {
  it('renders a heading with title and no card for base url', () => {
    render(
      mantineRecoilWrap(
        <RouterContext.Provider value={createMockRouter({ pathname: '/' })}>
          <AppHeader />
        </RouterContext.Provider>
      )
    );

    const heading = screen.getByText(/FQM Testify: an ECQM Analysis Tool/i);
    expect(heading).toBeInTheDocument();
  });

  it('renders a heading with title and card for non-base url', () => {
    const MockMB = getMockRecoilState(measureBundleState, MOCK_MEASURE_BUNDLE);
    const MockPeriodStart = getMockRecoilState(measurementPeriodStartState, DateTime.fromISO('2020-01-01').toJSDate());
    const MockPeriodEnd = getMockRecoilState(measurementPeriodEndState, DateTime.fromISO('2021-01-01').toJSDate());
    render(
      mantineRecoilWrap(
        <RouterContext.Provider value={createMockRouter({ pathname: 'non-base-path' })}>
          <MockMB />
          <MockPeriodStart />
          <MockPeriodEnd />
          <AppHeader />
        </RouterContext.Provider>
      )
    );

    const heading = screen.getByText(/FQM Testify: an ECQM Analysis Tool/i);
    expect(heading).toBeInTheDocument();
    const mbName = screen.getByText(MOCK_MEASURE_BUNDLE.fileName);
    expect(mbName).toBeInTheDocument();
    const dateString = screen.getByText(/January 1, 2020 - January 1, 2021/i);
    expect(dateString).toBeInTheDocument();
  });
});
