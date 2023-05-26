import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Select } from '@mantine/core';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { valueSetMapState } from '../../state/selectors/valueSetsMap';
import { dataRequirementsState } from '../../state/selectors/dataRequirements';
import { selectedDataRequirementState } from '../../state/atoms/selectedDataRequirement';
import React, { forwardRef, useState } from 'react';
import DataRequirementSelectOption from '../utils/DataRequirementSelectOption';
import {
  dataRequirementsLookupState,
  getDataRequirementsLookupKey
} from '../../state/selectors/dataRequirementsLookup';
import { getDataRequirementFiltersString } from '../../util/fhir/codes';

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

  // Used to conditionally change the searchable prop of the select box
  // Prevents a bug where the searchable prop caused dropdown to stay open after modal close
  const [enableSearch, setEnableSearch] = useState(false);

  return dataRequirements?.length && Object.keys(currentPatients).length > 0 ? (
    <div>
      <Select
        dropdownComponent="div"
        searchable={enableSearch}
        maxDropdownHeight={500}
        placeholder="Select FHIR Resource (from Data Requirements)"
        value=""
        data={
          dataRequirements?.map((dr, i) => {
            const displayString = getDataRequirementFiltersString(dr, valueSetMap);
            return {
              label: `${dr.type}: ${displayString}`,
              value: getDataRequirementsLookupKey(dr, valueSetMap, i),
              dataRequirement: dr
            };
          }) ?? []
        }
        onChange={val => {
          if (val) {
            const dr = dataRequirementsLookup[val];
            setSelectedDataRequirement({ name: val, content: dr });
            setEnableSearch(false);
          }
        }}
        onDropdownOpen={() => {
          setEnableSearch(true);
        }}
        itemComponent={DataRequirementSelectItem}
      />
    </div>
  ) : null;
}
