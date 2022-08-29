import { Button, Center, Divider, Grid, Paper, Sx, Text, Tooltip } from '@mantine/core';
import React, { MouseEvent } from 'react';
import { Download, Edit, Trash } from 'tabler-icons-react';
import { getPatientDOBString, getPatientNameString } from '../util/fhir';

export interface PatientInfoCardProps {
  patient: fhir4.Patient;
  onExportClick: (...args: unknown[]) => void;
  onEditClick: (...args: unknown[]) => void;
  // TODO (MATT): Fix delete
  onDeleteClick: (...args: unknown[]) => void;
  selected?: boolean;
}

export default function PatientInfoCard({
  patient,
  onExportClick,
  onEditClick,
  onDeleteClick,
  selected
}: PatientInfoCardProps) {
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
          style.borderColor = theme.primaryColor;
        }
        return style;
      }}
    >
      <Grid justify="center" align="center">
        <Grid.Col span={5}>
          <div>
            <Text size="sm">{getPatientNameString(patient)}</Text>
            <Text size="xs" color="dimmed">
              {getPatientDOBString(patient)}
            </Text>
          </div>
        </Grid.Col>
        <Grid.Col span={5} offset={2} style={{ paddingRight: 0 }}>
          <Center>
            <Tooltip label="Export Patient" openDelay={1000}>
              <Button
                size="xs"
                data-testid="export-patient-button"
                aria-label={'Export Patient'}
                onClick={(e: MouseEvent) => {
                  e.stopPropagation();
                  onExportClick();
                }}
                variant="subtle"
              >
                <Download />
              </Button>
            </Tooltip>
            <Tooltip label="Edit Patient" openDelay={1000}>
              <Button
                data-testid="edit-patient-button"
                aria-label={'Edit Patient'}
                onClick={(e: MouseEvent) => {
                  e.stopPropagation();
                  onEditClick();
                }}
                variant="subtle"
                size="xs"
              >
                <Edit />
              </Button>
            </Tooltip>
            <Divider sx={{ height: '48px' }} size="xs" orientation="vertical" />
            <Tooltip label="Delete Patient" openDelay={1000}>
              <Button
                size="xs"
                data-testid="delete-patient-button"
                aria-label={'Delete Patient'}
                onClick={(e: MouseEvent) => {
                  e.stopPropagation();
                  onDeleteClick();
                }}
                color="red"
                variant="subtle"
              >
                <Trash />
              </Button>
            </Tooltip>
          </Center>
        </Grid.Col>
      </Grid>
    </Paper>
  );
}
