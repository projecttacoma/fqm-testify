import { Button, Center, Divider, Grid, Group, Menu, Paper, Text, Tooltip } from '@mantine/core';
import React from 'react';
import { Copy, Dots, Download, Edit, Trash } from 'tabler-icons-react';
import { getPatientDOBString, getPatientNameString } from '../../util/fhir/patient';
import PopulationMultiSelect from './PopulationMultiSelect';

export interface PatientInfoCardProps {
  patient: fhir4.Patient;
  onCopyClick: (...args: unknown[]) => void;
  onExportClick: (...args: unknown[]) => void;
  onEditClick: (...args: unknown[]) => void;
  onDeleteClick: (...args: unknown[]) => void;
  selected?: boolean;
  smallScreen?: boolean;
}

export default function PatientInfoCard({
  patient,
  onCopyClick,
  onExportClick,
  onEditClick,
  onDeleteClick,
  selected,
  smallScreen
}: PatientInfoCardProps) {
  return (
    <Paper
      shadow="sm"
      p="sm"
      withBorder
      sx={theme => {
        const primaryShade =
          typeof theme.primaryShade === 'number' ? theme.primaryShade : theme.primaryShade[theme.colorScheme];

        return {
          ':hover': {
            cursor: 'pointer',
            backgroundColor: theme.colors.gray[0]
          },
          ...(selected && {
            // https://github.com/mantinedev/mantine/discussions/4333#discussioncomment-6051153
            '&[data-with-border]': {
              borderColor: theme.colors[theme.primaryColor][primaryShade]
            }
          })
        };
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
            {smallScreen ? (
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <Button variant="subtle" aria-label={'Menu Button'}>
                    <Dots />
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Patient Actions</Menu.Label>
                  <Menu.Item
                    icon={<Download size={20} />}
                    onClick={() => {
                      onExportClick();
                    }}
                  >
                    Download Patient
                  </Menu.Item>
                  <Menu.Item
                    icon={<Edit size={20} />}
                    onClick={() => {
                      onEditClick();
                    }}
                  >
                    Edit Patient
                  </Menu.Item>
                  <Menu.Item
                    icon={<Copy size={20} />}
                    onClick={() => {
                      onCopyClick();
                    }}
                  >
                    Copy Patient
                  </Menu.Item>
                  <Menu.Item
                    icon={<Trash size={20} />}
                    color="red"
                    onClick={() => {
                      onDeleteClick();
                    }}
                  >
                    Delete Patient
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
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
            )}
          </Group>
        </Grid.Col>
      </Grid>
      {selected && <PopulationMultiSelect />}
    </Paper>
  );
}
