import { MultiSelect, Text } from '@mantine/core';
import produce from 'immer';
import { Enums } from 'fqm-execution';
import { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { selectedPatientState } from '../../state/atoms/selectedPatient';

interface MultiSelectData {
  value: string;
  label: string;
  disabled: boolean;
}
export default function PopulationMultiSelect() {
  const measureBundle = useRecoilValue(measureBundleState);
  const [currentPatients, setCurrentPatients] = useRecoilState(patientTestCaseState);
  const [value, setValue] = useState<string[]>([]);
  const selectedPatient = useRecoilValue(selectedPatientState);
  const measure = measureBundle.content?.entry?.find(e => e.resource?.resourceType === 'Measure')?.resource;

  /**
   * Compiles an array of population codes from the measure resource,
   * across all groups in the measure.
   * @param {fhir4.Measure} measure - FHIR measure resource
   * @returns {Array} array of strings representing all measure populations
   */
  const getMeasurePopulations = (measure: fhir4.Measure): Array<MultiSelectData> => {
    const measurePopulations: MultiSelectData[] = [];
    // Iterate over measure population groups
    measure.group?.forEach(group => {
      group.population?.forEach(population => {
        const populationCode = population.code?.coding?.[0].code;
        const populationDisplay = population.code?.coding?.[0].display;
        if (
          populationCode &&
          !measurePopulations.map(p => p.value).includes(populationCode) &&
          !['measure-population', 'measure-population-exclusion', 'measure-observation'].includes(populationCode)
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
  };

  const updateDesiredPopulations = (value: string[]) => {
    const newDesiredPopulations = value;
    if (selectedPatient) {
      // add intiial population since it is a superset of all other populations
      if (value.length > 0 && !value.includes(Enums.PopulationType.IPP)) {
        newDesiredPopulations.push(Enums.PopulationType.IPP);
      }
      // add denominator if numerator, numer exclusion, or denom exception are selected
      if (
        [Enums.PopulationType.NUMER, Enums.PopulationType.NUMEX, Enums.PopulationType.DENEXCEP].some(p =>
          value.includes(p)
        ) &&
        !value.includes(Enums.PopulationType.DENOM)
      ) {
        newDesiredPopulations.push(Enums.PopulationType.DENOM);
      }
      produce(currentPatients, async draftState => {
        // change this to be concatenated with whatever is needed with the logic
        draftState[selectedPatient].desiredPopulations = newDesiredPopulations;
      }).then(nextPatientState => {
        setCurrentPatients(nextPatientState);
      });
      setValue(newDesiredPopulations);
    }
  };

  const updateMeasurePopulations = (populations: MultiSelectData[]): MultiSelectData[] => {
    // disable denominator exclusion if denominator selected
    if (value.includes(Enums.PopulationType.DENOM)) {
      const denex = populations.find(e => e.value === Enums.PopulationType.DENEX);
      if (denex) denex.disabled = true;
    }

    // disable all other populations if denominator exclusion selected
    if (value.includes(Enums.PopulationType.DENEX)) {
      const disabledPops = populations.filter(e => e.value !== Enums.PopulationType.IPP);
      disabledPops.forEach(pop => (pop.disabled = true));
    }

    // disable numerator exclusion, denominator exclusion, denominator exception if numerator selected
    if (value.includes(Enums.PopulationType.NUMER)) {
      const disabledPops = populations.filter(
        p =>
          p.value === Enums.PopulationType.NUMEX ||
          p.value === Enums.PopulationType.DENEX ||
          p.value === Enums.PopulationType.DENEXCEP
      );
      disabledPops.forEach(pop => (pop.disabled = true));
    }

    // disable numerator if numerator exclusion selected
    if (value.includes(Enums.PopulationType.NUMEX)) {
      const numer = populations.find(e => e.value === Enums.PopulationType.NUMER);
      if (numer) numer.disabled = true;
    }

    // disable denominator exclusion, numerator, and numerator exclusion if denominator exception selected
    if (value.includes(Enums.PopulationType.DENEXCEP)) {
      const disabledPops = populations.filter(
        p =>
          p.value === Enums.PopulationType.DENEX ||
          p.value === Enums.PopulationType.NUMER ||
          p.value === Enums.PopulationType.NUMEX
      );
      disabledPops.forEach(pop => (pop.disabled = true));
    }

    return populations;
  };

  if (measure) {
    const populations = updateMeasurePopulations(getMeasurePopulations(measure as fhir4.Measure));
    return (
      <MultiSelect
        data={populations}
        label={'Desired Populations'}
        placeholder={'Select populations'}
        dropdownPosition="bottom"
        clearable
        onChange={updateDesiredPopulations}
        value={value}
      />
    );
  } else {
    return <Text>Measure populations not available</Text>;
  }
}
