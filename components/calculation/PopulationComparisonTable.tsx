import { ActionIcon, createStyles, Group, Popover, Table, Text } from '@mantine/core';
import { useRecoilValue } from 'recoil';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { useMemo, useState } from 'react';
import { getMeasurePopulationsForSelection, MultiSelectData } from '../../util/MeasurePopulations';
import { InfoCircle } from 'tabler-icons-react';
import { detailedResultLookupState } from '../../state/atoms/detailedResultLookup';
import { DetailedPopulationGroupResult } from 'fqm-execution/build/types/Calculator';

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
export interface BothPopulations {
  [key: string]: {
    desired: number;
    actual: number | undefined;
  };
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
  function constructDesiredPopulationsValuesArray(measurePopulations: MultiSelectData[]) {
    const desiredPopulations: DesiredPopulations = {};
    measurePopulations.forEach(measurePopulation => {
      if (currentPatients[patientId].desiredPopulations?.includes(measurePopulation.value)) {
        desiredPopulations[measurePopulation.label as string] = 1;
      } else {
        desiredPopulations[measurePopulation.label as string] = 0;
      }
    });

    return desiredPopulations;
  }

  /**
   * Creates an object where the population is the key and it has two properties: actual and desired.
   * Both properties can either be 0 or 1: 0 if that population is not desired (or actual) and 1 if
   * that population is desired (or actual).
   */
  function constructBothPopulationsValuesArray(group: DetailedPopulationGroupResult | undefined) {
    const desiredPopulations = constructDesiredPopulationsValuesArray(getMeasurePopulationsForSelection(measure));
    const bothPopulations: BothPopulations = {};
    console.log('episode results: ', group?.episodeResults);
    console.log('population results: ', group?.populationResults);
    group?.populationResults?.forEach(result => {
      // TODO: keys should probably use population codes (getMeasurePopulationsForSelection values as opposed to labels)
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
      bothPopulations[key] = {
        desired: desiredPopulations[key],
        actual: result?.result === true ? 1 : 0
      };
    });
    return bothPopulations;
  }
  if (measure) {
    const group = detailedResultLookup[patientId]?.detailedResults?.[0];
    const bothPopulations = constructBothPopulationsValuesArray(group);

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
              <th>Desired Population</th>
              <th>Actual Population</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(bothPopulations).map(e => {
              if (e[1].desired === e[1].actual) {
                return (
                  <tr className={classes.highlightGreen} key={e[0]}>
                    <td>{e[0]}</td>
                    <td>{e[1].desired}</td>
                    <td>{e[1].actual}</td>
                  </tr>
                );
              } else {
                return (
                  <tr className={classes.highlightRed} key={e[0]}>
                    <td>{e[0]}</td>
                    <td>{e[1].desired}</td>
                    <td>{e[1].actual}</td>
                  </tr>
                );
              }
            })}
          </tbody>
        </Table>
      </>
    );
  } else {
    return <Text>Measure highlighting not available</Text>;
  }
}
