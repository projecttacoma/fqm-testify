import DateSelectors from '../../../components/measure-upload/DateSelectors';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { getMockRecoilState, mantineRecoilWrap } from '../../helpers/testHelpers';
import { DateTime } from 'luxon';
import { measurementPeriodEndState, measurementPeriodStartState } from '../../../state/atoms/measurementPeriod';

describe('DateSelectors', () => {
  it('renders a date range picker with proper labels', () => {
    render(mantineRecoilWrap(<DateSelectors setDatesValid={jest.fn()} />));

    expect(screen.getByLabelText(/start/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end/i)).toBeInTheDocument();
  });

  it('renders date display when measurement period exists', () => {
    const MockPeriodStart = getMockRecoilState(measurementPeriodStartState, DateTime.fromISO('2020-01-01').toJSDate());
    const MockPeriodEnd = getMockRecoilState(measurementPeriodEndState, DateTime.fromISO('2021-01-01').toJSDate());
    render(
      mantineRecoilWrap(
        <>
          <MockPeriodStart />
          <MockPeriodEnd />
          <DateSelectors setDatesValid={jest.fn()} />
        </>
      )
    );

    expect(screen.getByDisplayValue('January 1, 2020')).toBeInTheDocument();
    expect(screen.getByDisplayValue('January 1, 2021')).toBeInTheDocument();
  });
});
