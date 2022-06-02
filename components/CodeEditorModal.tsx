import { Modal, useMantineColorScheme, Button, Center, Group } from '@mantine/core';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { useState } from 'react';

export interface CodeEditorModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  title?: string;
  initialValue?: string;
}

export default function CodeEditorModal({
  open = true,
  onClose,
  title,
  onSave,
  initialValue = ''
}: CodeEditorModalProps) {
  const { colorScheme } = useMantineColorScheme();
  const [currentValue, setCurrentValue] = useState(initialValue);

  return (
    <Modal
      data-testid="code-editor-modal"
      centered
      size="xl"
      withCloseButton={false}
      opened={open}
      onClose={onClose}
      overflow="outside"
      styles={{
        body: {
          height: '50vh'
        }
      }}
      title={title}
    >
      <div style={{ height: '90%', overflow: 'scroll' }}>
        {open && (
          <CodeMirror
            data-testid="codemirror"
            value={initialValue}
            extensions={[json()]}
            theme={colorScheme}
            onUpdate={v => setCurrentValue(v.state.toJSON().doc)} // Grabbing updates from the readonly editor state to avoid codemirror weirdness
          />
        )}
      </div>
      <Center>
        <Group>
          <Button
            onClick={() => {
              onSave(currentValue);
              onClose();
            }}
          >
            Save
          </Button>
          <Button color="gray" onClick={onClose}>
            Cancel
          </Button>
        </Group>
      </Center>
    </Modal>
  );
}
