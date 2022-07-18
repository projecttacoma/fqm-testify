# FQM Testify

Tooling for analysis of Electronic Clinical Quality Measures (eCQMS).

- [Installation](#installation)

  - [Prerequisites](#prerequisites)
  - [Local Installation](#local-installation)
  - [Testing](#testing)

- [Usage](#usage)

  - [Adding Test Cases](#adding-test-cases)
    - [Creating a Test Patient](#creating-a-test-patient)
    - [Importing a Patient Bundle](#importing-a-patient-bundle)
    - [Creating Non-Patient Test Resources](#creating-non-patient-test-resources)
  - [Exporting a Test Case](#exporting-a-test-case)

- [License](#license)

## Installation

### Prerequisites

- [Node.js >=11.15.0](https://nodejs.org/en/)
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

After starting up the app, begin by uploading a FHIR Measure Bundle JSON file from your local machine. The measurement period start and end pickers will update to reflect the `effectivePeriod` of the Measure resource in the uploaded bundle. There are two methods for adding test Patients to the server: in-app Patient creation and Patient Bundle import.

#### Creating a Test Patient

Test patients can be created in the app by clicking on the "Create Test Patient" button, which will open a code editor modal with a pre-populated, randomly-generated FHIR Patient.

#### Importing a Patient Bundle

Test cases can be imported by clicking the "Import Test Patient(s)" button, which will open a file dropzone which accepts JSON files of FHIR Patient Bundles and .zip files composed of FHIR Patient Bundles. Patient Bundles may contain additional test resources, which will be loaded into FQM-Testify as well.

#### Creating Non-Patient Test Resources

FQM-Testify allows the user to create non-Patient FHIR resources after at least one Patient resource is created in or imported to the app. Once a Measure Bundle is uploaded and a Patient is created, FQM-Testify will generate a list of non-Patient resource templates based on the FHIR `dataRequirements` of the uploaded measure (`dataRequirements` calculations and all other FHIR eCQM calculation in the app is done using [the fqm-execution library](https://github.com/projecttacoma/fqm-execution)). New non-Patient resources can be created by clicking on a test patient, then clicking on a non-Patient resource from the generated list. This will open a code editor modal pre-populated with an appropriate test resource that references the selected patient. Non-Patient resources can be examined, edited, and deleted by clicking on the Patient resource they are associated with.

### Exporting a Test Case

FQM-Testify allows for exporting of all test cases by clicking the "Download All Patients" button, which generates and downloads a zip file with a subdirectory for each Patient, containing a Patient Bundle including the patient and all resources which reference the patient. Individual Patient Bundles can be downloaded as well by clicking on the patient entry and selecting the download button.

## License

Copyright 2022 The MITRE Corporation

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

```bash
http://www.apache.org/licenses/LICENSE-2.0
```

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
