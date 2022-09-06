export const MOCK_MEASURE_BUNDLE = {
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
