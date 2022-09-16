import { createStyles } from '@mantine/core';
import { useRecoilValue } from 'recoil';
import parse from 'html-react-parser';
import { measureReportLookupState } from '../../state/atoms/measureReportLookup';

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
  const { classes } = useStyles();
  const measureReportLookup = useRecoilValue(measureReportLookupState);

  return (
    <>
      <div className={classes.highlightedMarkup}>{parse(measureReportLookup[patientId].text?.div || '')}</div>
    </>
  );
}
