import { atom } from 'recoil';

type SortType = 'date' | 'resourceType' | '';
type SortOrderType = 'asc' | 'desc' | '';

export const cardFiltersAtom = atom<{
  searchString: string;
  sortType: SortType;
  sortOrder: SortOrderType;
}>({
  key: 'cardFiltersAtom',
  default: {
    searchString: '',
    sortType: '',
    sortOrder: ''
  }
});
