import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { createMockRouter } from '../../helpers/testHelpers';
import ClauseCoveragePage from '../../../pages/[measureId]/coverage';

describe('coverage page rendering', () => {
  it('should display back button', async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { measureId: 'measure-EXM130-7.3.000' }
          })}
        >
          <ClauseCoveragePage />
        </RouterContext.Provider>
      );
    });

    const backButton = screen.getByRole('button', { name: 'Back Button' }) as HTMLButtonElement;
    expect(backButton).toBeInTheDocument();
  });

  it('should display header with measure id of calculated measure', async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { measureId: 'measure-EXM130-7.3.000' }
          })}
        >
          <ClauseCoveragePage />
        </RouterContext.Provider>
      );
    });

    expect(screen.getByText('Clause coverage for measure: measure-EXM130-7.3.000')).toBeInTheDocument();
  });
});
