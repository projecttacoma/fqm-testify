import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createMockRouter, mockResizeObserver } from '../../helpers/testHelpers';
import ClauseCoveragePage from '../../../pages/[measureId]/coverage';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';

describe('coverage page rendering', () => {
  beforeAll(() => {
    window.ResizeObserver = mockResizeObserver;
  });

  it('should display back button', async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: {
              measureId: 'measure-EXM130-7.3.000',
              clauseCoverageHTML: '{"testgroupID": "test html"}',
              clauseUncoverageHTML: '{"testgroupID": "test uncoverage html"}'
            }
          })}
        >
          <ClauseCoveragePage />
        </RouterContext.Provider>
      );
    });

    const backButton = screen.getByRole('button', { name: 'Back Button' }) as HTMLButtonElement;
    expect(backButton).toBeInTheDocument();
  });

  it('should display header with measure id of calculated measure, and HTML content', async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: {
              measureId: 'measure-EXM130-7.3.000',
              clauseCoverageHTML: '{"testgroupID": "test html"}',
              clauseUncoverageHTML: '{"testgroupID": "test uncoverage html"}'
            }
          })}
        >
          <ClauseCoveragePage />
        </RouterContext.Provider>
      );
    });

    expect(screen.getByText('Clause coverage for measure bundle: measure-EXM130-7.3.000')).toBeInTheDocument();
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

    expect(
      screen.getByText('No clause coverage results available for measure bundle: measure-EXM130-7.3.000')
    ).toBeInTheDocument();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });
});
