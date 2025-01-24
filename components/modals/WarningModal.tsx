import { Modal, Button, Center, Group, Text, Grid, Space } from '@mantine/core';
import { AlertTriangle } from 'tabler-icons-react';

export interface WarningModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string | null;
}

export default function WarningModal({ open = true, onClose, onConfirm }: WarningModalProps) {
  return (
    <Modal data-testid="confirmation-modal" opened={open} onClose={onClose} withCloseButton={false} size="lg">
      <Grid align="center" justify="center">
        <Grid.Col>
          <Center>
            <AlertTriangle color="red" size={35} />
          </Center>
          <Space></Space>
          <Center>
            <Text align="center">
              At least one of the included Test Cases was uploaded with the minimize resources option set to true. This
              means that only resources relevant to this Measure Bundle were included. Do you still wish to edit this
              Measure Bundle?
            </Text>
          </Center>
        </Grid.Col>
        <Grid.Col>
          <Center>
            <Group pt={8}>
              <Button data-testid="yes-button" onClick={() => onConfirm()}>
                Yes
              </Button>
              <Button data-testid="cancel-button" variant="default" onClick={onClose}>
                Cancel
              </Button>
            </Group>
          </Center>
        </Grid.Col>
      </Grid>
    </Modal>
  );
}
