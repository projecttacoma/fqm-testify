import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Select } from '@mantine/core';
import { getDataRequirementFiltersString } from '../../util/fhir';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { valueSetMapState } from '../../state/selectors/valueSetsMap';
import { dataRequirementsState } from '../../state/selectors/dataRequirements';
import { selectedDataRequirementState } from '../../state/atoms/selectedDataRequirement';
import React, { forwardRef, useRef } from 'react';
import DataRequirementSelectOption from '../utils/DataRequirementSelectOption';
import { dataRequirementsLookupState } from '../../state/selectors/dataRequirementsLookup';

interface DataRequirementsItemProps extends React.ComponentPropsWithoutRef<'div'> {
  label: string;
  description: string;
  dataRequirement: fhir4.DataRequirement;
}

// Use forwardRef for custom SelectItem to ensure proper native select behavior
// E.g. arrow keys/enter to select items
const DataRequirementSelectItem = forwardRef<HTMLDivElement, DataRequirementsItemProps>(
  ({ dataRequirement, ...rest }: DataRequirementsItemProps, ref) => (
    <div ref={ref} {...rest}>
      <DataRequirementSelectOption dataRequirement={dataRequirement} />
    </div>
  )
);

DataRequirementSelectItem.displayName = 'DataRequirementSelectItem';

export default function ResourceSelection() {
  const dataRequirements = useRecoilValue(dataRequirementsState);
  const setSelectedDataRequirement = useSetRecoilState(selectedDataRequirementState);
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
