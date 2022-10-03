import DateSelectors from '../../../components/measure-upload/DateSelectors';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { getMockRecoilState, mantineRecoilWrap } from '../../helpers/testHelpers';
import { DateTime } from 'luxon';
import { measurementPeriodState } from '../../../state/atoms/measurementPeriod';

describe('DateSelectors', () => {
  it('renders a date range picker with proper labels', () => {
    render(mantineRecoilWrap(<DateSelectors />));

    const periodSelector = screen.getByLabelText('Measurement Period Range');
    expect(periodSelector).toBeInTheDocument();
  });
  it('renders date display when measurement period exists', () => {
    const MockMP = getMockRecoilState(measurementPeriodState, {
      start: DateTime.fromISO('2020-01-01').toJSDate(),
      end: DateTime.fromISO('2021-01-01').toJSDate()
    });
    render(
      mantineRecoilWrap(
        <>
          <MockMP />
          <DateSelectors />
        </>
      )
    );

    const dateRangeDisplay = screen.getByDisplayValue('January 1, 2020 – January 1, 2021');
    expect(dateRangeDisplay).toBeInTheDocument();
  });
  //TODO: Add unit testing for updates on change
});
