import { useRecoilValue } from 'recoil';
import { useState, useEffect } from 'react';
import { measureBundleState } from '../state/atoms/measureBundle';
import { Calculator } from 'fqm-execution';
import { Affix, Button, Stack, Text, useMantineTheme } from '@mantine/core';
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
            return a.type + getDataRequirementFiltersString(a) > b.type + getDataRequirementFiltersString(b) ? 1 : -1;
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
        {dataRequirements?.map(dr => {
          const displayString = getDataRequirementFiltersString(dr);
          return (
            <Button key={displayString} fullWidth variant="default" style={{ height: 'auto', padding: 10 }}>
              <div>
                <Text>{dr.type}</Text>
                <Text>{displayString}</Text>
              </div>
            </Button>
          );
        })}
      </Stack>
    </Affix>
  ) : null;
}
