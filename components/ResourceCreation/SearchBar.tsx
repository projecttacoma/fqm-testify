import { TextInput, TextInputProps } from '@mantine/core';
import { IconSearch } from '@tabler/icons';
import { useRecoilState } from 'recoil';
import { searchQueryState } from '../../state/atoms/searchQuery';

export default function SearchBar(props: TextInputProps) {
  //const theme = useMantineTheme();
  const [searchQuery, setSearchQuery] = useRecoilState(searchQueryState);

  return (
    <TextInput
      icon={<IconSearch size={18} stroke={1.5} />}
      radius="xl"
      size="md"
      value={searchQuery}
      placeholder="Search the data elements"
      rightSectionWidth={42}
      onChange={event => setSearchQuery(event.currentTarget.value)}
      {...props}
    />
  );
}
