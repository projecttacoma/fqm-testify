import { atom } from 'recoil';

interface DataRequirementStateType {
  name: string;
  content: fhir4.DataRequirement | null;
}

/**
 * Atom tracking and controlling the value of the selected data requirement
 * from the list of data elements for a given test case
 */
export const selectedDataRequirementState = atom<dataRequirementStateType>({
  key: 'selectedDataRequirementState',
  default: {
    name: '',
    content: null
  }
});
