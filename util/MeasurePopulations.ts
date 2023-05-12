import { Enums } from 'fqm-execution';

export interface MultiSelectData {
  value: string;
  label: string;
  disabled: boolean;
}

export function getPopShorthand(value: string): string | undefined {
  const enumKey = Object.keys(Enums.PopulationType).find(
    key => Enums.PopulationType[key as keyof typeof Enums.PopulationType] === value
  );
  return enumKey;
}

/**
 * Compiles an array of data for the MultiSelect component, using population codes
 * from the measure resource, across all groups in the measure.
 *
 * Excludes measure-population and measure-population-exclusion
 * (used for CV measures).
 * @param {fhir4.Measure} measure - FHIR measure resource
 * @returns {Array} array of objects representing all unique measure populations
 */
export function getMeasurePopulationsForSelection(measure: fhir4.Measure): MultiSelectData[] {
  const measurePopulations: MultiSelectData[] = [];
  const EXCLUDED_MEASURE_POPULATIONS = [Enums.PopulationType.MSRPOPL, Enums.PopulationType.MSRPOPLEX];
  // TODO: This will need to change if we want to support multiple groups
  measure.group?.[0]?.population?.forEach(population => {
    const populationCode = population.code?.coding?.[0].code;
    // TODO: determine handling of populations that are not permitted for proportion measures
    if (
      populationCode &&
      !measurePopulations.map(p => p.value).includes(populationCode) &&
      !EXCLUDED_MEASURE_POPULATIONS.find(p => p === populationCode)
    ) {
      const labelAdjust = labelAdjustment(population, measure.group?.[0]);
      const label = getPopShorthand(populationCode) + labelAdjust;
      measurePopulations.push({
        value: populationCode + labelAdjust,
        label: label,
        disabled: false
      });
    }
  });
  return measurePopulations;
}

/**
 * Creates a label string that can be attached to the default label (population criteria, etc.) and adjusts to show measure
 * observation related population reference so that the population string is unique across different measure observations
 */
export function labelAdjustment(
  population: fhir4.MeasureGroupPopulation,
  group: fhir4.MeasureGroup | undefined
): string {
  let label = ''; // default adjustment is none
  const criteriaReference = population?.extension?.find(e => {
    return e?.url === 'http://hl7.org/fhir/us/cqfmeasures/StructureDefinition/cqfm-criteriaReference';
  })?.valueString;
  // handle measure observation
  if (group && population.code?.coding?.[0].code === 'measure-observation' && criteriaReference) {
    const obsPop = group.population?.find(p => p.id === criteriaReference);
    const obsPopCode = obsPop?.code?.coding?.[0].code;
    if (obsPopCode) label = `-${getPopShorthand(obsPopCode)} (${population.criteria.expression})`;
  }
  return label;
}

/**
 * Extracts all population codes included in measure groups
 */
export function getMeasurePopulations(measure: fhir4.Measure): string[] {
  const measurePopulations: string[] = [];
  // TODO: This will need to change if we want to support multiple groups
  measure.group?.[0]?.population?.forEach(population => {
    const populationCode = population.code?.coding?.[0].code;
    if (populationCode) {
      measurePopulations.push(populationCode);
    }
  });

  return measurePopulations;
}
