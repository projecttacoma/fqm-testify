import { ActionIcon, Autocomplete, ScrollArea, Space, Text, createStyles } from '@mantine/core';
import parse from 'html-react-parser';
import { useMemo, useState } from 'react';
import { Search, X } from 'tabler-icons-react';
import PrettyOutput from './PrettyOutput';
import { DetailedPopulationGroupResult, Relevance } from 'fqm-execution';
import { useRecoilValue } from 'recoil';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { sortStatements } from '../../util/MeasurePopulations';

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
  const measureBundle = useRecoilValue(measureBundleState);
  const measure = useMemo(() => {
    return measureBundle.content?.entry?.find(e => e.resource?.resourceType === 'Measure')?.resource as fhir4.Measure;
  }, [measureBundle]);

  const parsedHTML = () => {
    const relevantStatements = dr.statementResults.filter(s => s.relevance !== Relevance.NA);
    sortStatements(measure, dr.groupId, relevantStatements);
    return relevantStatements.map(sr => {
      if (sr.statementLevelHTML) {
        return (
          <>
            {parse(sr.statementLevelHTML)}
            <PrettyOutput statement={sr} />
          </>
        );
      }
    });
  };

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
      <div className={classes.highlightedMarkup}>
        <h2>Population Group: {dr.groupId}</h2>
        {parsedHTML()}
      </div>
    </>
  );
}
