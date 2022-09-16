import { atom } from 'recoil';

export const measureReportLookupState = atom<Record<string, fhir4.MeasureReport>>({
  key: 'measureReportLookupState',
  default: {}
});
