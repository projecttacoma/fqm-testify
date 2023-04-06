import { atom } from 'recoil';

interface MeasureBundleStateType {
  content: fhir4.Bundle | null;
  displayMap: Record<string, string>;
  fileName: string;
  isFile: boolean;
  measureRepositoryUrl: string;
  selectedMeasureId: string | null;
}

/**
 * Atom tracking and controlling the value of uploaded measure bundle
 */
export const measureBundleState = atom<MeasureBundleStateType>({
  key: 'measureBundleState',
  default: {
    content: null,
    displayMap: {},
    fileName: '',
    isFile: false,
    measureRepositoryUrl: '',
    selectedMeasureId: null
  }
});
