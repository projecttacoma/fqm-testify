import { useRecoilState, useRecoilValue } from 'recoil';
import { Button, Stack, Text, Title } from '@mantine/core';
import { getDataRequirementFiltersString } from '../../util/fhir';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { valueSetMapState } from '../../state/selectors/valueSetsMap';
import { dataRequirementsState } from '../../state/selectors/dataRequirements';
import { selectedDataRequirementState } from '../../state/atoms/selectedDataRequirement';
import Fuse from 'fuse.js';
import SearchBar from './SearchBar';
import { useEffect, useState } from 'react';
import { DataRequirement } from 'fhir/r4';

interface DataSearchKeys {
  dr: DataRequirement;
  type: string;
  displayString: string;
}

export default function TestResourcesDisplay() {
  const dataRequirements = useRecoilValue(dataRequirementsState);
  const [, setSelectedDataRequirement] = useRecoilState(selectedDataRequirementState);
  const valueSetMap = useRecoilValue(valueSetMapState);
  const currentPatients = useRecoilValue(patientTestCaseState);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dataReqsToDisplay, setDataReqsToDisplay] = useState<DataRequirement[] | null>(dataRequirements);

  useEffect(() => {
    /**
     * Assembles an array of data that will be searched by FuseJS to narrow
     * down the displayed data requirements in the test resources display.
     * @returns array of data to use for fuzzy searching
     */
    const getSearchContents = (): DataSearchKeys[] | undefined => {
      if (dataRequirements) {
        const searchableData = dataRequirements.map(dr => {
          const type = dr.type;
          const displayString = getDataRequirementFiltersString(dr, valueSetMap);
          return { dr, type, displayString };
        });
        return searchableData;
      }
    };

    /**
     * Uses FuseJS to do a fuzzy search on the search contents. Then, filters the
     * data requirements so that the displayed data requirements are those that
     * came back from the search.
     * @returns array of data requirements returned from FuseJS search
     */
    const filterBySearchResults = () => {
      const searchContents = getSearchContents();
      if (dataRequirements && searchContents) {
        const keys: (keyof DataSearchKeys)[] = ['type', 'displayString'];
        const fuse = new Fuse(searchContents, { keys: keys, threshold: 0.3 });
        const results = fuse.search(searchQuery).map(result => result.item.dr);
        return results;
      }
    };

    const searchResults = filterBySearchResults();
    // default to all data requirements if there is no search query
    setDataReqsToDisplay(searchResults && searchQuery !== '' ? searchResults : dataRequirements);
  }, [dataRequirements, searchQuery, valueSetMap]);

  return dataRequirements?.length && Object.keys(currentPatients).length ? (
    <>
      <SearchBar style={{ padding: '10px' }} {...{ searchQuery, setSearchQuery }} aria-label="search-bar" />
      <div
        data-testid="test-resource-panel"
        style={{
          maxHeight: '40vh',
          overflow: 'scroll'
        }}
      >
        <Stack>
          {dataReqsToDisplay?.map((dr, i) => {
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
