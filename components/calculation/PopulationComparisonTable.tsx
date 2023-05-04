import { ActionIcon, createStyles, Group, Popover, Table, Text } from '@mantine/core';
import { useRecoilValue } from 'recoil';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { useMemo, useState } from 'react';
import { getMeasurePopulationsForSelection, MultiSelectData } from '../../util/MeasurePopulations';
import { InfoCircle } from 'tabler-icons-react';
import { detailedResultLookupState } from '../../state/atoms/detailedResultLookup';
import { DetailedPopulationGroupResult, PopulationResult } from 'fqm-execution/build/types/Calculator';
import React from 'react';

const useStyles = createStyles({
  highlightRed: {
    backgroundColor: '#edd8d0',
    color: '#a63b12',
    borderBottomColor: '#a63b12',
    borderBottomStyle: 'double'
  },
  highlightGreen: {
    backgroundColor: '#ccebe0',
    color: '#20744c',
    borderBottomColor: '#20744c',
    borderBottomStyle: 'solid'
  }
});

export interface PopulationComparisonTableProps {
  patientId: string;
}

export interface DesiredPopulations {
  [key: string]: number;
}
export interface ResultValues {
  resource: string;
  desired: Record<string, number|undefined>;
  actual: Record<string, number|undefined>;
}

