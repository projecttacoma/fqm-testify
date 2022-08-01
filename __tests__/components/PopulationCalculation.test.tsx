import '@testing-library/jest-dom';
import PopulationCalculation from '../../components/PopulationCalculation';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { getMockRecoilState, mantineRecoilWrap } from '../helpers/testHelpers';
import testBundle from '../fixtures/bundles/EXM130Fixture.json';
import { render, screen } from '@testing-library/react';

describe('PopulationCalculation', () => {
  it('should not render Calculate button by default', () => {
    render(
      mantineRecoilWrap(
        <>
          <PopulationCalculation />
        </>
      )
    );

    const calculateButton = screen.queryByTestId('calculate-button');
    expect(calculateButton).not.toBeInTheDocument();
  });

  it('should render Calculate button when measure bundle is present and at least one patient created', () => {
    const MockMB = getMockRecoilState(measureBundleState, {
      name: 'testName',
      content: testBundle as fhir4.Bundle
    });
    const MockPatients = getMockRecoilState(patientTestCaseState, {
      'example-pt': {
        patient: {
          resourceType: 'Patient',
          name: [{ given: ['Test123'], family: 'Patient456' }]
        },
        resources: []
      }
    });

    render(
      mantineRecoilWrap(
        <>
          <MockMB />
          <MockPatients />
          <PopulationCalculation />
        </>
      )
    );

    const calculateButton = screen.getByRole('button', { name: 'Calculate' });
    expect(calculateButton).toBeInTheDocument();
  });
});
