import { Modal, useMantineColorScheme, Button, Center, Group, Text, Grid } from '@mantine/core';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { useState } from 'react';
import { initial } from 'lodash';

export interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  title?: string;
  initialValue?: string;
}

export default function ConfirmationModal({
  open = true,
  onClose,
  title,
  onSave,
  initialValue = ''
}: ConfirmationModalProps) {
  return (
    <Modal data-testid="confirmation-modal" opened={open} onClose={onClose} title={title}>
      Hello
    </Modal>
  );
}
