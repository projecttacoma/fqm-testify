import { ActionIcon, Group, useMantineColorScheme } from '@mantine/core';
import { MoonStars, Sun } from 'tabler-icons-react';

export default function AbacusHeader() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <Group sx={{ height: '100%' }} px={20} position="apart">
      <h2>FQM Testify: an ECQM Analysis Tool</h2>
      <ActionIcon variant="default" onClick={() => toggleColorScheme()} size={30}>
        {colorScheme === 'dark' ? <Sun size={16} /> : <MoonStars size={16} />}
      </ActionIcon>
    </Group>
  );
}