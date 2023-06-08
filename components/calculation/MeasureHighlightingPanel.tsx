import { Autocomplete, ScrollArea, Space, Text, createStyles } from '@mantine/core';
import { useRecoilValue } from 'recoil';
import parse from 'html-react-parser';
import { detailedResultLookupState } from '../../state/atoms/detailedResultLookup';
import { useMemo, useState } from 'react';
import { Text as DomText } from 'domhandler';
import { Search } from 'tabler-icons-react';

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
  const [searchValue, setSearchValue] = useState('');
  const detailedResultLookup = useRecoilValue(detailedResultLookupState);
  const { parsedHTML, defIds } = useMemo(() => {
    const defIds: Record<string, string> = {};
    const parsedHTML = parse(detailedResultLookup[patientId]?.detailedResults?.[0].html || '', {
      replace: elem => {
        if (elem.type === 'text') {
          const data = (elem as DomText).data;
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
      <Space h="md" />
      <Autocomplete
        data={Object.keys(defIds).sort((a, b) => (a < b ? -1 : 1))}
        value={searchValue}
        onChange={setSearchValue}
        dropdownComponent={ScrollArea}
        maxDropdownHeight={200}
        placeholder="Expression Name"
        icon={<Search />}
        nothingFound={
          <Text align="left" pl={10}>
            No Matches
          </Text>
        }
        limit={100}
        label="Search CQL Expression Definition"
        onItemSubmit={item => {
          document.getElementById(defIds[item.value])?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
      <div className={classes.highlightedMarkup}>{parsedHTML}</div>
    </>
  );
}
