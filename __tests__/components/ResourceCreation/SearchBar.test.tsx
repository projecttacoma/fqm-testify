import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchBar, { SearchBarProps } from '../../../components/ResourceCreation/SearchBar';

describe('SearchBar', () => {
  const testSearchBarProps: SearchBarProps = {
    searchQuery: '',
    setSearchQuery: jest.fn()
  };

  it('renders with placeholder text', () => {
    render(<SearchBar {...testSearchBarProps} />);
    const placeholder = screen.queryByPlaceholderText(/search the data elements/i);
    expect(placeholder).toBeInTheDocument();
  });
});
