import { Button, Grid, Paper, Text, Tooltip } from '@mantine/core';
import React from 'react';
import { Edit, Trash } from 'tabler-icons-react';
export interface DateInfo {
  date: string;
  dateType: string;
}
export interface ResourceInfoCardProps {
  resourceType: string;
  label: string;
  date: DateInfo;
  onEditClick: (...args: unknown[]) => void;
  onDeleteClick: (...args: unknown[]) => void;
}

export default function ResourceInfoCard({
  resourceType,
  label,
  date,
  onEditClick,
  onDeleteClick
}: ResourceInfoCardProps) {
  return (
    <Paper withBorder p="sm" shadow="sm">
      <Grid align="center">
        <Grid.Col span={9}>
          <Text>{resourceType}</Text>
          <Text color="gray" size="xs">
            <Tooltip
              arrowPosition="side"
              arrowOffset={25}
              arrowSize={8}
              label={date.dateType}
              withArrow
              position="top-start"
            >
              <Text>{date.date}</Text>
            </Tooltip>
          </Text>
          <Tooltip
            multiline
            width={500}
            withArrow
            transitionProps={{
              transition: 'fade',
              duration: 200
            }}
            label={<Text align="center">{label}</Text>}
            disabled={label === ''}
          >
            <Text lineClamp={2} color="dimmed">
              {label}
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
              aria-label="Edit Resource"
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
              aria-label="Delete Resource"
            >
              <Trash />
            </Button>
          </Tooltip>
        </Grid.Col>
      </Grid>
    </Paper>
  );
}
