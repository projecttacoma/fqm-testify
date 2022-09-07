import { createStyles, Grid } from '@mantine/core';
import { useRecoilState } from 'recoil';
import parse from 'html-react-parser';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { getPatientNameString } from '../../util/fhir';

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
  const [currentPatients] = useRecoilState(patientTestCaseState);
  const { classes } = useStyles();

  return (
    <>
      <Grid>
        <Grid.Col span={4}>Patient Calculation: {getPatientNameString(currentPatients[patientId].patient)}</Grid.Col>
        <Grid.Col span={3} offset={5}></Grid.Col>
      </Grid>
      <div className={classes.highlightedMarkup}>
        {parse(currentPatients[patientId].measureReport?.text?.div || '')}
      </div>
    </>
  );
}
