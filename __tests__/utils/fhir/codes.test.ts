import { getDataRequirementFiltersString, getFhirResourceSummary } from '../../../util/fhir/codes';

const VS_MAP = { testvs: 'test vs name' };

// data requirement that does not have any valuesets or any direct reference codes
const DATA_REQUIREMENT_WITH_NO_VALUESETS_OR_DRC = {
  type: 'Observation',
  status: 'draft'
};

// data requirement that does not have any valuesets but has a direct reference code
const DATA_REQUIREMENT_WITH_NO_VALUESETS_WITH_DRC = {
  type: 'Communication',
  status: 'draft',
  codeFilter: [
    {
      path: 'reasonCode',
      code: [
        {
          system: 'http://snomed.info/sct/731000124108',
          version: 'http://snomed.info/sct/731000124108/version/201709',
          display: 'test display 2',
          code: '456'
        }
      ]
    }
  ]
};

const OBSERVATION_DATA_REQUIREMENT_WITH_CODE_AND_VALUESET = {
  type: 'Observation',
  status: 'draft',
  codeFilter: [
    {
      path: 'code',
      valueSet: 'testvs'
    },
    {
      path: 'category',
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

const DATA_REQUIREMENT_WITH_VALUESETS = {
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

const RESOURCE_WITH_NO_SUMMARY: fhir4.Resource = {
  resourceType: 'Procedure'
};

const RESOURCE_WITH_NO_CODE: fhir4.Resource = {
  resourceType: 'Procedure',
  id: 'procedure-id'
};

const PROCEDURE_RESOURCE_WITH_CODE: fhir4.Procedure = {
  resourceType: 'Procedure',
  id: 'procedure-id',
  status: 'completed',
  code: {
    coding: [
      {
        code: '123'
      }
    ]
  },
  subject: {
    reference: 'procedure-reference'
  }
};

const PROCEDURE_RESOURCE_WITH_DISPLAY: fhir4.Procedure = {
  resourceType: 'Procedure',
  id: 'procedure-id',
  status: 'completed',
  code: {
    coding: [
      {
        display: 'This is an example of display text for a Procedure resource.'
      }
    ]
  },
  subject: {
    reference: 'procedure-reference'
  }
};

const PROCEDURE_RESOURCE_WITH_TWO_CODES: fhir4.Procedure = {
  resourceType: 'Procedure',
  id: 'procedure-id',
  status: 'completed',
  code: {
    coding: [
      {
        code: '123',
        display: 'Display1'
      },
      {
        code: '456',
        display: 'Display2'
      }
    ]
  },
  subject: {
    reference: 'procedure-reference'
  }
};

const MEASURE_REPORT_WITH_ID: fhir4.MeasureReport = {
  resourceType: 'MeasureReport',
  id: 'measure-report-id',
  type: 'individual',
  status: 'complete',
  measure: '',
  period: {
    start: '',
    end: ''
  },
  text: {
    div: 'test123',
    status: 'additional'
  }
};

const PROCEDURE_RESOURCE_WITH_FULL_SUMMARY: fhir4.Procedure = {
  resourceType: 'Procedure',
  id: 'procedure-id',
  status: 'completed',
  code: {
    coding: [
      {
        code: '123',
        display: 'This is an example of display text for a Procedure resource.'
      }
    ]
  },
  subject: {
    reference: 'Patient/procedure-reference'
  }
};

describe('getDataRequirementFiltersString', () => {
  it('should return an empty string for resource with no valuesets and no direct reference code', () => {
    expect(getDataRequirementFiltersString(DATA_REQUIREMENT_WITH_NO_VALUESETS_OR_DRC, VS_MAP)).toEqual('');
  });

  it('should return name of code and display when there is a direct reference code but no valuesets', () => {
    expect(getDataRequirementFiltersString(DATA_REQUIREMENT_WITH_NO_VALUESETS_WITH_DRC, VS_MAP)).toEqual(
      '456: test display 2'
    );
  });

  it('should return name of valueset when codefilter includes valueset', () => {
    expect(getDataRequirementFiltersString(DATA_REQUIREMENT_WITH_VALUESETS, VS_MAP)).toEqual('test vs name (testvs)');
  });

  it('should return display when code filter is of path code', () => {
    expect(getDataRequirementFiltersString(DATA_REQUIREMENT_WITH_CODE, VS_MAP)).toEqual('37687000: test display');
  });

  it('should return display and name when both code and valueset exist', () => {
    expect(getDataRequirementFiltersString(OBSERVATION_DATA_REQUIREMENT_WITH_CODE_AND_VALUESET, VS_MAP)).toEqual(
      'test vs name (testvs)\n37687000: test display'
    );
  });
});

describe('getFhirResourceSummary', () => {
  it('should return an empty string for resource with no code, display, or id', () => {
    expect(getFhirResourceSummary(RESOURCE_WITH_NO_SUMMARY)).toEqual('');
  });

  it('should return the resource id for resource with no code', () => {
    expect(getFhirResourceSummary(RESOURCE_WITH_NO_CODE)).toEqual('(procedure-id)');
  });

  it('should return the resource id for resource with no primary code path', () => {
    expect(getFhirResourceSummary(MEASURE_REPORT_WITH_ID)).toEqual('(measure-report-id)');
  });

  it('should return the code and display for resource with both', () => {
    expect(getFhirResourceSummary(PROCEDURE_RESOURCE_WITH_FULL_SUMMARY)).toEqual(
      '(123: This is an example of display text for a Procedure resource.)'
    );
  });

  it('should return only the code when the display does not exist but the code does', () => {
    expect(getFhirResourceSummary(PROCEDURE_RESOURCE_WITH_CODE)).toEqual('(123)');
  });

  it('should return only the display when the code does not exist but the display does', () => {
    expect(getFhirResourceSummary(PROCEDURE_RESOURCE_WITH_DISPLAY)).toEqual(
      '(This is an example of display text for a Procedure resource.)'
    );
  });

  it('should return only the first code and display when there are multiple codes', () => {
    expect(getFhirResourceSummary(PROCEDURE_RESOURCE_WITH_TWO_CODES)).toEqual('(123: Display1)');
  });
});
