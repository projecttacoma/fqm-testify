import { getMeasurePopulations } from '../../util/MeasurePopulations';
const EXPECTED_POPULATION_CODES = ['denominator', 'numerator', 'initial-population', 'denominator-exclusion'];
const TEST_MEASURE: fhir4.Measure = {
  resourceType: 'Measure',
  status: 'active',
  group: [
    {
      population: [
        {
          code: {
            coding: [
              {
                system: 'test-system',
                code: 'denominator',
                display: 'Denominator'
              }
            ]
          },
          criteria: {
            language: 'text/cql.identifier',
            expression: 'Denominator'
          }
        },
        {
          code: {
            coding: [
              {
                system: 'test-system',
                code: 'numerator',
                display: 'Numerator'
              }
            ]
          },
          criteria: {
            language: 'text/cql.identifier',
            expression: 'Numerator'
          }
        },
        {
          code: {
            coding: [
              {
                system: 'test-system',
                code: 'initial-population',
                display: 'Initial Population'
              }
            ]
          },
          criteria: {
            language: 'text/cql.identifier',
            expression: 'Initial Population'
          }
        },
        {
          code: {
            coding: [
              {
                system: 'test-system',
                code: 'denominator-exclusion',
                display: 'Denominator Exclusion'
              }
            ]
          },
          criteria: {
            language: 'text/cql.identifier',
            expression: 'Denominator Exclusion'
          }
        }
      ]
    }
  ]
};
describe('getMeasurePopulations', () => {
  it('correctly retrieves population codes from Measure', () => {
    expect(getMeasurePopulations(TEST_MEASURE)).toEqual(EXPECTED_POPULATION_CODES);
  });
});
