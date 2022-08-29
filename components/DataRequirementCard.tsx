import { Text } from '@mantine/core';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { valueSetMapState } from '../state/selectors/valueSetsMap';
import { getDataRequirementFiltersString } from '../util/fhir';

interface DataRequirementCardProps {
  dataRequirement: fhir4.DataRequirement;
}

export default function DataRequirementCard({ dataRequirement }: DataRequirementCardProps) {
  const valueSetMap = useRecoilValue(valueSetMapState);

  const displayString = getDataRequirementFiltersString(dataRequirement, valueSetMap);

  return (
    <div style={{ overflow: 'hidden' }}>
      <Text size="lg">{dataRequirement.type}</Text>
      <Text color="dimmed">{displayString}</Text>
    </div>
  );
}
