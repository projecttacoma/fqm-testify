import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import ResourceSearchSort from '../../../components/resource-creation/ResourceSearchSort';
import '@testing-library/jest-dom/extend-expect';
import { RecoilRoot } from 'recoil';
import { patientResourcesAtom } from '../../../state/atoms/patientResources';

// Mock FHIR resources
const mockResources = [
  { resource: { resourceType: 'Patient', id: '1' } },
  { resource: { resourceType: 'Observation', id: '2' } },
  { resource: { resourceType: 'Medication', id: '3' } }
] as fhir4.BundleEntry[];

// Mock date extractor
const mockDateForResource = (resource: fhir4.FhirResource) => ({
  date: resource.id === '1' ? '2023-03-10' : resource.id === '2' ? '2024-05-20' : '2022-01-15',
  dateType: 'recordedDate'
});

// Dummy component to show filtered output (you can replace with actual rendering logic if your app has it)
import { useRecoilValue } from 'recoil';
import { filteredPatientResourcesAtom } from '../../../state/atoms/patientResources';

const FilteredResourcesViewer = () => {
  const filtered = useRecoilValue(filteredPatientResourcesAtom);
  return (
    <ul data-testid="filtered-list">
      {filtered.map((entry) => (
        <li key={entry.resource?.id}>
          {entry.resource?.resourceType} - {entry.resource?.id}
        </li>
      ))}
    </ul>
  );
};

const renderWithRecoil = () => {
  return render(
    <RecoilRoot
      initializeState={({ set }) => {
        set(patientResourcesAtom, mockResources);
      }}
    >
      <ResourceSearchSort dateForResource={mockDateForResource} />
      <FilteredResourcesViewer />
    </RecoilRoot>
  );
};

describe('ResourceSearchSort Component', () => {
  test('renders search input and sort buttons', () => {
    renderWithRecoil();
    expect(screen.getByPlaceholderText('Search by name or date')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Resource Type')).toBeInTheDocument();
  });

  test('filters by search query', () => {
    renderWithRecoil();

    const searchInput = screen.getByPlaceholderText('Search by name or date');
    fireEvent.change(searchInput, { target: { value: 'Observation' } });

    const list = screen.getByTestId('filtered-list');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('Observation - 2');
  });

  test('sorts by date ascending and descending', () => {
    renderWithRecoil();
    const dateButton = screen.getByText('Date');

    // Click once: Ascending
    fireEvent.click(dateButton);
    let items = within(screen.getByTestId('filtered-list')).getAllByRole('listitem');
    const sortedAsc = items.map((li) => li.textContent);
    expect(sortedAsc).toEqual(['Medication - 3', 'Patient - 1', 'Observation - 2']);

    // Click again: Descending
    fireEvent.click(dateButton);
    items = within(screen.getByTestId('filtered-list')).getAllByRole('listitem');
    const sortedDesc = items.map((li) => li.textContent);
    expect(sortedDesc).toEqual(['Observation - 2', 'Patient - 1', 'Medication - 3']);
  });

  test('sorts by resource type ascending and descending', () => {
    renderWithRecoil();
    const typeButton = screen.getByText('Resource Type');

    // Click once: Ascending
    fireEvent.click(typeButton);
    let items = within(screen.getByTestId('filtered-list')).getAllByRole('listitem');
    const sortedAsc = items.map((li) => li.textContent);
    expect(sortedAsc).toEqual(['Medication - 3', 'Observation - 2', 'Patient - 1']);

    // Click again: Descending
    fireEvent.click(typeButton);
    items = within(screen.getByTestId('filtered-list')).getAllByRole('listitem');
    const sortedDesc = items.map((li) => li.textContent);
    expect(sortedDesc).toEqual(['Patient - 1', 'Observation - 2', 'Medication - 3']);
  });
});
