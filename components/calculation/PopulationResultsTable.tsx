import { Table } from '@mantine/core';
import { useMemo } from 'react';
import { DetailedResult } from '../../util/types';

export type PopulationResultViewerProps = {
  results: LabeledDetailedResult[];
};

export type LabeledDetailedResult = {
  label: string;
  detailedResult: DetailedResult;
};

export type PopulationResult = Record<string, string | number> & { label: string };

export default function PopulationResultTable({ results }: PopulationResultViewerProps) {
  const tableHeaders = useMemo(() => {
    return extractTableHeaders(results?.[0].detailedResult);
  }, [results]);

  /**
   * Converts an array of DetailedResults with labels into JSX table rows for display
   */
  function constructPopulationResultsArray(results: LabeledDetailedResult[]) {
    return results
      .filter(drInfo => drInfo.detailedResult)
      .map(drInfo => {
        return extractPopulationResultRow(drInfo.detailedResult, drInfo.label);
      });
  }

  /**
   * Strips population results off of a DetailedResult and calls PopulationResultsRow to format them into a TSX component
   */
  function extractPopulationResultRow(dr: DetailedResult, label = 'Unlabeled Patient') {
    const group = dr.detailedResults?.[0];
    const labeledPopulationResults = { label };
    group?.populationResults?.reduce((acc: PopulationResult, e) => {
      const key = e.criteriaExpression || e.populationType;
      if (key) {
        acc[key as string] = e.result === true ? 1 : 0;
      }
      return acc;
    }, labeledPopulationResults);
    return PopulationResultsRow(labeledPopulationResults);
  }

  /**
   * Formats population results for a FHIR Patient into a TSX component for display as a table row
   */
  function PopulationResultsRow(populationResult: PopulationResult) {
    return (
      <tr key={populationResult.label}>
        <td>{populationResult.label}</td>
        {tableHeaders.map(e => (
          <td key={e}>{populationResult[e]}</td>
        ))}
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
