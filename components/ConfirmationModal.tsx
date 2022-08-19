import { Modal, Button, Center, Group, Text, Grid } from '@mantine/core';

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
          <Text weight={700} align="center" lineClamp={2}>
            {title}
          </Text>
        </Grid.Col>
        <Grid.Col>
          <Center>
            <Group style={{ paddingTop: '5px' }}>
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
