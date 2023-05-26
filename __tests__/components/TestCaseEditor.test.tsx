import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import TestCaseEditor from '../../components/TestCaseEditor';
import { selectedPatientState } from '../../state/atoms/selectedPatient';
import { createMockRouter, getMockRecoilState, mantineRecoilWrap } from '../helpers/testHelpers';

describe('TestCaseEditor', () => {
  it('should render placeholder text with no selected patient', () => {
    const MockSelectedPatient = getMockRecoilState(selectedPatientState, null);

    render(
      mantineRecoilWrap(
        <>
          <MockSelectedPatient />
          <RouterContext.Provider value={createMockRouter({ pathname: '/' })}>
            <TestCaseEditor />
          </RouterContext.Provider>
        </>
      )
    );

    // Placeholder text should render in both resource panel and calculation panel
    const placeholderText = screen.getAllByText(/select a patient to add resources/i) as HTMLDivElement[];
    expect(placeholderText).toHaveLength(2);
  });
});
