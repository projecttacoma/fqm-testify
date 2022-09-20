import { Group, MultiSelect, Popover, Text, ActionIcon } from '@mantine/core';
import { InfoCircle } from 'tabler-icons-react';
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
  const selectedPatient = useRecoilValue(selectedPatientState);
  const measure = measureBundle.content?.entry?.find(e => e.resource?.resourceType === 'Measure')
    ?.resource as fhir4.Measure;
  const [currentPatients, setCurrentPatients] = useRecoilState(patientTestCaseState);
  const [value, setValue] = useState<string[]>(
    selectedPatient ? currentPatients[selectedPatient].desiredPopulations || [] : []
  );
  const [opened, setOpened] = useState(false);

  /**
   * Compiles an array of population codes from the measure resource,
   * across all groups in the measure. Excludes measure-population, measure-population-exclusion,
   * and measure-observation (used for CV measures);
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

  /**
   * Sets desired populations state based on measure populations selected from
   * MultiSelect component, and includes relevant supset populations.
   * @param value array of selected options from MultiSelect component
   */
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
        draftState[selectedPatient].desiredPopulations = newDesiredPopulations;
      }).then(nextPatientState => {
        setCurrentPatients(nextPatientState);
      });
      setValue(newDesiredPopulations);
    }
  };

  /**
   * Uses the selected populations from the MultiSelect component to determine which
   * populations can be selected, based on population criteria. If a population cannot
   * be selected because it cannot be selected in conjunction with a population that has
   * already been selected, the population will become disabled in the dropdown.
   * @param populations all measure populations available for the measure
   * @returns array of filtered populations that can be selected
   */
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
    const populations = updateMeasurePopulations(getMeasurePopulations(measure));
    return (
      <MultiSelect
        data={populations}
        aria-expanded={true}
        label={
          <Group>
            Desired Populations
            <div>
              <Popover opened={opened} onClose={() => setOpened(false)}>
                <Popover.Target>
                  <ActionIcon aria-label={'More Information'} onClick={() => setOpened(o => !o)}>
                    <InfoCircle size={20} />
                  </ActionIcon>
                </Popover.Target>
                <Popover.Dropdown>
                  A measure population is disabled if a patient cannot belong to both the disabled population and the
                  selected population(s).
                </Popover.Dropdown>
              </Popover>
            </div>
          </Group>
        }
        placeholder={'Select populations'}
        dropdownPosition="bottom"
        searchable={true}
        clearable
        onChange={updateDesiredPopulations}
        value={value}
      />
    );
  } else {
    return <Text>Measure populations not available</Text>;
  }
}
