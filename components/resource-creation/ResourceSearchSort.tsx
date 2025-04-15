import { Button, Group, TextInput } from '@mantine/core';
import { IconChevronDown, IconChevronUp, IconSearch, IconSelector } from '@tabler/icons';
import React from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { cardFiltersAtom } from '../../state/atoms/patientResources';

const ResourceSearchSort = () => {
  const setCardFilters = useSetRecoilState(cardFiltersAtom);
  const cardFilters = useRecoilValue(cardFiltersAtom);

  const updateSearchString = (newSearch: string) => {
    setCardFilters(prev => ({ ...prev, searchString: newSearch.toLowerCase() }));
  };

  const updateSortType = (newSortType: 'date' | 'resourceType' | '') => {
    setCardFilters(prev => ({ ...prev, sortType: newSortType }));
  };

  const updateSortOrder = (newSortOrder: 'asc' | 'desc' | '') => {
    setCardFilters(prev => ({ ...prev, sortOrder: newSortOrder }));
  };

  const handleSort = (type: 'date' | 'resourceType') => {
    if (cardFilters.sortType === type) {
      updateSortOrder(cardFilters.sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      updateSortType(type);
      updateSortOrder('asc');
    }
  };

  const getSortIcon = (type: 'date' | 'resourceType') => {
    if (cardFilters.sortType !== type) return <IconSelector size={16} stroke={1.5} />;
    return cardFilters.sortOrder === 'asc' ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />;
  };

  return (
    <>
      <TextInput
        placeholder="Search by name or date"
        mb="md"
        icon={<IconSearch size={16} stroke={1.5} />}
        value={cardFilters.searchString}
        onChange={e => updateSearchString(e.target.value)}
      />
      <Group position="left" spacing="md" mb="md">
        <Button variant="default" onClick={() => handleSort('date')} rightIcon={getSortIcon('date')}>
          Date
        </Button>
        <Button variant="default" onClick={() => handleSort('resourceType')} rightIcon={getSortIcon('resourceType')}>
          Resource Type
        </Button>
      </Group>
    </>
  );
};

export default ResourceSearchSort;
