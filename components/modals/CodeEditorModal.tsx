import { Modal, useMantineColorScheme, Button, Center, Group, Text, Grid } from '@mantine/core';
import CodeMirror from '@uiw/react-codemirror';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { linter } from '@codemirror/lint';
import { useState } from 'react';

const jsonLinter = jsonParseLinter();

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
  const [linterError, setLinterError] = useState<string | null>(null);

  return (
    <Modal
      zIndex={2}
      data-testid="code-editor-modal"
      centered
      size="xl"
      withCloseButton={false}
      opened={open}
      onClose={onClose}
      overflow="outside"
      styles={{
        body: {
          height: '600px'
        }
      }}
      title={title}
    >
      <div style={{ overflow: 'scroll' }}>
        {open && (
          <CodeMirror
            data-testid="codemirror"
            height="500px"
            value={initialValue}
            extensions={[json(), linter(jsonLinter)]}
            theme={colorScheme}
            onUpdate={v => {
              const diagnosticMessages = jsonLinter(v.view).map(d => d.message);

              if (diagnosticMessages.length === 0) {
                setLinterError(null);
              } else {
                setLinterError(diagnosticMessages.join('\n'));
              }

              // Grabbing updates from the readonly editor state to avoid codemirror weirdness
              setCurrentValue(v.state.toJSON().doc);
            }}
          />
        )}
      </div>
      <Grid>
        <Grid.Col span={12}>
          <Text color="red">{linterError}&nbsp;</Text>
        </Grid.Col>
        <Grid.Col span={12}>
          <Center>
            <Group>
              <Button
                data-testid="codemirror-save-button"
                onClick={() => {
                  onSave(currentValue);
                }}
                disabled={linterError != null}
              >
                Save
              </Button>
              <Button data-testid="codemirror-cancel-button" variant="default" onClick={onClose}>
                Cancel
              </Button>
            </Group>
          </Center>
        </Grid.Col>
      </Grid>
    </Modal>
  );
}
