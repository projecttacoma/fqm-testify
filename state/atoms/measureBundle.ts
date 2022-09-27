import { atom } from 'recoil';

interface MeasureBundleStateType {
  name: string;
  content: fhir4.Bundle | null;
}

/**
 * Atom tracking and controlling the value of uploaded measure bundle
 */
export const measureBundleState = atom<MeasureBundleStateType>({
  key: 'measureBundleState',
  default: {
    name: '',
    content: null
  }
});
