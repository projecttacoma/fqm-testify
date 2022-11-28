import { Enums } from 'fqm-execution';

export interface MultiSelectData {
  value: string;
  label: string;
  disabled: boolean;
}

/**
 * Compiles an array of data for the MultiSelect component, using population codes
 * from the measure resource, across all groups in the measure.
 *
 * Excludes measure-population, measure-population-exclusion, and measure-observation
 * (used for CV measures).
 * @param {fhir4.Measure} measure - FHIR measure resource
 * @returns {Array} array of objects representing all unique measure populations
 */
export function getMeasurePopulationsForSelection(measure: fhir4.Measure): MultiSelectData[] {
  const measurePopulations: MultiSelectData[] = [];
  const EXCLUDED_MEASURE_POPULATIONS = [
    Enums.PopulationType.MSRPOPL,
    Enums.PopulationType.MSRPOPLEX,
    Enums.PopulationType.OBSERV
  ];
  // Iterate over measure population groups
  measure.group?.forEach(group => {
    group.population?.forEach(population => {
      const populationCode = population.code?.coding?.[0].code;
      const populationDisplay = population.code?.coding?.[0].display;
      // TODO: determine handling of populations that are not permitted for proportion measures
      if (
        populationCode &&
        !measurePopulations.map(p => p.value).includes(populationCode) &&
        !EXCLUDED_MEASURE_POPULATIONS.find(p => p === populationCode)
      ) {
        measurePopulations.push({
          value: populationCode,
          label: populationDisplay || populationCode,
          disabled: false
        });
      }
    });
  });
  return measurePopulations;
}

/**
 * Extracts all population codes included in measure groups
 * @param {fhir4.Measure} measure a FHIR Measure from which to extract measure populations
 * @returns {Array} an array of all measure population codes included in measure
 */
export function getMeasurePopulations(measure: fhir4.Measure): string[] {
  const measurePopulations: string[] = [];

  measure.group?.forEach(group => {
    group.population?.forEach(population => {
      const populationCode = population.code?.coding?.[0].code;
      if (populationCode) {
        measurePopulations.push(populationCode);
      }
    });
  });
  return measurePopulations;
}
