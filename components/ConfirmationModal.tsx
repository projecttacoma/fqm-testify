import { Modal, Button, Center, Group, Text } from '@mantine/core';
import { AlertTriangle } from 'tabler-icons-react';

export interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string | null;
}

export default function ConfirmationModal({ open = true, onClose, title, onConfirm }: ConfirmationModalProps) {
  return (
    <Modal data-testid="confirmation-modal" opened={open} onClose={onClose} withCloseButton={false} size="30%">
      <Center>
        <AlertTriangle color="red" />
        <Text size="sm" weight={700}>
          &nbsp;{title}
        </Text>
      </Center>
      <Center>
        <Group style={{ paddingTop: '12px' }}>
          <Button data-testid="yes-button" onClick={() => onConfirm()}>
            Yes
          </Button>
          <Button data-testid="cancel-button" color="gray" onClick={onClose}>
            Cancel
          </Button>
        </Group>
      </Center>
    </Modal>
  );
}
