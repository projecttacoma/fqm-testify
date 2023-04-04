import { selector } from 'recoil';
import { measureBundleState } from '../atoms/measureBundle';

export const displayMapToSelectDataState = selector<Record<'label' | 'value', string>[]>({
  key: 'displayMapToSelectDataState',
  get: ({ get }) => {
    const measureBundle = get(measureBundleState);
    return Object.keys(measureBundle.displayMap).map(id => ({ value: id, label: measureBundle.displayMap[id] }));
  }
});
