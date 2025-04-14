import { Button, Group, TextInput } from '@mantine/core';
import { IconChevronDown, IconChevronUp, IconSearch, IconSelector } from '@tabler/icons';
import React, { useEffect, useState } from 'react';
import { getFhirResourceSummary } from '../../util/fhir/codes';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { patientResourcesAtom, filteredPatientResourcesAtom } from '../../state/atoms/patientResources';

type Props = {
  dateForResource: (resource: fhir4.FhirResource) => { date: string; dateType: string };
};

const ResourceSearchSort: React.FC<Props> = ({ dateForResource }) => {
  const [search, setSearch] = useState('');
  const [sortType, setSortType] = useState<'date' | 'resourceType' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const resources = useRecoilValue(patientResourcesAtom);
  const setFilteredPatientResources = useSetRecoilState(filteredPatientResourcesAtom);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearch(query);
  };

  const handleSort = (type: 'date' | 'resourceType') => {
    if (sortType === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortType(type);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (type: 'date' | 'resourceType') => {
    if (sortType !== type) return <IconSelector size={16} stroke={1.5} />;
    return sortOrder === 'asc' ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />;
  };

  useEffect(() => {
    const query = search.toLowerCase();

    const filtered = resources.filter(entry => {
      if (!entry.resource) return false;
      const resourceType = entry.resource.resourceType?.toLowerCase() || '';
      const label = getFhirResourceSummary(entry.resource).toLowerCase();
      const { date, dateType } = dateForResource(entry.resource);
      return (
        resourceType.includes(query) ||
        label.includes(query) ||
        date.toLowerCase().includes(query) ||
        dateType.toLowerCase().includes(query)
      );
    });

    if (sortType) {
      filtered.sort((a, b) => {
        if (!a.resource || !b.resource) return 0;

        if (sortType === 'date') {
          const dateA = dateForResource(a.resource).date.toLowerCase();
          const dateB = dateForResource(b.resource).date.toLowerCase();
          return sortOrder === 'asc' ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
        }

        if (sortType === 'resourceType') {
          const typeA = a.resource.resourceType.toLowerCase();
          const typeB = b.resource.resourceType.toLowerCase();
          return sortOrder === 'asc' ? typeA.localeCompare(typeB) : typeB.localeCompare(typeA);
        }

        return 0;
      });
    }

    setFilteredPatientResources(filtered);
  }, [search, resources, sortType, sortOrder, setFilteredPatientResources ]);

  return (
    <>
      <TextInput
        placeholder="Search by name or date"
        mb="md"
        icon={<IconSearch size={16} stroke={1.5} />}
        value={search}
        onChange={handleSearchChange}
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
