import { Table } from '@mantine/core';
import { CalculatorTypes } from 'fqm-execution';
import { useMemo } from 'react';

export type PopulationResultViewerProps = {
  results: DetailedResultInfoArray;
};

export type DetailedResultInfoArray = Array<DetailedDetailedResult>;

export declare type DetailedDetailedResult = {
  label: string;
  detailedResult: CalculatorTypes.ExecutionResult<CalculatorTypes.DetailedPopulationGroupResult>;
};

export type PopulationResult = {
  label: string;
  [key: string]: number | string | boolean;
};

export default function PopulationResultTable({ results }: PopulationResultViewerProps) {
  const tableHeaders = useMemo(() => {
    return extractTableHeaders(results?.[0].detailedResult);
  }, [results]);

  function constructPopulationResultsArray(results: DetailedResultInfoArray) {
    return results
      .filter(drInfo => drInfo.detailedResult)
      .map(drInfo => {
        return extractPopulationResultRow(drInfo.detailedResult, drInfo.label);
      });
  }
  function extractPopulationResultRow(
    dr: CalculatorTypes.ExecutionResult<CalculatorTypes.DetailedPopulationGroupResult>,
    label = 'Unlabeled Patient'
  ) {
    const group = dr.detailedResults?.[0];
    const populationResults = { label };
    group?.populationResults?.reduce((acc: PopulationResult, e) => {
      const key = e.criteriaExpression || e.populationType;
      if (key) {
        acc[key as string] = e.result === true ? 1 : 0;
      }
      return acc;
    }, populationResults);
    return PopulationResultsRow(populationResults);
  }

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

  function extractTableHeaders(
    dr: CalculatorTypes.ExecutionResult<CalculatorTypes.DetailedPopulationGroupResult>
  ): string[] {
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
