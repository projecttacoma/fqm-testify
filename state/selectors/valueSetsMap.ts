import { selector } from 'recoil';
import { measureBundleState } from '../atoms/measureBundle';

export interface ValueSetsMap {
  [url: string]: string;
}

// Maps valueset urls to their name or title for display purposes
export const valueSetMapState = selector<ValueSetsMap>({
  key: 'valueSetMapState',
  get: ({ get }) => {
    const bundle = get(measureBundleState).content;
    if (bundle) {
      return (
        bundle.entry?.reduce((acc: any, e: fhir4.BundleEntry) => {
          if (e.resource?.resourceType === 'ValueSet' && e.resource.url) {
            acc[e.resource.url] = e.resource.name ?? e.resource.title ?? 'Name Missing';
          }
          return acc;
        }, {}) || {}
      );
    }
    return {};
  }
});
