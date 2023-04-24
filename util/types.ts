import { CalculatorTypes } from 'fqm-execution';

export interface ResourceCodeInfo {
  primaryCodePath: string;
  paths: Record<string, CodePathInfo>;
}

export interface CodePathInfo {
  codeType: string;
  multipleCardinality: boolean;
  choiceType: boolean;
}

export type DetailedResult = CalculatorTypes.ExecutionResult<CalculatorTypes.DetailedPopulationGroupResult>;
