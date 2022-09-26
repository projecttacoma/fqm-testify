import { Button, Center, Divider, Grid, Group, Menu, Paper, Sx, Text, Tooltip } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import React from 'react';
import { Copy, Dots, Download, Edit, Trash } from 'tabler-icons-react';
import { getPatientDOBString, getPatientNameString } from '../../util/fhir';
import PopulationMultiSelect from './PopulationMultiSelect';

export interface PatientInfoCardProps {
  patient: fhir4.Patient;
  onCopyClick: (...args: unknown[]) => void;
  onExportClick: (...args: unknown[]) => void;
  onEditClick: (...args: unknown[]) => void;
  onDeleteClick: (...args: unknown[]) => void;
  selected?: boolean;
}

export default function PatientInfoCard({
  patient,
  onCopyClick,
  onExportClick,
  onEditClick,
  onDeleteClick,
  selected
}: PatientInfoCardProps) {
  const matches = useMediaQuery('(min-width: 1600px)');
  return (
    <Paper
      shadow="sm"
      p="sm"
      withBorder
      sx={theme => {
        const style: Sx = {
          ':hover': {
            cursor: 'pointer',
            backgroundColor: theme.colors.gray[0]
          }
        };
        if (selected) {
          // Use the configured primary color that the app already uses
          const shade =
            typeof theme.primaryShade === 'number' ? theme.primaryShade : theme.primaryShade[theme.colorScheme];

          style.borderColor = theme.colors[theme.primaryColor][shade];
        }
        return style;
      }}
    >
      <Grid align="center">
        <Grid.Col span={6}>
          <div>
            <Text size="sm">{getPatientNameString(patient)}</Text>
            <Text size="xs" color="dimmed">
              {getPatientDOBString(patient)}
            </Text>
          </div>
        </Grid.Col>
        <Grid.Col span={6}>
          <Group position="right">
            {matches ? (
              <Center>
                <Tooltip label="Export Patient" openDelay={1000}>
                  <Button
                    size="xs"
                    aria-label={'Export Patient'}
                    onClick={() => {
                      onExportClick();
                    }}
                    variant="subtle"
                  >
                    <Download />
                  </Button>
                </Tooltip>
                <Tooltip label="Edit Patient" openDelay={1000}>
                  <Button
                    aria-label={'Edit Patient'}
                    onClick={() => {
                      onEditClick();
                    }}
                    variant="subtle"
                    size="xs"
                  >
                    <Edit />
                  </Button>
                </Tooltip>
                <Tooltip label="Copy Patient" openDelay={1000}>
                  <Button
                    size="xs"
                    aria-label={'Copy Patient'}
                    onClick={() => {
                      onCopyClick();
                    }}
                    variant="subtle"
                  >
                    <Copy />
                  </Button>
                </Tooltip>
                <Divider sx={{ height: '48px' }} size="xs" orientation="vertical" />
                <Tooltip label="Delete Patient" openDelay={1000}>
                  <Button
                    size="xs"
                    aria-label={'Delete Patient'}
                    onClick={() => {
                      onDeleteClick();
                    }}
                    color="red"
                    variant="subtle"
                  >
                    <Trash />
                  </Button>
                </Tooltip>
              </Center>
            ) : (
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <Button variant="subtle">
                    <Dots />
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Patient Actions</Menu.Label>
                  <Menu.Item
                    icon={<Download size={14} />}
                    onClick={() => {
                      onExportClick();
                    }}
                  >
                    Download Patient
                  </Menu.Item>
                  <Menu.Item
                    icon={<Edit size={14} />}
                    onClick={() => {
                      onEditClick();
                    }}
                  >
                    Edit Patient
                  </Menu.Item>
                  <Menu.Item
                    icon={<Copy size={14} />}
                    onClick={() => {
                      onCopyClick();
                    }}
                  >
                    Copy Patient
                  </Menu.Item>
                  <Menu.Item
                    icon={<Trash size={14} />}
                    onClick={() => {
                      onDeleteClick();
                    }}
                  >
                    Delete Patient
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>
        </Grid.Col>
      </Grid>
      {selected && <PopulationMultiSelect />}
    </Paper>
  );
}
