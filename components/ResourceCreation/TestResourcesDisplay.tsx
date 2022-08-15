import { useRecoilState, useRecoilValue } from 'recoil';
import { Button, Stack, Text, Title } from '@mantine/core';
import { getDataRequirementFiltersString } from '../../util/fhir';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { valueSetMapState } from '../../state/selectors/valueSetsMap';
import { dataRequirementsState } from '../../state/selectors/dataRequirements';
import { selectedDataRequirementState } from '../../state/atoms/selectedDataRequirement';
import Fuse from 'fuse.js';
import SearchBar from './SearchBar';
import { searchQueryState } from '../../state/atoms/searchQuery';
import { useEffect, useState } from 'react';
import { DataRequirement } from 'fhir/r4';

export default function TestResourcesDisplay() {
  const dataRequirements = useRecoilValue(dataRequirementsState);
  const [, setSelectedDataRequirement] = useRecoilState(selectedDataRequirementState);
  const valueSetMap = useRecoilValue(valueSetMapState);
  const currentPatients = useRecoilValue(patientTestCaseState);
  const searchQuery = useRecoilValue(searchQueryState);
  const [displayDataReqs, setDisplayDataReqs] = useState<DataRequirement[] | null>(dataRequirements);

  

  

  useEffect(() => {
    const returnSearchResults = () => {
      const searchContents = getSearchContent();
      if (dataRequirements && searchContents) {
        const options = {keys: ['type', 'key', 'id', 'displayString']};
        const fuse = new Fuse(searchContents, options);
        const results = fuse.search(searchQuery).map(dr => dr.item.displayString);
        const foundDrs = dataRequirements.filter(dr => {return results.includes(getDataRequirementFiltersString(dr, valueSetMap))});
        return foundDrs;
      }
    };

    const getSearchContent = () => {
      if (dataRequirements) {
        const formattedData = dataRequirements.map((dr, i) => {
          const type = dr.type;
          const key = `${dr.type}${i}`
          const id = dr.id;
          const displayString = getDataRequirementFiltersString(dr, valueSetMap);
          return {type, key, id, displayString}
        });
        return formattedData;
      }
    };

    const searchResults = returnSearchResults();
    setDisplayDataReqs(searchResults?.length ? searchResults : dataRequirements);
  }, [dataRequirements, searchQuery, valueSetMap]);

  return dataRequirements?.length && Object.keys(currentPatients).length ? (
    <>
    <SearchBar style={{padding: '10px'}}/>
    <div
      data-testid="test-resource-panel"
      style={{
        maxHeight: '40vh',
        overflow: 'scroll'
      }}
    >
      <Stack>
        {displayDataReqs?.map((dr, i) => {
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
    </>
  ) : null;
}
