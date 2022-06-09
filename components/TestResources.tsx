import { useRecoilValue } from 'recoil';
import { useState, useEffect } from 'react';
import { measureBundleState } from '../state/atoms/measureBundle';
import { Calculator } from 'fqm-execution';
import { Button, Paper, ScrollArea, Stack, Text } from '@mantine/core';

export default function TestResources() {
  const [dataRequirements, setDataRequirements] = useState<fhir4.DataRequirement[] | null>(null);
  const measureBundle = useRecoilValue(measureBundleState);
  useEffect(() => {
    if (measureBundle.content) {
      Calculator.calculateDataRequirements(measureBundle.content).then(requirements => {
        if (requirements.results.dataRequirement) {
          setDataRequirements(requirements.results.dataRequirement);
        }
      });
    }
  }, [measureBundle]);

  return (
    <ScrollArea>
      <Stack>
        {dataRequirements?.map(dr => {
          return (
            <Button key={dr.id}>
              <Paper>
                <Text>{dr.type}</Text>
              </Paper>
            </Button>
          );
        })}
      </Stack>
    </ScrollArea>
  );
}
