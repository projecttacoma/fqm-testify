import { TestCaseInfo } from '../state/atoms/patientTestCase';

export function bundleToTestCase(bundle: fhir4.Bundle, populationGroupCodes: string[]): TestCaseInfo {
  if (!bundle.entry || bundle.entry.length === 0) {
    throw new Error('Bundle has no entries');
  }

  const patientEntry = bundle.entry.find(e => e.resource?.resourceType === 'Patient');
  let desiredPopulations: string[] = [];
  const testCaseMeasureReportArr = bundle.entry.filter(isTestCaseMeasureReport);
  if (testCaseMeasureReportArr.length > 1) {
    // TODO: Once we have import errors persist on page, replace this!!!
    throw new Error(
      `Expected 1 or 0 test case measure reports in bundle, but found ${testCaseMeasureReportArr.length}`
    );
  }
  if (testCaseMeasureReportArr.length === 1) {
    // use reduce here to retrieve population codes and filter out potential undefined codes
    let retrievedPops = (testCaseMeasureReportArr[0].resource as fhir4.MeasureReport)?.group?.[0]?.population?.reduce(
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

  return {
    patient: patientResource,
    resources: bundle.entry
      .filter(e => {
        return e.resource?.resourceType !== 'Patient' && !isTestCaseMeasureReport(e);
      })
      .map(e => e.resource) as fhir4.FhirResource[],
    desiredPopulations
  };
}

export function isTestCaseMeasureReport(entry?: fhir4.BundleEntry) {
  return (
    entry?.resource?.resourceType === 'MeasureReport' &&
    (entry?.resource as fhir4.MeasureReport).modifierExtension?.find(
      ext => ext.url === 'http://hl7.org/fhir/us/cqfmeasures/StructureDefinition/cqfm-isTestCase' && ext.valueBoolean
    )
  );
}
