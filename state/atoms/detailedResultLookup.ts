import { CalculatorTypes } from 'fqm-execution';
import { atom } from 'recoil';

export const detailedResultLookupState = atom<
  Record<string, CalculatorTypes.ExecutionResult<CalculatorTypes.DetailedPopulationGroupResult>>
>({
  key: 'detailedResultLookupState',
  default: {}
});
