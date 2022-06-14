import { atom } from 'recoil';

interface measureBundleStateType {
  name: string;
  content: fhir4.Bundle | null;
  valueSetsMap: { [key: string]: string } | null;
}

/**
 * Atom tracking and controlling the value of uploaded measure bundle
 */
export const measureBundleState = atom<measureBundleStateType>({
  key: 'measureBundleState',
  default: {
    name: '',
    content: null,
    valueSetsMap: null
  }
});
