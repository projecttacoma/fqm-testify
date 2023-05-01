import { ActionIcon, Group, Popover, Text, Badge } from '@mantine/core';
import { useRecoilValue } from 'recoil';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { useMemo, useState } from 'react';
import { InfoCircle } from 'tabler-icons-react';
import { detailedResultLookupState } from '../../state/atoms/detailedResultLookup';
import { DetailedPopulationGroupResult } from 'fqm-execution/build/types/Calculator';

export interface ObservationListsProps {
  patientId: string;
}

export interface DesiredPopulations {
  [key: string]: number;
}

export default function ObservationLists({ patientId }: ObservationListsProps) {
  const measureBundle = useRecoilValue(measureBundleState);
  const detailedResultLookup = useRecoilValue(detailedResultLookupState);
  const [opened, setOpened] = useState(false);
  const measure = useMemo(() => {
    return measureBundle.content?.entry?.find(e => e.resource?.resourceType === 'Measure')?.resource as fhir4.Measure;
  }, [measureBundle]);

  /**
   * Limits results to just those that are associated with observations
   */
  function filteredResults(group: DetailedPopulationGroupResult | undefined) {
    console.log("Checked results: ", group?.populationResults);
    return group?.populationResults?.filter( r =>{
      return (r?.populationType === 'measure-observation')});
  }

  if (measure) {
    const group = detailedResultLookup[patientId]?.detailedResults?.[0];
    const obsResults = filteredResults(group);
    if (obsResults){
      console.log('Observation results: ',obsResults);
      return (
        <>
          <div />
          <Group>
            <div style={{ paddingRight: 5 }}>
              <Text size="xl" weight={700}>
                Observations
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
                  The below observation list(s) show all of the individual observations that were gathered 
                  for this patient that match the observation criteria. These observations are collated to
                  determine the final observation value in the Population Comparison Table.
                </Popover.Dropdown>
              </Popover>
            </div>
          </Group>
          {
          obsResults.map(r => {
            return (
              <div style={{ paddingRight: 6 }} key={r.criteriaExpression}>
                <Text size="md" weight={500}>
                  Observation: <b>{r.criteriaExpression}</b>
                </Text>
                <Group style={{paddingTop: 8, paddingBottom: 8}}>
                  {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    r.observations.map((o: any) => {
                      return <Badge size="lg" variant={"filled"} key={o}>{o}</Badge >;
                    })
                  }
                </Group>
              </div>)
          })
          }
        </>
      );
    } else {
      return <Text>No observation results.</Text>;
    }
  } else {
    return <Text>Measure observation results not available.</Text>;
  }
}