export default function PopulationComparisonTable({ patientId }: PopulationComparisonTableProps) {
  const { classes } = useStyles();
  const measureBundle = useRecoilValue(measureBundleState);
  const detailedResultLookup = useRecoilValue(detailedResultLookupState);
  const currentPatients = useRecoilValue(patientTestCaseState);
  const [opened, setOpened] = useState(false);
  const measure = useMemo(() => {
    return measureBundle.content?.entry?.find(e => e.resource?.resourceType === 'Measure')?.resource as fhir4.Measure;
  }, [measureBundle]);

  /**
   * Creates an object where the population is the key and the value is 0 or 1:
   * 0 if that population is not a desired population and 1 if it is.
   */
  function constructPatientDesiredValuesArray(measurePopulations: MultiSelectData[]) {
    const desiredPopulations: DesiredPopulations = {};
    measurePopulations.forEach(measurePopulation => {
      // TODO: keys should probably be values
      if (currentPatients[patientId].desiredPopulations?.includes(measurePopulation.value)) {
        desiredPopulations[measurePopulation.label] = 1;
      } else {
        desiredPopulations[measurePopulation.label] = 0;
      }
    });

    return desiredPopulations;
  }

  /**
   * Creates a ResultValues object for the Patient overall results. Specifies resource (Patient), 
   * desired population values, and actual population values. Desired and actual are key/value pairs,
   * where the population label (criteria) is the key and the value is 0/1: 0 if that population is 
   * not desired (or actual) and 1 if that population is desired (or actual).
   */
  function constructPatientValues(group: DetailedPopulationGroupResult | undefined) {
    const desiredPopulations = constructPatientDesiredValuesArray(getMeasurePopulationsForSelection(measure));
    const patientValues: ResultValues = {
      resource: 'Patient',
      desired: {},
      actual: {}
    };
    console.log('population results: ', group?.populationResults);
    group?.populationResults?.forEach(result => {
      // TODO: keys should probably use population codes (getMeasurePopulationsForSelection *values as opposed to *labels)
      const key = keyForResult(result, group);
      patientValues['actual'][key] = result?.result === true ? 1 : 0;
      patientValues['desired'][key] = desiredPopulations[key];
    });
    return patientValues;
  }

  function keyForResult(result: PopulationResult, group: DetailedPopulationGroupResult | undefined){
    let key = result.criteriaExpression as string;
      
    if(result.populationType === 'measure-observation' && result.criteriaReferenceId){
      // TODO: Also check if ratio measure before adjusting? The current check might be sufficient
      const obsPop = group?.populationResults?.find(pr => pr.populationId === result.criteriaReferenceId)?.populationType;
      if (obsPop){
        key = `${key}-${obsPop}`;
      }else{
        throw new Error('Observation result criteriaReferenceId has no corresponding population');
      }
    }
    return key
  }

  /**
   * Creates an array of ResultValues objects for each of the Episode results. Specifies resource (which episode), 
   * desired population values, and actual population values. Desired and actual are key/value pairs,
   * where the population label (criteria) is the key and the value is 0/1 or the observation value if the population
   * is a measure observation.
   */
  function constructEpisodeValues(group: DetailedPopulationGroupResult | undefined) {
    console.log('episode results: ', group?.episodeResults);
    const results = group?.episodeResults?.map(er => {
      const episode = currentPatients[patientId].resources.find(r => r.id === er.episodeId);
      const keys = er.populationResults.map(pr => keyForResult(pr, group));
      // dummy placeholder until episodes have desired results: all values currently 0
      const desired = keys.reduce((acc: Record<string, number|undefined>, cv) => {
        acc[cv] = 0;
        return acc;
      },{});
      const actual = er.populationResults.reduce((acc: Record<string, number|undefined>, pr: PopulationResult) => {
        const key = keyForResult(pr, group);
        const value = pr.populationType === 'measure-observation' ? 
          (pr.observations?.[0] ?? 0) : // observation TODO: for null observation, should value be 0 or undefined?
          (pr.result ? 1 : 0); // population
        acc[key] = value;
        return acc;
      },{});
      return {
        resource: `${episode?.resourceType}: ${episode?.id}`,
        desired: desired,
        actual: actual
      };
    })
    return results ?? [];
  }

   /**
   * Creates table rows for a single set of result values. These rows specify this resource (patient or episode),
   * desired population values, and actual population values.
   */
  function rowsForResult(result: ResultValues, pops: string[]){
    return (
      <React.Fragment>
        <tr key={result.resource}>
          <td><b>{result.resource}</b></td>
        </tr>
        <tr key={`${result.resource}-desired`}>
          <td>Desired</td>
          {pops.map(p => {
            if (result.desired[p] === result.actual[p]){
              return (
              <td className={classes.highlightGreen} key={`${result.resource}-${result.desired}-${p}` }>
                {result.desired[p]}
              </td>)
            }else{
              return (
              <td className={classes.highlightRed} key={`${result.resource}-${result.desired}-${p}` }>
                {result.desired[p]}
              </td>)
            }
          })}
        </tr>
        <tr key={`${result.resource}-actual`}>
          <td>Actual</td>
          {pops.map(p => {
            if (result.desired[p] === result.actual[p]){
              return (
              <td className={classes.highlightGreen} key={`${result.resource}-${result.actual}-${p}` }>
                {result.actual[p]}
              </td>)
            }else{
              return (
              <td className={classes.highlightRed} key={`${result.resource}-${result.actual}-${p}` }>
                {result.actual[p]}
              </td>)
            }
          })}
        </tr>
      </React.Fragment>
    );
  }

  if (measure) {
    const group = detailedResultLookup[patientId]?.detailedResults?.[0];
    const allValues = [constructPatientValues(group), ...constructEpisodeValues(group)];
    const pops = Object.keys(allValues[0].actual); //patient actual keys

    return (
      <>
        <div />
        <Group>
          <div style={{ paddingRight: 5 }}>
            <Text size="xl" weight={700}>
              Population Comparison Table
            </Text>
          </div>
          <div>
            <Popover opened={opened} onClose={() => setOpened(false)} width={500}>
              <Popover.Target>
                <ActionIcon aria-label={'More Information'} onClick={() => setOpened(o => !o)}>
                  <InfoCircle size={20} />
                </ActionIcon>
              </Popover.Target>
              <Popover.Dropdown>
                The columns in this table represent the possible populations as specified on the uploaded Measure and the
                rows represent the desired and actual populations as stored/calculated by FQM-Testify. The first rows are
                for the patient, and any subsequent rows show episode results For the &apos;Actual&apos; rows, the value 
                will be 1 if the patient calculates into the respective population, and 0 if it does not. The same is true
                for episode population data, but observation data will show actual observation values. For the &apos;Desired&apos; 
                rows, the value will be 1 if the respective population was selected as a desired population for the patient, 
                and 0 if not. The episode observation &apos;Actual&apos; rows will show desired observation values for that 
                episode. If any of the cells are highlighted red, that means the desired population/observation does not match 
                the actual population/observation. If they are highlighted green, then they match.
              </Popover.Dropdown>
            </Popover>
          </div>
        </Group>
        <Table>
          <thead>
            <tr>
              <th />
              {pops.map(p => (<th key={p}>{p}</th>))}
            </tr>
          </thead>
          <tbody>
            {allValues.map(r => {
              return rowsForResult(r, pops);
            })
            }
          </tbody>
        </Table>
      </>
    );
  } else {
    return <Text>Measure highlighting not available</Text>;
  }
}
