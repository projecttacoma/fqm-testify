import { MultiSelect, Text } from '@mantine/core';
import { useRecoilValue } from 'recoil';
import { measureBundleState } from '../../state/atoms/measureBundle';

interface MultiSelectData {
  value: string;
  label: string;
}
export default function PopulationMultiSelect() {
  const measureBundle = useRecoilValue(measureBundleState);
  const measure = measureBundle.content?.entry?.find(e => e.resource?.resourceType === 'Measure')?.resource;

  /**
   * Compiles an array of population codes from the measure resource,
   * across all groups in the measure.
   * @param {fhir4.Measure} measure - FHIR measure resource
   * @returns {Array} array of strings representing all measure populations
   */
  function getMeasurePopulations(measure: fhir4.Measure) {
    const measurePopulations: MultiSelectData[] = [];
    // Iterate over measure population groups
    measure.group?.forEach(group => {
      group.population?.forEach(population => {
        const populationCode = population.code?.coding?.[0].code;
        const populationDisplay = population.code?.coding?.[0].display;
        if (populationCode && !measurePopulations.map(p => p.value).includes(populationCode)) {
          measurePopulations.push({ value: populationCode, label: populationDisplay || populationCode });
        }
      });
    });
    return measurePopulations;
  }

  if (measure) {
    const populations = getMeasurePopulations(measure as fhir4.Measure);
    return (
      <MultiSelect
        data={populations}
        label={'Desired Populations'}
        placeholder={'Select populations'}
        dropdownPosition="bottom"
      />
    );
  } else {
    return <Text>Measure populations not available</Text>;
  }
}
