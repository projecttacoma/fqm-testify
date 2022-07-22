import { Modal, Button, Center, Group, Text, Grid } from '@mantine/core';
import { AlertTriangle } from 'tabler-icons-react';

export interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string | null;
}

export default function ConfirmationModal({ open = true, onClose, title, onConfirm }: ConfirmationModalProps) {
  return (
    <Modal
      data-testid="confirmation-modal"
      zIndex={2}
      overflow="outside"
      opened={open}
      onClose={onClose}
      withCloseButton={false}
      size="lg"
    >
      <Grid align="center" justify="center">
        <Grid.Col>
          <Center>
            <AlertTriangle color="red" size={35} />
            <Text size="sm" weight={700} align="center">
              &nbsp;{title}
            </Text>
          </Center>
        </Grid.Col>
        <Grid.Col>
          <Center>
            <Group style={{ paddingTop: '5px' }}>
              <Button data-testid="yes-button" onClick={() => onConfirm()}>
                Yes
              </Button>
              <Button data-testid="cancel-button" color="gray" onClick={onClose}>
                Cancel
              </Button>
            </Group>
          </Center>
        </Grid.Col>
      </Grid>
    </Modal>
  );
}
