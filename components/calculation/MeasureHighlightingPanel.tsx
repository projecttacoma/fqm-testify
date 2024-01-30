import { ActionIcon, Autocomplete, ScrollArea, Space, Text, createStyles } from '@mantine/core';
import parse, { domToReact } from 'html-react-parser';
import { useState } from 'react';
import { Element as DomElement } from 'domhandler';
import { Search, X } from 'tabler-icons-react';
import PrettyOutput from './PrettyOutput';
import { DetailedPopulationGroupResult } from 'fqm-execution';

const useStyles = createStyles({
  highlightedMarkup: {
    '& pre': {
      whiteSpace: 'pre-wrap'
    }
  }
});

export interface MeasureHighlightingPanelProps {
  dr: DetailedPopulationGroupResult;
}

export default function MeasureHighlightingPanel({ dr }: MeasureHighlightingPanelProps) {
  const { classes } = useStyles();
  const [searchValue, setSearchValue] = useState('');

  const parsedHTML = parse(dr.html || '', {
    replace: elem => {
      if ((elem as DomElement).attribs?.['data-statement-name']) {
        const statementName = (elem as DomElement).attribs['data-statement-name'];
        const libraryName = (elem as DomElement).attribs['data-library-name'];
        const statementResult = dr.statementResults.find(
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

  return (
    <>
      <Space h="md" />
      <Autocomplete
        data={
          dr.statementResults
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
            .querySelector(
              `pre[data-statement-name="${item.value.split('"')[1]}"][data-library-name="${item.value.split('.')[0]}"]`
            )
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
