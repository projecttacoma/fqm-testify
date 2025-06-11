import { Badge, createStyles, Table } from '@mantine/core';
import { useMemo } from 'react';
import { DetailedResult } from '../../util/types';
import { useRecoilValue } from 'recoil';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { IconCheck, IconX } from '@tabler/icons';

const useStyles = createStyles({
  highlightRed: {
    backgroundColor: '#edd8d0',
    color: '#a63b12',
    borderBottomColor: '#a63b12',
    borderBottomStyle: 'double'
  },
  highlightGreen: {
    backgroundColor: '#ccebe0',
    color: '#20744c',
    borderBottomColor: '#20744c',
    borderBottomStyle: 'solid'
  }
});

export type PopulationResultViewerProps = {
  results: LabeledDetailedResult[];
};

export type LabeledDetailedResult = {
  label: string;
  detailedResult: DetailedResult;
};

// Mapping of population key to a value and boolean expressing whether the value matches expected
// intersected with a label value (patient name) and boolean used to express whether all values match
export type PopulationValue = Record<string, [string | number, boolean | undefined]> & {
  label: [string, boolean | undefined];
};

export default function PopulationResultTable({ results }: PopulationResultViewerProps) {
  const tableHeaders = useMemo(() => {
    return extractTableHeaders(results?.[0].detailedResult);
  }, [results]);
  const currentPatients = useRecoilValue(patientTestCaseState);
  const { classes } = useStyles();

  /**
   * Converts an array of DetailedResults with labels into JSX table rows for display
   */
  function constructPopulationResultsArray(results: LabeledDetailedResult[]) {
    const allInfo = results
      .filter(drInfo => drInfo.detailedResult)
      .map(drInfo => {
        return extractPopulationResultInfo(drInfo.detailedResult, drInfo.label);
      });
    const totalsRow = (
      <tr key="totals">
        <td>Totals</td>
        {tableHeaders.map(e => (
          <td key={e}>{allInfo.reduce((acc, current) => acc + (current[e][0] as number), 0)}</td>
        ))}
      </tr>
    );
    const allRows = [totalsRow, ...allInfo.map(info => PopulationResultsRow(info))];
    return allRows;
  }

  /**
   * Strips population results off of a DetailedResult and gives back info on results and whether they match desired
   */
  function extractPopulationResultInfo(dr: DetailedResult, label = 'Unlabeled Patient') {
    const group = dr.detailedResults?.[0];
    const labeledPopulationResults: PopulationValue = { label: [label, true] }; // initially assume total match

    group?.populationResults?.forEach(pr => {
      const key = pr.criteriaExpression || pr.populationType;
      if (key) {
        const matchesDesired =
          currentPatients[dr.patientId].desiredPopulations === undefined
            ? undefined
            : pr.result === currentPatients[dr.patientId].desiredPopulations?.includes(pr.populationType);
        if (matchesDesired === undefined) {
          // don't highlight label if there isn't a result
          labeledPopulationResults.label[1] = undefined;
        } else if (!matchesDesired) {
          // falsify patient label if not a total match
          labeledPopulationResults.label[1] = false;
        }

        labeledPopulationResults[key as string] = [pr.result ? 1 : 0, matchesDesired];
      }
    });

    return labeledPopulationResults;
  }

  /**
   * Formats population results for a FHIR Patient into a TSX component for display as a table row
   */
  function PopulationResultsRow(populationResult: PopulationValue) {
    return (
      <tr key={populationResult.label[0]}>
        {populationResult.label[1] === undefined ? (
          <td>{populationResult.label[0]}</td>
        ) : (
          <td>
            {populationResult.label[1] ? (
              <Badge
                color="green"
                style={{
                  marginRight: '5px'
                }}
              >
                <IconCheck />
              </Badge>
            ) : (
              <Badge
                color="red"
                style={{
                  marginRight: '5px'
                }}
              >
                <IconX />
              </Badge>
            )}
            {populationResult.label[0]}
          </td>
        )}

        {tableHeaders.map(e =>
          populationResult[e][1] === undefined || populationResult[e][1] ? (
            <td key={e}>{populationResult[e][0]}</td>
          ) : (
            <td className={classes.highlightRed} key={e}>
              {populationResult[e][0]}
            </td>
          )
        )}
      </tr>
    );
  }

  /**
   * Pulls off the population group criteria expression for use as table headers
   */
  function extractTableHeaders(dr: DetailedResult): string[] {
    const group = dr.detailedResults?.[0];
    if (group?.populationResults?.length) {
      return group?.populationResults.map(e => {
        return e.criteriaExpression || '';
      });
    }
    return [];
  }

  return (
    <Table>
      <thead>
        <tr>
          <th>Patient</th>
          {tableHeaders?.map(e => (
            <th key={e}>{e}</th>
          ))}
        </tr>
      </thead>
      <tbody>{constructPopulationResultsArray(results)}</tbody>
    </Table>
  );
}
