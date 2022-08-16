import { atom } from 'recoil';

/**
 * Atom tracking and controlling the value of the search query
 * from the search bar
 */
export const searchQueryState = atom<string>({
  key: 'searchQueryState',
  default: ''
});
