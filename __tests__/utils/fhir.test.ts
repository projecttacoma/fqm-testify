import { getDataRequirementFiltersString } from '../../util/fhir';

const VS_MAP = { testvs: 'test vs name' };
const DATA_REQUIREMENT_WITH_NO_VALUE_SETS = {
  type: 'Observation',
  status: 'draft'
};
const DATA_REQUIREMENT_WITH_VALUE_SETS = {
  type: 'Observation',
  status: 'draft',
  codeFilter: [
    {
      path: 'code',
      valueSet: 'testvs'
    }
  ]
};

const DATA_REQUIREMENT_WITH_CODE = {
  type: 'Observation',
  status: 'draft',
  codeFilter: [
    {
      path: 'code',
      code: [
        {
          system: 'http://snomed.info/sct/731000124108',
          version: 'http://snomed.info/sct/731000124108/version/201709',
          display: 'test display',
          code: '37687000'
        }
      ]
    }
  ]
};

const DATA_REQUIREMENT_WITH_CODE_AND_VALUESET = {
  type: 'Observation',
  status: 'draft',
  codeFilter: [
    {
      path: 'code',
      valueSet: 'testvs'
    },
    {
      path: 'code',
      code: [
        {
          system: 'http://snomed.info/sct/731000124108',
          version: 'http://snomed.info/sct/731000124108/version/201709',
          display: 'test display',
          code: '37687000'
        }
      ]
    }
  ]
};

describe('getDataRequirementFiltersString', () => {
  test('returns an empty string for resource with no valuesets', () => {
    expect(getDataRequirementFiltersString(DATA_REQUIREMENT_WITH_NO_VALUE_SETS, VS_MAP)).toEqual('');
  });
  test('returns name of valueset when codefilter includes valueset', () => {
    expect(getDataRequirementFiltersString(DATA_REQUIREMENT_WITH_VALUE_SETS, VS_MAP)).toEqual('test vs name (testvs)');
  });
  test('returns display when code filter is of path code', () => {
    expect(getDataRequirementFiltersString(DATA_REQUIREMENT_WITH_CODE, VS_MAP)).toEqual('test display');
  });
  test('returns display and name when both code and valueset exist', () => {
    expect(getDataRequirementFiltersString(DATA_REQUIREMENT_WITH_CODE_AND_VALUESET, VS_MAP)).toEqual(
      'test vs name (testvs)\ntest display'
    );
  });
});
