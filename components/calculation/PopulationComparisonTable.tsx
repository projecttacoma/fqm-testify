import { ActionIcon, createStyles, Group, Popover, Table, Text } from '@mantine/core';
import { useRecoilValue } from 'recoil';
import { measureReportLookupState } from '../../state/atoms/measureReportLookup';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { useMemo, useState } from 'react';
import { getMeasurePopulations, MultiSelectData } from './MeasurePopulations';
import { MeasureReportGroup } from 'fhir/r4';
import { InfoCircle } from 'tabler-icons-react';

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
  const measureReportLookup = useRecoilValue(measureReportLookupState);
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
  function constructBothPopulationsValuesArray(group: MeasureReportGroup | undefined) {
    const desiredPopulations = constructDesiredPopulationsValuesArray(getMeasurePopulations(measure));
    const bothPopulations: BothPopulations = {};
    group?.population?.forEach(population => {
      const key = population?.code?.coding?.[0]?.display || population?.code?.coding?.[0]?.code;
      if (key) {
        bothPopulations[key as string] = { desired: desiredPopulations[key as string], actual: population?.count };
      }
    });
    return bothPopulations;
  }
  if (measure) {
    const group = measureReportLookup[patientId]?.group?.[0];
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
                The rows in this table represent the possible populations as specified on the uploaded Measure and the
                two columns represent the desired and actual populations as stored/calculated by FQM-Testify. For the
                &apos;Actual&apos; column, the value will be 1 if the patient calculates into the respective population,
                and 0 if it does not. For the &apos;Desired&apos; column, the value will be 1 if the respective
                population was selected as a desired population for the patient, and 0 if not. If any of the rows are
                highlighted red, that means the desired population does not match the actual population. If they are
                highlighted green, then they match.
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
