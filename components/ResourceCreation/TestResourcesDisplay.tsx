import { useRecoilState, useRecoilValue } from 'recoil';
import { Button, Stack, Text, Title } from '@mantine/core';
import { getDataRequirementFiltersString } from '../../util/fhir';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { valueSetMapState } from '../../state/selectors/valueSetsMap';
import { dataRequirementsState } from '../../state/selectors/dataRequirements';
import { selectedDataRequirementState } from '../../state/atoms/selectedDataRequirement';

export default function TestResourcesDisplay() {
  const dataRequirements = useRecoilValue(dataRequirementsState);
  const [, setSelectedDataRequirement] = useRecoilState(selectedDataRequirementState);
  const valueSetMap = useRecoilValue(valueSetMapState);
  const currentPatients = useRecoilValue(patientTestCaseState);

  return dataRequirements?.length && Object.keys(currentPatients).length ? (
    <div
      data-testid="test-resource-panel"
      style={{
        maxHeight: '40vh',
        overflow: 'scroll'
      }}
    >
      <Stack>
        {dataRequirements.map((dr, i) => {
          const key = `${dr.type}${i}`;
          const displayString = getDataRequirementFiltersString(dr, valueSetMap);
          return (
            <Button
              key={key}
              onClick={() => {
                setSelectedDataRequirement({ name: displayString, content: dr });
              }}
              fullWidth
              variant="default"
              style={{ height: 'auto', padding: 10, overflow: 'hidden' }}
            >
              <div style={{ overflow: 'hidden' }}>
                <Title order={3}>{dr.type}</Title>
                <Text style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayString}</Text>
              </div>
            </Button>
          );
        })}
      </Stack>
    </div>
  ) : null;
}
