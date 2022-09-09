import { Center, createStyles, Grid, Loader, Text } from '@mantine/core';
import { useRecoilValue } from 'recoil';
import parse from 'html-react-parser';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { getPatientNameString } from '../../util/fhir';
import { calculationLoading } from '../../state/atoms/calculationLoading';
import { AlignLeft, CircleCheck } from 'tabler-icons-react';

const useStyles = createStyles({
  highlightedMarkup: {
    '& pre': {
      whiteSpace: 'pre-wrap'
    }
  },
  panel: {
    maxHeight: '100%',
    overflow: 'scroll'
  }
});

export interface MeasureHighlightingPanelProps {
  patientId: string;
}

export default function MeasureHighlightingPanel({ patientId }: MeasureHighlightingPanelProps) {
  const currentPatients = useRecoilValue(patientTestCaseState);
  const { classes } = useStyles();
  const isCalculationLoading = useRecoilValue(calculationLoading);

  return (
    <>
      <Grid justify="space-between">
        <Grid.Col span={4}>Patient Calculation: {getPatientNameString(currentPatients[patientId].patient)}</Grid.Col>
        <Center style={{ paddingRight: 10, paddingTop: 10, right: 20, position: 'fixed' }}>
          {isCalculationLoading ? (
            <Center>
              <Loader size={40} />
              <Text color="dimmed">
                <i>Calculating...</i>
              </Text>
            </Center>
          ) : (
            <Center>
              <CircleCheck color="green" size={40} />
              <Text color="dimmed">
                <i>Up to date</i>
              </Text>
            </Center>
          )}
        </Center>
      </Grid>
      <div className={classes.highlightedMarkup}>
        {parse(currentPatients[patientId].measureReport?.text?.div || '')}
      </div>
    </>
  );
}
