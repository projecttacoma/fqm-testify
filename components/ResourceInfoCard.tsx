import { Button, Grid, Paper, Text, Tooltip } from '@mantine/core';
import React from 'react';
import { Edit, Trash } from 'tabler-icons-react';
import { getFhirResourceSummary } from '../util/fhir';

export interface ResourceInfoCardProps {
  resource: fhir4.FhirResource;
  onEditClick: (...args: unknown[]) => void;
  // TODO (MATT): Fix delete
  onDeleteClick: (...args: unknown[]) => void;
}

export default function ResourceInfoCard({ resource, onEditClick, onDeleteClick }: ResourceInfoCardProps) {
  return (
    <Paper withBorder p="sm" shadow="sm">
      <Grid align="center">
        <Grid.Col span={9}>
          <Tooltip
            wrapLines
            width={500}
            withArrow
            transition="fade"
            transitionDuration={200}
            label={<Text align="center">{getFhirResourceSummary(resource)} </Text>}
            disabled={getFhirResourceSummary(resource) === ''}
          >
            <Text>{resource.resourceType}</Text>
            <Text lineClamp={2} color="dimmed">
              {getFhirResourceSummary(resource)}
            </Text>
          </Tooltip>
        </Grid.Col>
        <Grid.Col span={3}>
          <Tooltip label="Edit FHIR Resource" openDelay={1000}>
            <Button
              onClick={() => {
                onEditClick();
              }}
              variant="subtle"
              data-testid="edit-resource-button"
            >
              <Edit />
            </Button>
          </Tooltip>
          <Tooltip label="Delete FHIR Resource" openDelay={1000}>
            <Button
              onClick={() => {
                onDeleteClick();
              }}
              color="red"
              variant="subtle"
              data-testid="delete-resource-button"
            >
              <Trash />
            </Button>
          </Tooltip>
        </Grid.Col>
      </Grid>
    </Paper>
  );
}
