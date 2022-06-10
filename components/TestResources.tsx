import { useRecoilValue } from 'recoil';
import { useState, useEffect } from 'react';
import { measureBundleState } from '../state/atoms/measureBundle';
import { Calculator } from 'fqm-execution';
import { Affix, Button, Stack, Text } from '@mantine/core';
import { getDataRequirementFiltersString } from '../util/fhir';
import { patientTestCaseState } from '../state/atoms/patientTestCase';

export default function TestResourcesDisplay() {
  const [dataRequirements, setDataRequirements] = useState<fhir4.DataRequirement[] | null>(null);
  const measureBundle = useRecoilValue(measureBundleState);
  const currentPatients = useRecoilValue(patientTestCaseState);
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

  return measureBundle.content !== null && Object.keys(currentPatients).length > 0 ? (
    <Affix
      zIndex={1}
      position={{ bottom: 20, right: 20 }}
      style={{ maxHeight: '50vh', overflow: 'scroll', width: '40vw', backgroundColor: 'white' }}
    >
      <Stack>
        {dataRequirements?.map(dr => {
          return (
            <Button key={dr.id} fullWidth variant="outline" style={{ height: 'auto', padding: 10 }}>
              <div style={{ width: '100%' }}>
                <Text>{dr.type}</Text>
                <Text>{getDataRequirementFiltersString(dr)}</Text>
              </div>
            </Button>
          );
        })}
      </Stack>
    </Affix>
  ) : null;
}
