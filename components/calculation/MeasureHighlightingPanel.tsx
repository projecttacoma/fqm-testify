import { createStyles } from '@mantine/core';
import { useRecoilValue } from 'recoil';
import parse from 'html-react-parser';
import PopulationComparisonTable from './PopulationComparisonTable';
import { detailedResultLookupState } from '../../state/atoms/detailedResultLookup';
import { useMemo } from 'react';
import { Text } from 'domhandler';

/**
 * This regex matches any string that includes the substring "define" or "define function"
 * followed by a string of any length in quotes
 */
const expressionDefRegex = new RegExp(/(define(?:\s+function)?\s+)(["'])(.*?)\2/gi);

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
  const { parsedHTML, defIds } = useMemo(() => {
    const defIds: Record<string, string> = {};
    const parsedHTML = parse(detailedResultLookup[patientId]?.detailedResults?.[0].html || '', {
      replace: elem => {
        if (elem.type === 'text') {
          const data = (elem as Text).data;
          if (data.match(expressionDefRegex)) {
            const splitData = data.split('"');
            defIds[splitData[1]] = splitData[1].toLowerCase().replace(' ', '-');
            return <span id={defIds[splitData[1]]}>{data}</span>;
          }
        }
      }
    });
    return { parsedHTML, defIds };
  }, [detailedResultLookup, patientId]);

  return (
    <>
      <PopulationComparisonTable patientId={patientId} defIds={defIds} />
      <div className={classes.highlightedMarkup}>{parsedHTML}</div>
    </>
  );
}
