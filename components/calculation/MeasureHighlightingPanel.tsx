import { createStyles } from '@mantine/core';
import { useRecoilValue } from 'recoil';
import parse from 'html-react-parser';
import PopulationComparisonTable from './PopulationComparisonTable';
import { detailedResultLookupState } from '../../state/atoms/detailedResultLookup';

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
  const detailedResultLookup = useRecoilValue(detailedResultLookupState);

  return (
    <>
      <PopulationComparisonTable patientId={patientId} />
      <div className={classes.highlightedMarkup}>
        {parse(detailedResultLookup[patientId]?.detailedResults?.[0].html || '')}
      </div>
    </>
  );
}
