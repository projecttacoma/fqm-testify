import { atom } from "recoil";

/**
 * Atom tracking and controlling the value of uploaded measure bundle
 */
export const searchQueryState = atom<string>({
key: 'searchQueryState',
default: ''
});