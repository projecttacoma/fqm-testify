import DateSelectors from '../../components/measure-upload/DateSelectors';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { mantineRecoilWrap, getMockRecoilState } from '../helpers/testHelpers';
import { measurementPeriodState } from '../../state/atoms/measurementPeriod';
import { act } from 'react-dom/test-utils';
import { DateTime } from 'luxon';

describe('DateSelectors', () => {
  it('renders two date selectors with proper labels', () => {
    render(mantineRecoilWrap(<DateSelectors />));

    const periodStartSelector = screen.getByLabelText('Measurement Period Start');
    expect(periodStartSelector).toBeInTheDocument();
    const periodEndSelector = screen.getByLabelText('Measurement Period End');
    expect(periodEndSelector).toBeInTheDocument();
  });
  it('Updates measurementPeriodState when period start date selected', async () => {
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
    const periodStartSelector = screen.getByPlaceholderText('Select start date');
    await act(async () => {
      fireEvent.change(periodStartSelector, { target: { value: DateTime.fromISO('2019-01-01').toJSDate() } });
    });
    const dateDisplay = screen.getByDisplayValue('January 1, 2019');
    expect(dateDisplay).toBeInTheDocument();
  });
  it('Updates measurementPeriodState when period end date selected', async () => {
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
    const periodEndSelector = screen.getByPlaceholderText('Select end date');
    await act(async () => {
      fireEvent.change(periodEndSelector, { target: { value: DateTime.fromISO('2022-01-01').toJSDate() } });
    });
    const dateDisplay = screen.getByDisplayValue('January 1, 2022');
    expect(dateDisplay).toBeInTheDocument();
  });
});
