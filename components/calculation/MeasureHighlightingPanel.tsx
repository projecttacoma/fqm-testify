import { createStyles } from '@mantine/core';
import { useRecoilValue } from 'recoil';
import parse from 'html-react-parser';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';

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

  return (
    <>
      <div className={classes.highlightedMarkup}>
        {parse(currentPatients[patientId].measureReport?.text?.div || '')}
      </div>
    </>
  );
}
