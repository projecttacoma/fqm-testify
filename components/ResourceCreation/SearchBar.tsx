import { TextInput, TextInputProps, ActionIcon, useMantineTheme } from '@mantine/core';
import { IconSearch, IconArrowRight, IconArrowLeft } from '@tabler/icons';
import { useRecoilState } from 'recoil';
import {searchQueryState} from '../../state/atoms/searchQuery';

export default function SearchBar(props: TextInputProps) {
  const theme = useMantineTheme();
  // TODO: make this accessible in test resources display?
  const [searchQuery, setSearchQuery] = useRecoilState(searchQueryState);
  
  return (
    <TextInput
      icon={<IconSearch size={18} stroke={1.5} />}
      radius="xl"
      size="md"
      rightSection={
        <ActionIcon size={32} radius="xl" color={theme.primaryColor} variant="filled">
          {theme.dir === 'ltr' ? (
            <IconArrowRight size={18} stroke={1.5} />
          ) : (
            <IconArrowLeft size={18} stroke={1.5} />
          )}
        </ActionIcon>
      }
      value={searchQuery}
      placeholder="Search the data elements"
      rightSectionWidth={42}
      onChange={(event) => setSearchQuery(event.currentTarget.value)}
      {...props}
    />
  );
}