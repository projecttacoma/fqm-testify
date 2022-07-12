import { Modal, Button, Center, Group, Grid, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { Dropzone } from '@mantine/dropzone';
import { IconAlertCircle, IconFileCheck, IconFileImport } from '@tabler/icons';
import { useState } from 'react';
import zip from 'jszip';

export interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onImportSubmit: (files: File[]) => void;
}

export default function ImportModal({ open, onClose, onImportSubmit }: ImportModalProps) {
  const [files, setFiles] = useState<File[]>([]);

  const closeAndReset = () => {
    setFiles([]);
    onClose();
  };

  const handleDrop = (uploadedFiles: File[]) => {
    if (uploadedFiles.length === 1 && uploadedFiles[0].type === 'application/zip') {
      zip
        .loadAsync(uploadedFiles[0])
        .then(data => {
          return Promise.all(
            // Iterate through unzipped files and read their contents into a new JS File object
            // Required for passing the proper information back to the parent component
            Object.entries(data.files).map(async ([fname, finfo]) => {
              const blob = await finfo.async('blob');
              return new File([blob], fname);
            })
          );
        })
        .then(resolvedFiles => {
          setFiles(resolvedFiles);
        });
    } else if (uploadedFiles.length > 1 && uploadedFiles.some(f => f.type === 'application/zip')) {
      // If we reach this else case, the user must have uploaded multiple files where at least one of them is a zip
      // treat this as an error
      showNotification({
        id: 'invalid-zip-upload',
        icon: <IconAlertCircle />,
        title: 'Invalid Zip Upload',
        message: 'Please only upload one or more JSON files or only one zip file',
        color: 'red'
      });
    } else {
      setFiles(uploadedFiles);
    }
  };

  return (
    <Modal
      zIndex={2}
      centered
      size="xl"
      withCloseButton={true}
      opened={open}
      onClose={closeAndReset}
      overflow="outside"
      title="Import Test Case(s)"
    >
      <Grid>
        <Grid.Col span={12}>
          <Dropzone data-testid="import-dropzone" onDrop={handleDrop} accept={['.json', '.zip']} multiple={true}>
            {() => (
              <Grid justify="center">
                <Grid.Col span={12}>
                  <Center>{files.length === 0 ? <IconFileImport size={80} /> : <IconFileCheck size={80} />}</Center>
                </Grid.Col>
                <Grid.Col>
                  <Center>
                    <Text size="xl" inline>
                      {files.length === 0
                        ? 'Upload FHIR Bundle(s) or a .zip of FHIR Bundles'
                        : files.map(f => f.name).join(', ')}
                    </Text>
                  </Center>
                </Grid.Col>
              </Grid>
            )}
          </Dropzone>
          <Center>
            <Group
              style={{
                paddingTop: '12px'
              }}
            >
              <Button
                onClick={() => {
                  onImportSubmit(files);
                  closeAndReset();
                }}
                disabled={files.length === 0}
              >
                Import
              </Button>
              <Button color="gray" onClick={closeAndReset}>
                Cancel
              </Button>
            </Group>
          </Center>
        </Grid.Col>
      </Grid>
    </Modal>
  );
}
