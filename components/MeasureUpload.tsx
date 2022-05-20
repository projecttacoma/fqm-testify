import { Dropzone } from '@mantine/dropzone';
import { showNotification } from '@mantine/notifications';
import { Grid, Center, Text } from '@mantine/core';
import { IconFileImport, IconFileCheck, IconAlertCircle } from '@tabler/icons';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { measureBundleState } from '../state/atoms/measureBundle';

export default function MeasureUpload() {
  const setMeasureBundle = useSetRecoilState(measureBundleState);
  // Need to nest this function so it has access to hooks
  function extractMeasureBundle(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      const bundle = JSON.parse(reader.result as string) as fhir4.Bundle;
      const numMeasures = bundle?.entry?.filter(r => r?.resource?.resourceType === 'Measure')?.length;
      if (bundle.resourceType !== 'Bundle') {
        rejectFile("Uploaded file must be a JSON FHIR Resource of type 'Bundle'");
      } else if (numMeasures !== 1) {
        rejectFile("Uploaded bundle must contain exactly one resource of type 'Measure'");
      } else {
        setMeasureBundle({
          name: file.name,
          content: bundle
        });
      }
    };
    reader.readAsText(file);
  }

  function rejectFile(message: string) {
    showNotification({
      id: 'failed-upload',
      icon: <IconAlertCircle />,
      title: 'File upload failed',
      message,
      color: 'red'
    });
    setMeasureBundle({
      name: '',
      content: null
    });
  }
  return (
    <Dropzone
      onDrop={files => extractMeasureBundle(files[0])}
      onReject={files =>
        showNotification({
          id: 'failed-upload',
          icon: <IconAlertCircle />,
          title: 'File upload failed',
          message: `Could not upload file: ${files[0].file.name}. ${files[0].errors[0].message}`,
          color: 'red'
        })
      }
      accept={['.json']}
      multiple={false}
    >
      {DropzoneChildren}
    </Dropzone>
  );
}

function DropzoneChildren() {
  const measureBundle = useRecoilValue(measureBundleState);
  return (
    <Grid justify="center">
      <Grid.Col span={12}>
        <Center>{measureBundle.name ? <IconFileCheck size={80} /> : <IconFileImport size={80} />}</Center>
      </Grid.Col>
      <Grid.Col>
        <Center>
          <Text size="xl" inline>
            {measureBundle.name ? measureBundle.name : 'Drag a Measure Bundle JSON file here or click to select files'}
          </Text>
        </Center>
      </Grid.Col>
    </Grid>
  );
}
