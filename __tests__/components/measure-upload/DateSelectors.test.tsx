import DateSelectors from '../../../components/measure-upload/DateSelectors';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { mantineRecoilWrap } from '../../helpers/testHelpers';

describe('DateSelectors', () => {
  beforeAll(() => {
    window.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn()
    }));
  });

  it('renders a date range picker with proper labels', () => {
    render(mantineRecoilWrap(<DateSelectors />));

    const periodSelector = screen.getByLabelText('Measurement Period Range');
    expect(periodSelector).toBeInTheDocument();
  });
  //TODO: Add unit testing for updates on change
});
