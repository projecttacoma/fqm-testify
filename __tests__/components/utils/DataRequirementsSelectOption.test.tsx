import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import { Calculator } from 'fqm-execution';
import DataRequirementSelectOption from '../../../components/utils/DataRequirementSelectOption';
import { measureBundleState } from '../../../state/atoms/measureBundle';
import { getMockRecoilState, mantineRecoilWrap } from '../../helpers/testHelpers';

const MOCK_DATA_REQUIREMENTS: fhir4.Library & { dataRequirement: fhir4.DataRequirement[] } = {
  resourceType: 'Library',
  type: {},
  status: 'draft',
  dataRequirement: [
    {
      type: 'Observation',
      codeFilter: [
        {
          path: 'code',
          valueSet: 'http://example.com/ValueSet/test-vs'
        }
      ]
    },
    {
      type: 'Encounter',
      codeFilter: [
        {
          path: 'code',
          code: [
            {
              display: 'Example Code',
              code: 'example-code'
            }
          ]
        }
      ]
    }
  ]
};

const MOCK_MEASURE_BUNDLE = {
  name: 'measureBundle',
  content: {
    resourceType: 'Bundle',
    type: 'collection',
    entry: [
      {
        resource: {
          resourceType: 'ValueSet',
          name: 'Test ValueSet',
          status: 'draft',
          url: 'http://example.com/ValueSet/test-vs'
        }
      },
      {
        resource: {
          resourceType: 'ValueSet',
          name: 'Test ValueSet 2',
          status: 'draft',
          url: 'http://example.com/ValueSet/test-vs-2'
        }
      }
    ]
  } as fhir4.Bundle
};

describe('DataRequirementsSelectOption', () => {
  it('should render resourceType of dataRequirement', async () => {
    const MockMB = getMockRecoilState(measureBundleState, MOCK_MEASURE_BUNDLE);

    jest.spyOn(Calculator, 'calculateDataRequirements').mockResolvedValue({
      results: MOCK_DATA_REQUIREMENTS
    });

    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockMB />
            <DataRequirementSelectOption dataRequirement={MOCK_DATA_REQUIREMENTS.dataRequirement[0]} />
          </>
        )
      );
    });

    expect(screen.getByText(/observation/i)).toBeInTheDocument();
  });

  it('should render ValueSet name and url', async () => {
    const MockMB = getMockRecoilState(measureBundleState, MOCK_MEASURE_BUNDLE);

    jest.spyOn(Calculator, 'calculateDataRequirements').mockResolvedValue({
      results: MOCK_DATA_REQUIREMENTS
    });

    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockMB />
            <DataRequirementSelectOption dataRequirement={MOCK_DATA_REQUIREMENTS.dataRequirement[0]} />
          </>
        )
      );
    });

    expect(screen.getByText(/test valueset \(http:\/\/example.com\/valueset\/test-vs\)/i)).toBeInTheDocument();
  });

  it('should render direct reference code', async () => {
    const MockMB = getMockRecoilState(measureBundleState, MOCK_MEASURE_BUNDLE);

    jest.spyOn(Calculator, 'calculateDataRequirements').mockResolvedValue({
      results: MOCK_DATA_REQUIREMENTS
    });

    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockMB />
            <DataRequirementSelectOption dataRequirement={MOCK_DATA_REQUIREMENTS.dataRequirement[1]} />
          </>
        )
      );
    });

    expect(screen.getByText(/example-code: example code/i)).toBeInTheDocument();
  });
});
