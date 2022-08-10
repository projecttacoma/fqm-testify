import _ from 'lodash';
import { fakeNames } from '../data/names';

export function getRandomLastName() {
  return _.sample(fakeNames.lastNames) ?? 'LastName456';
}

export function getRandomFirstName(gender: 'male' | 'female') {
  return _.sample(fakeNames.firstNames[gender]) ?? 'FirstName123';
}
