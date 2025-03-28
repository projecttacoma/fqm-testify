import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ResourceSearchSort from '../../../components/resource-creation/ResourceSearchSort';
import '@testing-library/jest-dom/extend-expect';

// Mock data for FHIR resources
const mockResources = [
  { resource: { resourceType: 'Patient', id: '1' } },
  { resource: { resourceType: 'Observation', id: '2' } },
  { resource: { resourceType: 'Medication', id: '3' } }
] as fhir4.BundleEntry[];

// Mock function to get resource date
const mockDateForResource = (resource: fhir4.FhirResource) => ({
  date: resource.id === '1' ? '2023-03-10' : resource.id === '2' ? '2024-05-20' : '2022-01-15',
  dateType: 'recordedDate'
});

// Mock function for sorting callback
const mockOnSorted = jest.fn();

describe('ResourceSearchSort Component', () => {
  beforeEach(() => {
    render(
      <ResourceSearchSort resources={mockResources} onSorted={mockOnSorted} dateForResource={mockDateForResource} />
    );
  });

  test('renders search input and sorting buttons', () => {
    expect(screen.getByPlaceholderText('Search by name or date')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Resource Type')).toBeInTheDocument();
  });

  test('filters resources when search input is entered', () => {
    const searchInput = screen.getByPlaceholderText('Search by name or date') as HTMLInputElement;

    fireEvent.change(searchInput, { target: { value: 'Observation' } });
    expect(mockOnSorted).toHaveBeenCalledWith([{ resource: { resourceType: 'Observation', id: '2' } }]);
  });

  test('sorts resources by date in ascending and descending order', () => {
    const dateSortButton = screen.getByText('Date');

    // Click once to sort by date ascending
    fireEvent.click(dateSortButton);
    expect(mockOnSorted).toHaveBeenCalledWith([
      { resource: { resourceType: 'Medication', id: '3' } }, // 2022-01-15
      { resource: { resourceType: 'Patient', id: '1' } }, // 2023-03-10
      { resource: { resourceType: 'Observation', id: '2' } } // 2024-05-20
    ]);

    // Click again to sort by date descending
    fireEvent.click(dateSortButton);
    expect(mockOnSorted).toHaveBeenCalledWith([
      { resource: { resourceType: 'Observation', id: '2' } }, // 2024-05-20
      { resource: { resourceType: 'Patient', id: '1' } }, // 2023-03-10
      { resource: { resourceType: 'Medication', id: '3' } } // 2022-01-15
    ]);
  });

  test('sorts resources by resource type in ascending and descending order', () => {
    const typeSortButton = screen.getByText('Resource Type');

    // Click once to sort by resource type ascending
    fireEvent.click(typeSortButton);
    expect(mockOnSorted).toHaveBeenCalledWith([
      { resource: { resourceType: 'Medication', id: '3' } },
      { resource: { resourceType: 'Observation', id: '2' } },
      { resource: { resourceType: 'Patient', id: '1' } }
    ]);

    // Click again to sort by resource type descending
    fireEvent.click(typeSortButton);
    expect(mockOnSorted).toHaveBeenCalledWith([
      { resource: { resourceType: 'Patient', id: '1' } },
      { resource: { resourceType: 'Observation', id: '2' } },
      { resource: { resourceType: 'Medication', id: '3' } }
    ]);
  });

  test('resets sorting when button is clicked a third time', () => {
    const dateSortButton = screen.getByText('Date');

    // Click three times to reset sorting
    fireEvent.click(dateSortButton);
    fireEvent.click(dateSortButton);
    fireEvent.click(dateSortButton);

    expect(mockOnSorted).toHaveBeenCalledWith(mockResources); // Should return to original order
  });
});
