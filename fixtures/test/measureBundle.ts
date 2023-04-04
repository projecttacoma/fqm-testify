export const MOCK_MEASURE_BUNDLE = {
  fileName: 'measureBundle',
  isFile: true,
  displayMap: {},
  selectedMeasureId: null,
  measureRepositoryUrl: '',
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
      },
      {
        resource: {
          resourceType: 'Measure',
          url: 'test-measure-id',
          group: [
            {
              population: [
                {
                  code: {
                    coding: [
                      {
                        system: 'http://terminology.hl7.org/CodeSystem/measure-population',
                        code: 'initial-population',
                        display: 'Initial Population'
                      }
                    ]
                  }
                },
                {
                  code: {
                    coding: [
                      {
                        system: 'http://terminology.hl7.org/CodeSystem/measure-population',
                        code: 'denominator',
                        display: 'Denominator'
                      }
                    ]
                  }
                },
                {
                  code: {
                    coding: [
                      {
                        system: 'http://terminology.hl7.org/CodeSystem/measure-population',
                        code: 'numerator',
                        display: 'Numerator'
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      }
    ]
  } as fhir4.Bundle
};
