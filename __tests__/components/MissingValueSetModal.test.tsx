import MissingValueSetModal from '../../components/MissingValueSetModal';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { mantineRecoilWrap, getMockRecoilState } from '../helpers/testHelpers';
import { measureBundleState } from '../../state/atoms/measureBundle';
import noMissingVSBundle from '../fixtures/bundles/EXM130Fixture.json';
import missingVSBundle from '../fixtures/bundles/MissingVS.json';

describe('MissingValueSetModal', () => {
  it('does not appear when uploaded Measure Bundle is not missing valuesets', async () => {
    const MockMB = getMockRecoilState(measureBundleState, {
      name: 'testName',
      content: noMissingVSBundle as fhir4.Bundle
    });
    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockMB />
            <MissingValueSetModal />
          </>
        )
      );
    });
    const modalText = screen.queryByText("Hold on there, Cowboy. You're missing ValueSets!");
    expect(modalText).toBeNull();
  });
  it.only('appears when uploaded Measure Bundle is missing valuesets', async () => {
    const MockMB = getMockRecoilState(measureBundleState, {
      name: 'testName',
      content: missingVSBundle as fhir4.Bundle
    });
    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockMB />
            <MissingValueSetModal />
          </>
        )
      );
    });
    const modalText = screen.getByText("Hold on there, Cowboy. You're missing ValueSets!");
    expect(modalText).toBeInTheDocument();
    const valueSetsMissing = screen.getByText('http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.114222.4.11.3591');
    expect(valueSetsMissing).toBeInTheDocument();
  });
});
