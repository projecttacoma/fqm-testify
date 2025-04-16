import { Enums, PopulationType, StatementResult } from 'fqm-execution';

export interface MultiSelectData {
  value: string;
  label: string;
  disabled: boolean;
}

/**
 * Uses the input population code value and maps it to the corresponding Enum.PopulationType name.
 * Example: 'initial-population' (the Enum string value) maps to 'IPP' (the Enum name/key)
 */
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

/**
 * Sort statements into population, then non-functions, then functions
 * Taken from fqm-execution HTMLBuilder.ts
 */
export function sortStatements(measure: fhir4.Measure, groupId: string, statements: StatementResult[]) {
  const group = measure.group?.find(g => g.id === groupId) || measure.group?.[0];
  const populationOrder = [
    PopulationType.IPP,
    PopulationType.DENOM,
    PopulationType.DENEX,
    PopulationType.DENEXCEP,
    PopulationType.NUMER,
    PopulationType.NUMEX,
    PopulationType.MSRPOPL,
    PopulationType.MSRPOPLEX,
    PopulationType.OBSERV
  ];

  // this is a lookup of cql expression identifier -> population type
  const populationIdentifiers: Record<string, PopulationType> = {};
  group?.population?.forEach(p => {
    if (p.code?.coding?.[0].code !== undefined) {
      populationIdentifiers[p.criteria.expression as string] = p.code.coding[0].code as PopulationType;
    }
  });

  function populationCompare(a: StatementResult, b: StatementResult) {
    return (
      populationOrder.indexOf(populationIdentifiers[a.statementName]) -
      populationOrder.indexOf(populationIdentifiers[b.statementName])
    );
  }

  function alphaCompare(a: StatementResult, b: StatementResult) {
    return a.statementName <= b.statementName ? -1 : 1;
  }

  statements.sort((a, b) => {
    // if population statement, use population or send to beginning
    if (a.statementName in populationIdentifiers) {
      return b.statementName in populationIdentifiers ? populationCompare(a, b) : -1;
    }
    if (b.statementName in populationIdentifiers) return 1;

    // if function, alphabetize or send to end
    if (a.isFunction) {
      return b.isFunction ? alphaCompare(a, b) : 1;
    }
    if (b.isFunction) return -1;

    // if no function or population statement, alphabetize
    return alphaCompare(a, b);
  });
}
