import { ActionIcon, Autocomplete, ScrollArea, Space, Text, createStyles } from '@mantine/core';
import { useRecoilValue } from 'recoil';
import parse, { domToReact } from 'html-react-parser';
import { detailedResultLookupState } from '../../state/atoms/detailedResultLookup';
import { useMemo, useState } from 'react';
import { Element as DomElement } from 'domhandler';
import { Search, X } from 'tabler-icons-react';
import PrettyOutput from './PrettyOutput';

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
  const parsedHTML = useMemo(() => {
    const parsedHTML = parse(detailedResultLookup[patientId]?.detailedResults?.[0].html || '', {
      replace: elem => {
        if ((elem as DomElement).attribs?.['data-statement-name']) {
          const statementName = (elem as DomElement).attribs?.['data-statement-name'];
          const libraryName = (elem as DomElement).attribs?.['data-library-name'];
          const statementResult = detailedResultLookup[patientId]?.detailedResults?.[0].statementResults.find(
            statement => statement.statementName === statementName && statement.libraryName === libraryName
          );
          return (
            <>
              {domToReact([elem])}
              <PrettyOutput statement={statementResult} />
            </>
          );
        }
      }
    });
    return parsedHTML;
  }, [detailedResultLookup, patientId]);

  return (
    <>
      <Space h="md" />
      <Autocomplete
        data={
          detailedResultLookup[patientId]?.detailedResults?.[0].statementResults
            .filter(statementResult => statementResult.relevance !== 'NA')
            .map(s => `${s.libraryName}."${s.statementName}"`) || ['']
        }
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
          document
            .querySelector(`[data-statement-name="${item.value.split('"')[1]}"`)
            ?.scrollIntoView({ behavior: 'smooth' });
        }}
        rightSection={
          <ActionIcon
            onClick={() => {
              setSearchValue('');
            }}
          >
            <X size={16} />
          </ActionIcon>
        }
      />
      <div className={classes.highlightedMarkup}>{parsedHTML}</div>
    </>
  );
}
