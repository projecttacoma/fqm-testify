import { Dropzone } from '@mantine/dropzone';
import { showNotification } from '@mantine/notifications';
import { Grid, Center, Text, Stack, createStyles } from '@mantine/core';
import { IconFileImport, IconFileCheck, IconAlertCircle, IconCircleCheck } from '@tabler/icons';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { measurementPeriodState } from '../../state/atoms/measurementPeriod';
import { MeasureUploadProps, identifyMissingValueSets, populateMeasurementPeriod } from '../../util/MeasureUploadUtils';

const useStyles = createStyles({
  text: {
    wordBreak: 'break-all'
  }
});

export default function MeasureFileUpload({ logError }: MeasureUploadProps) {
  const setMeasureBundle = useSetRecoilState(measureBundleState);
  const setMeasurementPeriod = useSetRecoilState(measurementPeriodState);

  const extractMeasureBundle = (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const bundle = JSON.parse(reader.result as string) as fhir4.Bundle;
      const measures = bundle.entry?.filter(r => r?.resource?.resourceType === 'Measure');
      if (bundle.resourceType !== 'Bundle') {
        rejectFile("Uploaded file must be a JSON FHIR Resource of type 'Bundle'", file.name);
        return;
      } else if (!measures || measures.length !== 1) {
        rejectFile("Uploaded bundle must contain exactly one resource of type 'Measure'", file.name);
        return;
      }

      const missingValueSets = await identifyMissingValueSets(bundle);
      if (missingValueSets.length > 0) {
        rejectFile(missingValueSets, file.name, true);
        return;
      }

      setMeasureBundle(mb => ({
        ...mb,
        fileName: file.name,
        content: bundle,
        isFile: true,
        selectedMeasureId: null,
        displayMap: {}
      }));

      // Safe to cast measures as error will be set if undefined above
      const effectivePeriod = ((measures as fhir4.BundleEntry[])[0].resource as fhir4.Measure).effectivePeriod;

      // Set measurement period to default period
      const measurementPeriod = populateMeasurementPeriod(effectivePeriod?.start, effectivePeriod?.end);
      setMeasurementPeriod(measurementPeriod);

      showNotification({
        icon: <IconCircleCheck />,
        title: 'Upload Success',
        message: `Successfully uploaded ${file.name}`,
        color: 'green'
      });
    };
    reader.readAsText(file);
  };

  const rejectFile = (message: string | string[], fileName: string, isValueSetMissingError = false) => {
    logError({
      id: uuidv4(),
      message,
      timestamp: new Date().toISOString(),
      attemptedBundleDisplay: fileName,
      isValueSetMissingError
    });
    showNotification({
      icon: <IconAlertCircle />,
      title: 'File upload failed',
      message: 'There was an issue with your file. Please correct the issues listed below.',
      color: 'red'
    });
  };

  return (
    <>
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
        accept={['application/json']}
        multiple={false}
        style={{ minHeight: 200 }}
      >
        <DropzoneChildren />
      </Dropzone>
    </>
  );
}

function DropzoneChildren() {
  const measureBundle = useRecoilValue(measureBundleState);
  const { classes } = useStyles();

  return (
    <Grid justify="center" align="center" style={{ minHeight: 200 }}>
      <Stack>
        <Center>
          {measureBundle.fileName && measureBundle.isFile ? <IconFileCheck size={80} /> : <IconFileImport size={80} />}
        </Center>
        <Center>
          <Text size="xl" inline className={classes.text}>
            {measureBundle.fileName && measureBundle.isFile
              ? measureBundle.fileName
              : 'Drag a Measure Bundle JSON file here or click to select files'}
          </Text>
        </Center>
      </Stack>
    </Grid>
  );
}
