import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ResourceSearchSort from '../../../components/resource-creation/ResourceSearchSort';
import { RecoilRoot, useRecoilValue } from 'recoil';
import { cardFiltersAtom } from '../../../state/atoms/patientResources';
import '@testing-library/jest-dom/extend-expect';

// Utility component to expose current state for assertions
const DebugState = () => {
  const state = useRecoilValue(cardFiltersAtom);
  return <div data-testid="debug-state">{JSON.stringify(state)}</div>;
};

describe('ResourceSearchSort', () => {
  const setup = () =>
    render(
      <RecoilRoot>
        <ResourceSearchSort />
        <DebugState />
      </RecoilRoot>
    );

  it('renders search input and buttons', () => {
    setup();
    expect(screen.getByPlaceholderText(/search by name or date/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /date/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /resource type/i })).toBeInTheDocument();
  });

  it('updates search string in Recoil state', () => {
    setup();
    const input = screen.getByPlaceholderText(/search by name or date/i);
    fireEvent.change(input, { target: { value: 'Patient' } });

    expect(screen.getByTestId('debug-state')).toHaveTextContent(
      JSON.stringify({ searchString: 'patient', sortType: '', sortOrder: '' })
    );
  });

  it('updates sort type and order when clicking sort buttons', () => {
    setup();

    const dateButton = screen.getByRole('button', { name: /date/i });
    fireEvent.click(dateButton); // First click: set sortType = date, sortOrder = asc

    expect(screen.getByTestId('debug-state')).toHaveTextContent(
      JSON.stringify({ searchString: '', sortType: 'date', sortOrder: 'asc' })
    );

    fireEvent.click(dateButton); // Second click: toggle sortOrder to desc
    expect(screen.getByTestId('debug-state')).toHaveTextContent(
      JSON.stringify({ searchString: '', sortType: 'date', sortOrder: 'desc' })
    );

    const typeButton = screen.getByRole('button', { name: /resource type/i });
    fireEvent.click(typeButton); // Click: change sortType = resourceType, reset order to asc
    expect(screen.getByTestId('debug-state')).toHaveTextContent(
      JSON.stringify({ searchString: '', sortType: 'resourceType', sortOrder: 'asc' })
    );
  });
});
