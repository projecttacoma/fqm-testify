import { faker } from '@faker-js/faker';

export function generateRandomLastName() {
  return `${faker.name.lastName()}${generateRandomNumber()}`;
}

export function generateRandomFirstName(gender: 'male' | 'female') {
  return `${faker.name.firstName(gender)}${generateRandomNumber()}`;
}

/**
 * Generate a random 3 digit number between 100-999
 */
function generateRandomNumber() {
  return Math.floor(Math.random() * (999 - 100) + 100);
}
