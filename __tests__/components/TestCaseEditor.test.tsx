import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import TestCaseEditor from '../../components/TestCaseEditor';
import { selectedPatientState } from '../../state/atoms/selectedPatient';
import { createMockRouter, getMockRecoilState, mantineRecoilWrap, mockResizeObserver } from '../helpers/testHelpers';
import { Suspense } from 'react';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';

describe('TestCaseEditor', () => {
  beforeAll(() => {
    window.ResizeObserver = mockResizeObserver;
  });

  it('should render placeholder text with no selected patient', async () => {
    const MockSelectedPatient = getMockRecoilState(selectedPatientState, null);

    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockSelectedPatient />
            <Suspense>
              <RouterContext.Provider value={createMockRouter({ pathname: '/' })}>
                <TestCaseEditor />
              </RouterContext.Provider>
            </Suspense>
          </>
        )
      );
    });

    // Placeholder text should render in both resource panel and calculation panel
    const placeholderText = screen.getAllByText(/select a patient to add resources/i) as HTMLDivElement[];
    expect(placeholderText).toHaveLength(2);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });
});
