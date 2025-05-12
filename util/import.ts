import { TestCaseInfo } from '../state/atoms/patientTestCase';

/**
 * Creates an fqm-testify test case, including a FHIR Patient resource and all referencing resources,
 * from a passed in Patient bundle. Uses the population codes on the Measure Bundle imported to testify
 * to determine the desired populations the patient can fall into. Uses the CQFM test case
 * MeasureReport (if present in the Patient Bundle) to determine which desired populations are selected.
 * @param bundle FHIR Patient Bundle containing Patient and all test case resources
 * @param populationGroupCodes An array of population codes pulled from uploaded FHIR Measure to determine
 * valid desired populations
 * @returns An fqm-testify test case
 */
export function bundleToTestCase(
  bundle: fhir4.Bundle,
  populationGroupCodes: string[],
  testCaseMap: Record<string, string | undefined>,
  measureURL?: string
): TestCaseInfo {
  if (!bundle.entry || bundle.entry.length === 0) {
    throw new Error('Bundle has no entries');
  }

  const patientEntry = bundle.entry.find(e => e.resource?.resourceType === 'Patient');
  const desiredPopulations: string[] = [];
  let testCaseMeasureReportArr = bundle.entry.filter(e => isTestCaseMeasureReport(e));
  if (testCaseMeasureReportArr.length > 1) {
    // if multiple found, reduce to the one(s) that match the loaded measure
    testCaseMeasureReportArr = testCaseMeasureReportArr.filter(
      e => (e.resource as fhir4.MeasureReport).measure === measureURL
    );
  }

  if (testCaseMeasureReportArr.length > 1) {
    // TODO: Once we have import errors persist on page, replace this!!!
    throw new Error(
      `Found multiple test case measure reports in bundle that match the loaded measure. ${testCaseMeasureReportArr.length} found, so cannot select correct measure report.`
    );
  }
  if (testCaseMeasureReportArr.length === 1) {
    // use reduce here to retrieve population codes and filter out potential undefined codes
    const retrievedPops = (testCaseMeasureReportArr[0].resource as fhir4.MeasureReport)?.group?.[0]?.population?.reduce(
      (existingPops: string[], pop) => {
        const popCode = pop.code?.coding?.[0].code;
        if (popCode && pop.count === 1) {
          existingPops.push(popCode);
        }
        return existingPops;
      },
      []
    );
    if (retrievedPops) {
      const invalidPops: string[] = [];
      retrievedPops.forEach(e => {
        if (populationGroupCodes.includes(e)) {
          desiredPopulations.push(e);
        } else {
          invalidPops.push(e);
        }
      });
      if (invalidPops.length > 0) {
        // TODO: Once we have import errors persist on page, replace this!!!
        throw new Error(
          `Found invalid population codes: ${invalidPops.join(
            ', '
          )}. Ensure all imported desired populations are valid with uploaded measure populations`
        );
      }
    }
  }

  const patientResource = patientEntry?.resource as fhir4.Patient | undefined;

  if (!patientResource) {
    throw new Error('Bundle does not contain a patient resource');
  }
  if (patientResource.id && testCaseMap[patientResource.id]) {
    const testCaseNames = testCaseMap[patientResource.id]?.split(' ');
    //replace name from use case map
    if (patientResource.name?.[0]) {
      patientResource.name[0].family = testCaseNames?.[1] || '';
      patientResource.name[0].given = [testCaseNames?.[0] || ''];
    } else {
      patientResource.name = [{ family: testCaseNames?.[1] || '', given: [testCaseNames?.[0] || ''] }];
    }
  }

  return {
    patient: patientResource,
    fullUrl: patientEntry?.fullUrl ?? `urn:uuid:${patientResource.id}`,
    resources: bundle.entry
      .filter(e => {
        return e.resource?.resourceType !== 'Patient' && !isTestCaseMeasureReport(e);
      })
      .map(e => ({ fullUrl: e.fullUrl ?? `urn:uuid:${e.resource?.id}`, resource: e.resource })),
    minResources: false,
    desiredPopulations
  };
}

export function isTestCaseMeasureReport(entry?: fhir4.BundleEntry) {
  return (
    entry?.resource?.resourceType === 'MeasureReport' &&
    entry?.resource.modifierExtension?.find(
      ext => ext.url === 'http://hl7.org/fhir/us/cqfmeasures/StructureDefinition/cqfm-isTestCase' && ext.valueBoolean
    )
  );
}
