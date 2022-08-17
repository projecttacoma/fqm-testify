import { TextInput, TextInputProps } from '@mantine/core';
import { IconSearch } from '@tabler/icons';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (newValue: string) => void;
}

export default function SearchBar({searchQuery, setSearchQuery, ...textInputProps}: SearchBarProps & TextInputProps) {
  return (
    <TextInput
      icon={<IconSearch size={18} stroke={1.5} />}
      radius="xl"
      size="md"
      value={searchQuery}
      placeholder="Search the data elements"
      rightSectionWidth={42}
      onChange={event => setSearchQuery(event.currentTarget.value)}
      {...textInputProps}
    />
  );
}
