import { Dropzone } from '@mantine/dropzone';
import { showNotification } from '@mantine/notifications';
import { Grid, Center, Text } from '@mantine/core';
import { IconFileImport, IconFileCheck, IconAlertCircle } from '@tabler/icons';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { measureBundleState } from '../state/atoms/measureBundle';

export default function MeasureUpload() {
  const setMeasureBundle = useSetRecoilState(measureBundleState);
  return (
    <Dropzone
      onDrop={files => setMeasureBundle(files[0])}
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
  const measureBundle = useRecoilValue<null | File>(measureBundleState);
  return (
    <Grid justify="center">
      <Grid.Col span={12}>
        <Center>{measureBundle ? <IconFileCheck size={80} /> : <IconFileImport size={80} />}</Center>
      </Grid.Col>
      <Grid.Col>
        <Center>
          <Text size="xl" inline>
            {measureBundle ? measureBundle.name : 'Drag a Measure Bundle JSON file here or click to select files'}
          </Text>
        </Center>
      </Grid.Col>
    </Grid>
  );
}
