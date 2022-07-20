import { Modal, Button, Center, Group, Grid, Text, Collapse, ScrollArea } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { Dropzone } from '@mantine/dropzone';
import { IconAlertCircle, IconCaretDown, IconCaretRight, IconFileCheck, IconFileImport } from '@tabler/icons';
import { useState } from 'react';
import JSZip from 'jszip';

export interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onImportSubmit: (files: File[]) => void;
}

export default function ImportModal({ open, onClose, onImportSubmit }: ImportModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [fileDisplay, setFileDisplay] = useState<string | string[] | null>(null);
  const [showZipFileExpansion, setShowZipFileExpansion] = useState(false);
  const [isZipInfoExpanded, setIsZipInfoExpanded] = useState(false);

  const closeAndReset = () => {
    setFiles([]);
    setFileDisplay(null);
    setIsZipInfoExpanded(false);
    setShowZipFileExpansion(false);
    onClose();
  };

  const handleDrop = (uploadedFiles: File[]) => {
    if (uploadedFiles.length === 1 && uploadedFiles[0].type === 'application/zip') {
      JSZip.loadAsync(uploadedFiles[0])
        .then(data => {
          return Promise.all(
            // Iterate through unzipped files and read their contents into a new JS File object
            // Required for passing the proper information back to the parent component
            Object.entries(data.files)
              .filter(f => f[1].dir !== true) // ignore root directory of .zip
              .map(async ([fname, finfo]) => {
                const blob = await finfo.async('blob');
                return new File([blob], fname);
              })
          );
        })
        .then(resolvedFiles => {
          setFileDisplay(`${uploadedFiles[0].name} containing ${resolvedFiles.length} Bundle(s)`);
          setFiles(resolvedFiles);
          setShowZipFileExpansion(true);
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
      setShowZipFileExpansion(false);
    } else {
      setFiles(uploadedFiles);
      setFileDisplay(uploadedFiles.map(f => f.name));
      setShowZipFileExpansion(false);
    }
  };

  const renderFileDisplay = () => {
    if (Array.isArray(fileDisplay)) {
      return (
        <div>
          {fileDisplay.map(fname => (
            <Text size={fileDisplay.length > 10 ? 'sm' : 'lg'} key={fname}>
              {fname}
            </Text>
          ))}
        </div>
      );
    } else if (fileDisplay != null) {
      return (
        <Text size="xl" inline>
          {fileDisplay}
        </Text>
      );
    }

    return (
      <Text size="xl" inline>
        Upload FHIR Bundle(s) or a .zip of FHIR Bundles
      </Text>
    );
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
                  <Center>{renderFileDisplay()}</Center>
                </Grid.Col>
              </Grid>
            )}
          </Dropzone>
          {showZipFileExpansion && (
            <>
              <Button
                variant="subtle"
                color="gray"
                onClick={() => setIsZipInfoExpanded(!isZipInfoExpanded)}
                fullWidth
                styles={{
                  inner: {
                    justifyContent: 'flex-start'
                  }
                }}
              >
                {isZipInfoExpanded ? <IconCaretDown /> : <IconCaretRight />}Show Contained Bundles
              </Button>
              <Collapse in={isZipInfoExpanded}>
                <ScrollArea style={{ height: 200 }}>
                  {files.map(f => {
                    const baseName = f.name.substring(f.name.lastIndexOf('/') + 1);
                    return (
                      <Text key={f.name} style={{ paddingLeft: '18px' }} color="gray" size="sm">
                        {baseName}
                      </Text>
                    );
                  })}
                </ScrollArea>
              </Collapse>
            </>
          )}
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
