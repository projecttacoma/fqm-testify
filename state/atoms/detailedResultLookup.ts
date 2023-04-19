import { atom } from 'recoil';
import { DetailedResult } from '../../util/types';

export const detailedResultLookupState = atom<Record<string, DetailedResult>>({
  key: 'detailedResultLookupState',
  default: {}
});
