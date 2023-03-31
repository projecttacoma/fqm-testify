import { Calculator } from 'fqm-execution';
import { DateTime } from 'luxon';

export interface MeasureUploadError {
  id: string;
  message: string | string[];
  timestamp: string;
  attemptedBundleDisplay: string | null;
  isValueSetMissingError: boolean;
}

export interface MeasureUploadProps {
  logError: (error: MeasureUploadError) => void;
}

const DEFAULT_MEASUREMENT_PERIOD = {
  start: DateTime.fromISO('2022-01-01').toJSDate(),
  end: DateTime.fromISO('2022-12-31').toJSDate()
};

const DEFAULT_MEASUREMENT_PERIOD_DURATION = 1;

const VSAC_REGEX = /http:\/\/cts\.nlm\.nih\.gov.*ValueSet/;

/**
 * Takes in two date strings and populates a valid measurement period with JS Dates
 * as start and end points
 */
export function populateMeasurementPeriod(
  startString: string | undefined,
  endString: string | undefined
): { start: Date; end: Date } {
  const measurementPeriod = { ...DEFAULT_MEASUREMENT_PERIOD };

  if (startString) {
    const startDate = DateTime.fromISO(startString).toJSDate();
    measurementPeriod.start = startDate;
    // Measurement period start and end are both defined
    if (endString) {
      measurementPeriod.end = DateTime.fromISO(endString).toJSDate();
      // If start is defined and end isn't, make the period last one year from the start
    } else {
      const newEnd = new Date(startDate);
      newEnd.setFullYear(startDate.getFullYear() + DEFAULT_MEASUREMENT_PERIOD_DURATION);
      measurementPeriod.end = newEnd;
    }

    // If end is defined and start isn't, make the period start one year from the end
  } else if (endString) {
    const endDate = DateTime.fromISO(endString).toJSDate();
    measurementPeriod.end = endDate;
    const newStart = new Date(endDate);
    newStart.setFullYear(endDate.getFullYear() - DEFAULT_MEASUREMENT_PERIOD_DURATION);
    measurementPeriod.start = newStart;
  }
  return measurementPeriod;
}

/**
 * Runs data requirements on a FHIR MeasureBundle, then compares the required
 * valuesets to the valuesets included in the bundle. Returns an array of canonical urls of
 * missing required valuesets
 */
export async function identifyMissingValueSets(mb: fhir4.Bundle): Promise<string[]> {
  const allRequiredValuesets = new Set<string>();
  const includedValuesets = new Set<string>();

  mb?.entry?.forEach(e => {
    if (e?.resource?.resourceType === 'ValueSet') {
      includedValuesets.add(e.resource.url as string);
    }
  });
  const dataRequirements = await Calculator.calculateDataRequirements(mb);
  dataRequirements?.results?.dataRequirement?.forEach(dr => {
    dr?.codeFilter?.forEach(filter => {
      if (filter.valueSet && VSAC_REGEX.test(filter.valueSet)) {
        allRequiredValuesets.add(filter.valueSet as string);
      }
    });
  });
  const missingValuesets = Array.from(allRequiredValuesets).filter(vs => !includedValuesets.has(vs));
  return missingValuesets;
}
