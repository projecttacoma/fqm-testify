# FQM Testify

Tooling for analysis of Electronic Clinical Quality Measures (eCQMs) based on the HL7® FHIR® standard<sup id="fn-1">[\[1\]](#fnref-1)</sup>.

- [Installation](#installation)

  - [Prerequisites](#prerequisites)
  - [Local Installation](#local-installation)
  - [Testing](#testing)

- [Usage](#usage)

  - [Adding Test Cases](#adding-test-cases)
    - [Creating a Test Patient](#creating-a-test-patient)
    - [Importing a Patient Bundle](#importing-a-patient-bundle)
    - [Creating Non-Patient Test Resources](#creating-non-patient-test-resources)
    - [Reading the Population Comparison Table](#reading-the-population-comparison-table)
      - [Patient](#patient)
      - [Episodes](#episodes)
  - [Exporting a Test Case](#exporting-a-test-case)

- [License](#license)

## Installation

### Prerequisites

- [Node.js >=18.0.0](https://nodejs.org/en/)
- [Git](https://git-scm.com/)

### Local Installation

Clone the source code:

```bash
git clone https://github.com/projecttacoma/fqm-testify.git
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Testing

Unit tests can be running using the following `npm` command:

```bash
npm run test
```

## Usage

FQM-Testify is a React-based web application for analyzing FHIR-based electronic clinical quality measures (eCQMs) through the creation of test FHIR Patients and other FHIR resources.

### Adding Test Cases

After starting up the app, begin by uploading a FHIR Measure Bundle JSON file from your local machine. The measurement period start and end pickers will update to reflect the `effectivePeriod` of the Measure resource in the uploaded bundle. By default, the measure calculation will run with `trustMetaProfile` set to `false`, but the user can change that to `true` with the toggle. There are two methods for adding test patients to the test case: in-app patient creation and Patient Bundle import.

#### Adding ValueSets to FHIR Measure Bundle

The user will see an error when uploading a FHIR Measure Bundle unless it has the following things: exactly one measure resource, all dependent library resources used, and all ValueSets needed for measure calculation. If the Measure Bundle is missing ValueSets, then the user can add ValueSets by running [the fqm-execution library](https://github.com/projecttacoma/fqm-execution) CLI with the following command:

```bash
./src/cli.ts valueSets -m <path to measure bundle> --vs-api-key <api key>
```

If you don't have a VSAC API key, look at the [fqm-execution README](https://github.com/projecttacoma/fqm-execution#valuesets) on how to get one.

#### Creating a Test Patient

Test patients can be created in the app by clicking on the "Create" button in the left panel. This opens a code editor modal with a pre-populated, randomly-generated FHIR Patient. The test patient can be edited from the modal and saved for future use.

#### Importing a Patient Bundle

Test cases can be imported by clicking the "Import" button in the left panel, which will open a file dropzone that accepts JSON files of FHIR Patient Bundles and `.zip` files composed of FHIR Patient Bundles. Patient Bundles may contain additional FHIR resources. These FHIR resources are also loaded into the app and will belong to the patient contained in the Patient Bundle. When importing a Patient Bundle or Bundles, there is a switch to remove resources not relevant to the Measure. When set, the resources that are not included in the provided Measure's data requirements will be removed from the Patient Bundle. NOTE: Resources included in the provided Measure's data requirements are defined as resources whose primaryCodePath value match with ANY of the codes on any data requirements of the same resource type, whether those codes are included in a direct reference code or a ValueSet. Resources are only required to match with at least one codeFilter on a data requirement, not all codeFilters if a Data Requirement has multiple.

#### Selecting Desired Measure Populations

For each test patient, the user has the option to select the population(s) for which the patient should belong during measure calculation. Use the dropdown on the selected patient's information card to select the desired population(s). See the [eCQM documentation on population criteria](https://build.fhir.org/ig/HL7/cqf-measures/measure-conformance.html#population-criteria) for more information.

#### Creating Non-Patient Test Resources

FQM-Testify allows the user to create non-patient FHIR resources after at least one patient resource is created in or imported to the app. To create a FHIR resource for a test patient, first select the test patient from the left panel. Once selected, FHIR resources can be created from the middle panel in two ways.

(1) Resources can be created by selecting a resource from the dropdown list of resource templates. These resource templates are based on the FHIR `dataRequirements` of the uploaded measure (`dataRequirements` calculations and all other FHIR eCQM calculation in the app is done using [the fqm-execution library](https://github.com/projecttacoma/fqm-execution)). Upon selection, a code editor modal will open, pre-populated with the resource. The user can edit the resource and save it for future use.

(2) Resources can be created by clicking on the "Add New Custom Resource Button." This option allows the user to paste a FHIR Resource into a code editor modal and make necessary edits before saving it as a resource for the patient.

A FHIR resource can be examined, edited, and deleted by selecting the patient the resource belongs to, and then accessing the FHIR resource in the middle panel.

#### Reading the Population Comparison Table

The columns in this table represent the possible populations as specified on the uploaded Measure and the rows represent the desired and actual populations as stored/calculated by FQM-Testify. The first rows are for the patient, and any subsequent rows show episode results.
Both patient and episode results compare actual and desired results. If any of the cells are highlighted red, that means the desired population/observation does not match the actual population/observation. If they are highlighted green, then they match. If they are not highlighted, then the cell represents a value that is not relevant to the current patient/measure. Some examples of a non-relevant cell are a patient level observation result for an episode of care measure or a numerator observation for an episode that doesn't fall in the numerator.

##### Patient

Patient-based measures show only patient population results. For the &apos;Actual&apos; row, the value will be 1 if the patient calculates into the respective population, and 0 if it does not. The &apos;Desired&apos; row shows a 1 for populations that the patient is expected to be a part of and 0 for populations that the patient is not expected to be a part of.

##### Episodes

For episode-based measure result data, patient results show the total number of episodes that fall into the corresponding population. This value is not boolean, so it may be greater than 1. For episode population data, the population results are again boolean and show whether that particular episode falls into the corresponding population. For episode observation results, the observation value will be shown, which comes from a calculation on that particular episode, so it may also be a non-boolean number, greater than 1. Desired values may also be assigned a non-boolean value and matched with the actual result value accordingly for cell highlighting (desired episode values are not yet implemented).

### Exporting a Test Case

FQM-Testify allows for exporting of all test cases by clicking the "Download All" button in the left panel, which generates and downloads a `.zip` file with a subdirectory for each patient, containing a Patient Bundle including the patient and all resources which reference the patient. Individual Patient Bundles can be downloaded as well by clicking on the patient entry and selecting the download button.

### Running Measure Calculation on a Test Case

FQM-Testify can run measure calculation on a single test case for a given measure. Selecting a patient entry triggers calculation and displays logic highlighting using [the fqm-execution library](https://github.com/projecttacoma/fqm-execution) in the right panel. Measure calculation automatically regenerates for a patient if:

- non-patient test resources are added for the patient
- existing test resources that belong to the patient are edited
- the patient resource itself is edited
- the measure bundle and/or measurement period are changed

### Running Measure Calculation on All Test Cases

FQM-Testify enables users to run measure calculation on all test cases in addition to just one test case. Once a FHIR Measure and at least one test case are uploaded, the user can run measure calculation on all the created patients by clicking the Calculate Population Results button in the left panel. Using calculation from [the fqm-execution library](https://github.com/projecttacoma/fqm-execution), the population results for each patient appear in a population results table, with a row for each patient, labeled with the patient's name and date of birth. The population result table can be hidden or shown as well as regenerated if test cases are added.

Once calculation has finished, the user can access an HTML representation of the clauses covered by the test cases that were passed into the calculation. This can be accessed by clicking on the "Show Clause Coverage" button.

## License

Copyright 2023 The MITRE Corporation

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

```bash
http://www.apache.org/licenses/LICENSE-2.0
```

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

---

<strong id="fnref-1">[\[1\]](#fn-1) FHIR® is the registered trademark of Health Level Seven International (HL7). </strong>
