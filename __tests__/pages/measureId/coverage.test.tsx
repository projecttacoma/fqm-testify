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
            query: { measureId: 'measure-EXM130-7.3.000' , clauseCoverageHTML: 'test html'}
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
            query: { measureId: 'measure-EXM130-7.3.000', clauseCoverageHTML: 'test html' }
          })}
        >
          <ClauseCoveragePage />
        </RouterContext.Provider>
      );
    });

    expect(screen.getByText('Clause coverage for measure bundle: measure-EXM130-7.3.000')).toBeInTheDocument();
  });

  it ('should display html content', async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { measureId: 'measure-EXM130-7.3.000', clauseCoverageHTML: 'test html' }
          })}
        >
          <ClauseCoveragePage />
        </RouterContext.Provider>
      );
    });
    const textDiv = screen.getByText('test html');
    expect(textDiv).toBeInTheDocument();
  });

  it('should display no clause coverage header when coverage html is not available', async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { measureId: 'measure-EXM130-7.3.000', clauseCoverageHTML: undefined }
          })}
        >
          <ClauseCoveragePage />
        </RouterContext.Provider>
      );
    });

    expect(screen.getByText('No clause coverage results available for measure bundle: measure-EXM130-7.3.000')).toBeInTheDocument();
  })
});
