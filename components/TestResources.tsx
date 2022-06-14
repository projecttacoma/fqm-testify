import { useRecoilValue } from 'recoil';
import { useState, useEffect } from 'react';
import { measureBundleState } from '../state/atoms/measureBundle';
import { Calculator } from 'fqm-execution';
import { Affix, Button, Stack, Text, Title, useMantineTheme } from '@mantine/core';
import { getDataRequirementFiltersString } from '../util/fhir';
import { patientTestCaseState } from '../state/atoms/patientTestCase';

export default function TestResourcesDisplay() {
  const [dataRequirements, setDataRequirements] = useState<fhir4.DataRequirement[] | null>(null);
  const measureBundle = useRecoilValue(measureBundleState);
  const currentPatients = useRecoilValue(patientTestCaseState);
  const theme = useMantineTheme();
  useEffect(() => {
    if (measureBundle.content) {
      Calculator.calculateDataRequirements(measureBundle.content).then(requirements => {
        const drs = requirements.results.dataRequirement;
        if (drs) {
          drs.sort((a, b) => {
            return a.type + getDataRequirementFiltersString(a, measureBundle.valueSetsMap) >
              b.type + getDataRequirementFiltersString(b, measureBundle.valueSetsMap)
              ? 1
              : -1;
          });
          setDataRequirements(drs);
        }
      });
    }
  }, [measureBundle]);

  return dataRequirements?.length && Object.keys(currentPatients).length ? (
    <Affix
      data-testid="test-resource-affix"
      zIndex={1}
      position={{ bottom: 20, right: 20 }}
      style={{
        maxHeight: '55vh',
        overflow: 'scroll',
        width: '40vw',
        backgroundColor: theme.colors.blue[6],
        padding: 20,
        borderRadius: 10
      }}
    >
      <Stack>
        {dataRequirements.map((dr, i) => {
          const key = `${dr.type}${i}`;
          const displayString = getDataRequirementFiltersString(dr, measureBundle.valueSetsMap);
          return (
            <Button key={key} fullWidth variant="default" style={{ height: 'auto', padding: 10, overflow: 'hidden' }}>
              <div style={{ overflow: 'hidden' }}>
                <Title order={3}>{dr.type}</Title>
                <Text style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayString}</Text>
              </div>
            </Button>
          );
        })}
      </Stack>
    </Affix>
  ) : null;
}
