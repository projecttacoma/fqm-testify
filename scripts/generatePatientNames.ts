/*
 * Generates a lookup table of randomized fake names to use during patient creation in the app
 * This is a standalone script to avoid using faker in the core application, as it is quite a large library
 */
import fs from 'fs';
import path from 'path';
import { faker } from '@faker-js/faker';

// TODO: add non-binary genders/names that are FHIR-compliant
interface NameInfo {
  firstNames: {
    male: string[];
    female: string[];
  };
  lastNames: string[];
}

/**
 * Generate a random 3 digit number between 100-999
 */
function generateRandomNumber() {
  return Math.floor(Math.random() * (999 - 100) + 100);
}

function generateNames(count: number) {
  const names: NameInfo = {
    firstNames: {
      male: [],
      female: []
    },
    lastNames: []
  };

  for (let i = 0; i < count; i++) {
    const firstName = `${faker.name.firstName('male')}${generateRandomNumber()}`;
    names.firstNames.male.push(firstName);
  }

  for (let i = 0; i < count; i++) {
    const firstName = `${faker.name.firstName('female')}${generateRandomNumber()}`;
    names.firstNames.female.push(firstName);
  }

  for (let i = 0; i < count; i++) {
    const lastName = `${faker.name.lastName()}${generateRandomNumber()}`;
    names.lastNames.push(lastName);
  }

  return names;
}

const names = generateNames(50);
const outputPath = path.join(__dirname, '../data/names.ts');

fs.writeFileSync(
  outputPath,
  `
export const fakeNames = ${JSON.stringify(names, null, 2)};
`,
  'utf8'
);

console.log(`Wrote fake patient names to ${outputPath}`);
