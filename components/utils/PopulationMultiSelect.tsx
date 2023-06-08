import { Group, MultiSelect, Popover, Text, ActionIcon } from '@mantine/core';
import { InfoCircle } from 'tabler-icons-react';
import produce from 'immer';
import { Enums } from 'fqm-execution';
import { useMemo, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { selectedPatientState } from '../../state/atoms/selectedPatient';
import { getMeasurePopulationsForSelection } from '../../util/MeasurePopulations';
interface MultiSelectData {
  value: string;
  label: string;
  disabled: boolean;
}

export default function PopulationMultiSelect() {
  const measureBundle = useRecoilValue(measureBundleState);
  const selectedPatient = useRecoilValue(selectedPatientState);
  const measure = useMemo(() => {
    return measureBundle.content?.entry?.find(e => e.resource?.resourceType === 'Measure')?.resource as fhir4.Measure;
  }, [measureBundle]);
  const [currentPatients, setCurrentPatients] = useRecoilState(patientTestCaseState);
  const [value, setValue] = useState<string[]>(
    selectedPatient ? currentPatients[selectedPatient].desiredPopulations || [] : []
  );
  const [opened, setOpened] = useState(false);

  /**
   * Sets desired populations state (for the selected patient) based on the measure
   * populations selected from MultiSelect component and their relevant subset populations.
   * @param value array of selected options from MultiSelect component
   */
  const updateDesiredPopulations = (value: string[]) => {
    let newDesiredPopulations = [...value];
    if (selectedPatient) {
      // add initial population since it is a superset of all other populations
      if (value.length > 0 && !value.includes(Enums.PopulationType.IPP)) {
        newDesiredPopulations.push(Enums.PopulationType.IPP);
      }
      // add denominator if numerator, numerator exclusion, denominator exclusion, or denominator exception are selected
      if (
        [
          Enums.PopulationType.NUMER,
          Enums.PopulationType.NUMEX,
          Enums.PopulationType.DENEX,
          Enums.PopulationType.DENEXCEP
        ].some(p => value.includes(p)) &&
        !value.includes(Enums.PopulationType.DENOM)
      ) {
        newDesiredPopulations.push(Enums.PopulationType.DENOM);
      }
      // add numerator if numerator exclusion is selected
      if (value.includes(Enums.PopulationType.NUMEX) && !value.includes(Enums.PopulationType.NUMER)) {
        newDesiredPopulations.push(Enums.PopulationType.NUMER);
      }

      // remove all selected populations if initial population is deselected
      if (
        currentPatients[selectedPatient].desiredPopulations?.includes(Enums.PopulationType.IPP) &&
        !value.includes(Enums.PopulationType.IPP)
      ) {
        newDesiredPopulations = [];
      }
      // remove numerator, numerator exclusion, denominator exclusion, and/or denominator exception if denominator is deselected
      if (
        [
          Enums.PopulationType.NUMER,
          Enums.PopulationType.NUMEX,
          Enums.PopulationType.DENEX,
          Enums.PopulationType.DENEXCEP
        ].some(p => currentPatients[selectedPatient].desiredPopulations?.includes(p)) &&
        !value.includes(Enums.PopulationType.DENOM)
      ) {
        newDesiredPopulations = newDesiredPopulations.filter(p => p === Enums.PopulationType.IPP);
      }
      // remove numerator exclusion if numerator is deselected
      if (
        currentPatients[selectedPatient].desiredPopulations?.includes(Enums.PopulationType.NUMEX) &&
        !value.includes(Enums.PopulationType.NUMER)
      ) {
        newDesiredPopulations = newDesiredPopulations.filter(
          p =>
            p === Enums.PopulationType.IPP ||
            p === Enums.PopulationType.DENOM ||
            p === Enums.PopulationType.DENEX ||
            p === Enums.PopulationType.DENEXCEP
        );
      }

      // update the desired populations state
      const nextPatientState = produce(currentPatients, draftState => {
        draftState[selectedPatient].desiredPopulations = newDesiredPopulations;
      });
      setCurrentPatients(nextPatientState);
      // update value that appears in MultiSelect component
      setValue(newDesiredPopulations);
    }
  };

  /**
   * Uses the selected populations from the MultiSelect component to determine which
   * populations can be selected, based on the population criteria.
   * If a population cannot be selected in conjunction with a population that has already been selected,
   * the population will become disabled in the dropdown.
   *
   * Based on population criteria for proportion measures:
   * https://build.fhir.org/ig/HL7/cqf-measures/measure-conformance.html#population-criteria
   *
   * @param populations all measure populations available for the measure
   * @returns array of filtered populations that can be selected
   */
  const updateMeasurePopulations = (populations: MultiSelectData[]): MultiSelectData[] => {
    // disable all other populations (aside from IPP and denominator) if denominator exclusion selected
    if (value.includes(Enums.PopulationType.DENEX)) {
      const disabledPops = populations.filter(
        e =>
          e.value !== Enums.PopulationType.IPP &&
          e.value !== Enums.PopulationType.DENEX &&
          e.value !== Enums.PopulationType.DENOM
      );
      disabledPops.forEach(pop => (pop.disabled = true));
    }

    // disable denominator exclusion and denominator exception if numerator selected
    if (value.includes(Enums.PopulationType.NUMER)) {
      const disabledPops = populations.filter(
        p => p.value === Enums.PopulationType.DENEX || p.value === Enums.PopulationType.DENEXCEP
      );
      disabledPops.forEach(pop => (pop.disabled = true));
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
    const populations = updateMeasurePopulations(getMeasurePopulationsForSelection(measure));
    return (
      <MultiSelect
        data={populations}
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
                  <div style={{ maxWidth: '500px' }}>
                    Test cases created by Patient Bundle import will have desired populations auto-populated according
                    to the CQFM test case MeasureReport when one is present in the Patient Bundle. A measure population
                    is disabled if a patient cannot belong to both the disabled population and the selected
                    population(s).
                  </div>
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
