import { MultiSelect, Text } from '@mantine/core';
import produce from 'immer';
import { useRecoilState, useRecoilValue } from 'recoil';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { selectedPatientState } from '../../state/atoms/selectedPatient';

interface MultiSelectData {
  value: string;
  label: string;
}
export default function PopulationMultiSelect() {
  const measureBundle = useRecoilValue(measureBundleState);
  const [currentPatients, setCurrentPatients] = useRecoilState(patientTestCaseState);
  const selectedPatient = useRecoilValue(selectedPatientState);
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

  function updateDesiredPopulations(value: string[]){
    console.log(value);
    if (selectedPatient) {
      produce(currentPatients, async draftState => {
        draftState[selectedPatient].desiredPopulations = value;
      }).then(nextPatientState => {
        setCurrentPatients(nextPatientState);
      })
    }
    console.log(currentPatients);
  }

  if (measure) {
    const populations = getMeasurePopulations(measure as fhir4.Measure);
    return (
      <MultiSelect
        data={populations}
        label={'Desired Populations'}
        placeholder={'Select populations'}
        dropdownPosition="bottom"
        clearable
        onChange={updateDesiredPopulations}
        value={selectedPatient ? currentPatients[selectedPatient].desiredPopulations : []}
      />
    );
  } else {
    return <Text>Measure populations not available</Text>;
  }
}
