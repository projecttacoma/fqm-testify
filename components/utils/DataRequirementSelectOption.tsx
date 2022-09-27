import { Text } from '@mantine/core';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { valueSetMapState } from '../../state/selectors/valueSetsMap';
import { getDataRequirementFiltersString } from '../../util/fhir/codes';

export interface DataRequirementSelectOptionProps {
  dataRequirement: fhir4.DataRequirement;
}

export default function DataRequirementSelectOption({ dataRequirement }: DataRequirementSelectOptionProps) {
  const valueSetMap = useRecoilValue(valueSetMapState);

  const displayString = getDataRequirementFiltersString(dataRequirement, valueSetMap);

  return (
    <div style={{ overflow: 'hidden' }}>
      <Text size="lg">{dataRequirement.type}</Text>
      <Text color="dimmed">{displayString}</Text>
    </div>
  );
}
