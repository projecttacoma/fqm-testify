import MissingValueSetModal from '../../components/modals/MissingValueSetModal';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { mantineRecoilWrap, getMockRecoilState } from '../helpers/testHelpers';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { Calculator } from 'fqm-execution';

const MOCK_BUNDLE: fhir4.Bundle = {
  resourceType: 'Bundle',
  type: 'collection',
  entry: []
};

// VSAC URL required in fixture due to regex used for identifying required ValueSets
const MOCK_DATA_REQUIREMENTS: fhir4.Library = {
  resourceType: 'Library',
  type: {},
  status: 'draft',
  dataRequirement: [
    {
      type: 'Observation',
      codeFilter: [
        {
          path: 'code',
          valueSet: 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.108.12.1039'
        }
      ]
    }
  ]
};

describe('MissingValueSetModal', () => {
  it('does not appear when uploaded Measure Bundle is not missing valuesets', async () => {
    jest.spyOn(Calculator, 'calculateDataRequirements').mockResolvedValue({
      results: {
        resourceType: 'Library',
        status: 'draft',
        type: {}
      }
    });

    const MockMB = getMockRecoilState(measureBundleState, {
      name: 'testName',
      content: MOCK_BUNDLE
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
    expect(modalText).not.toBeInTheDocument();
  });

  it('appears when uploaded Measure Bundle is missing valuesets', async () => {
    jest.spyOn(Calculator, 'calculateDataRequirements').mockResolvedValue({
      results: MOCK_DATA_REQUIREMENTS
    });

    const MockMB = getMockRecoilState(measureBundleState, {
      name: 'testName',
      content: MOCK_BUNDLE
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

    const valueSetsMissing = screen.getByText(
      'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.108.12.1039'
    );
    expect(valueSetsMissing).toBeInTheDocument();
  });
});
