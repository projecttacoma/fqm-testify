import { useRecoilState, useRecoilValue } from 'recoil';
import { Select } from '@mantine/core';
import { getDataRequirementFiltersString } from '../../util/fhir';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { valueSetMapState } from '../../state/selectors/valueSetsMap';
import { dataRequirementsState } from '../../state/selectors/dataRequirements';
import { selectedDataRequirementState } from '../../state/atoms/selectedDataRequirement';
import React, { forwardRef, useRef } from 'react';
import DataRequirementCard from '../DataRequirementCard';
import { dataRequirementsLookupState } from '../../state/selectors/dataRequirementsLookup';

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  label: string;
  description: string;
  dataRequirement: fhir4.DataRequirement;
}

const DataRequirementSelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ dataRequirement, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <DataRequirementCard dataRequirement={dataRequirement} />
    </div>
  )
);

DataRequirementSelectItem.displayName = 'DataRequirementSelectItem';

export default function TestResourcesDisplay() {
  const dataRequirements = useRecoilValue(dataRequirementsState);
  const [, setSelectedDataRequirement] = useRecoilState(selectedDataRequirementState);
  const valueSetMap = useRecoilValue(valueSetMapState);
  const currentPatients = useRecoilValue(patientTestCaseState);
  const dataRequirementsLookup = useRecoilValue(dataRequirementsLookupState);

  const drSelectRef = useRef<HTMLInputElement>(null);

  return dataRequirements?.length && Object.keys(currentPatients).length ? (
    <div>
      <Select
        ref={drSelectRef}
        maxDropdownHeight={500}
        searchable
        clearable
        placeholder="Select FHIR Resource"
        value=""
        data={
          dataRequirements?.map(dr => {
            const displayString = getDataRequirementFiltersString(dr, valueSetMap);
            return {
              label: `${dr.type}: ${displayString}`,
              value: `${dr.type}|${displayString}`,
              dataRequirement: dr
            };
          }) ?? []
        }
        onChange={val => {
          if (val) {
            const dr = dataRequirementsLookup[val];
            if (drSelectRef.current) {
              drSelectRef.current.blur();
              setSelectedDataRequirement({ name: val, content: dr });
            }
          }
        }}
        itemComponent={DataRequirementSelectItem}
      />
    </div>
  ) : null;
}
