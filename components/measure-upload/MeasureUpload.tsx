import { Dropzone } from '@mantine/dropzone';
import { showNotification } from '@mantine/notifications';
import { Grid, Center, Text, Stack, createStyles } from '@mantine/core';
import { IconFileImport, IconFileCheck, IconAlertCircle } from '@tabler/icons';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { measureBundleState } from '../../state/atoms/measureBundle';
import MissingValueSetModal from '../modals/MissingValueSetModal';
import { measurementPeriodState } from '../../state/atoms/measurementPeriod';
import { DateTime } from 'luxon';

const useStyles = createStyles({
  text: {
    wordBreak: 'break-all'
  }
});

export const DEFAULT_MEASUREMENT_PERIOD = {
  start: DateTime.fromISO('2022-01-01').toJSDate(),
  end: DateTime.fromISO('2022-12-31').toJSDate()
};

const DEFAULT_MEASUREMENT_PERIOD_DURATION = 1;

export default function MeasureUpload() {
  const setMeasureBundle = useSetRecoilState(measureBundleState);
  const setMeasurementPeriod = useSetRecoilState(measurementPeriodState);
  // Need to nest this function so it has access to hooks
  function extractMeasureBundle(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      const bundle = JSON.parse(reader.result as string) as fhir4.Bundle;
      const measures = bundle?.entry?.filter(r => r?.resource?.resourceType === 'Measure');
      if (bundle.resourceType !== 'Bundle') {
        rejectFile("Uploaded file must be a JSON FHIR Resource of type 'Bundle'");
      } else if (measures?.length !== 1) {
        rejectFile("Uploaded bundle must contain exactly one resource of type 'Measure'");
      } else {
        setMeasureBundle({
          name: file.name,
          content: bundle
        });
        const effectivePeriod = (measures[0].resource as fhir4.Measure).effectivePeriod;

        // Set measurement period to default period
        const measurementPeriod = populateMeasurementPeriod(effectivePeriod?.start, effectivePeriod?.end);
        setMeasurementPeriod(measurementPeriod);
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
    <>
      <MissingValueSetModal />
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
        <Center>{measureBundle.name ? <IconFileCheck size={80} /> : <IconFileImport size={80} />}</Center>
        <Center>
          <Text size="xl" inline className={classes.text}>
            {measureBundle.name ? measureBundle.name : 'Drag a Measure Bundle JSON file here or click to select files'}
          </Text>
        </Center>
      </Stack>
    </Grid>
  );
}

/**
 * Takes in two date strings and populates a valid measurement period with JS Dates
 * as start and end points
 * @param startString{String} Signifies the date of measurement period start
 * @param endString{String} Signifies the date of measurement period end
 * @returns {Object} an object a JS Date from period start and end
 */
export function populateMeasurementPeriod(
  startString: string | undefined,
  endString: string | undefined
): { start: Date; end: Date } {
  const measurementPeriod = { ...DEFAULT_MEASUREMENT_PERIOD };

  if (startString) {
    const startDate = DateTime.fromISO(startString).toJSDate();
    measurementPeriod.start = startDate;
    // Measurement period start and end are both defined
    if (endString) {
      measurementPeriod.end = DateTime.fromISO(endString).toJSDate();
      // If start is defined and end isn't, make the period last one year from the start
    } else {
      const newEnd = new Date(startDate);
      newEnd.setFullYear(startDate.getFullYear() + DEFAULT_MEASUREMENT_PERIOD_DURATION);
      measurementPeriod.end = newEnd;
    }

    // If end is defined and start isn't, make the period start one year from the end
  } else if (endString) {
    const endDate = DateTime.fromISO(endString).toJSDate();
    measurementPeriod.end = endDate;
    const newStart = new Date(endDate);
    newStart.setFullYear(endDate.getFullYear() - DEFAULT_MEASUREMENT_PERIOD_DURATION);
    measurementPeriod.start = newStart;
  }
  return measurementPeriod;
}
