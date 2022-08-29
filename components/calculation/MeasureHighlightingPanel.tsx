import { createStyles, Button } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons';
import { CalculatorTypes, Calculator } from 'fqm-execution';
import produce from 'immer';
import { useRecoilValue, useRecoilState } from 'recoil';
import parse from 'html-react-parser';
import { measureBundleState } from '../../state/atoms/measureBundle';
import { measurementPeriodState } from '../../state/atoms/measurementPeriod';
import { patientTestCaseState } from '../../state/atoms/patientTestCase';
import { selectedPatientState } from '../../state/atoms/selectedPatient';
import { createPatientBundle } from '../../util/fhir';

const useStyles = createStyles({
  highlightedMarkup: {
    '& pre': {
      whiteSpace: 'pre-wrap'
    }
  },
  panel: {
    maxHeight: '100%',
    overflow: 'scroll'
  }
});

export interface MeasureHighlightingPanelProps {
  patientId: string;
}

export default function MeasureHighlightingPanel({ patientId }: MeasureHighlightingPanelProps) {
  const selectedPatient = useRecoilValue(selectedPatientState);
  const [currentPatients, setCurrentPatients] = useRecoilState(patientTestCaseState);
  const measureBundle = useRecoilValue(measureBundleState);
  const measurementPeriod = useRecoilValue(measurementPeriodState);

  const { classes } = useStyles();

  const clickCalculateButton = async (id: string | null) => {
    try {
      await calculate(id);
    } catch (error) {
      if (error instanceof Error) {
        showNotification({
          icon: <IconAlertCircle />,
          title: 'Calculation Error',
          message: error.message,
          color: 'red'
        });
      }
    }
  };

  // Function to calculate the selected patient's measure report
  const calculate = async (id: string | null) => {
    const options: CalculatorTypes.CalculationOptions = {
      calculateHTML: true,
      // TODO: Flip this to true once a new fqm-execution version is released/dependency is updated
      calculateSDEs: false,
      reportType: 'individual',
      measurementPeriodStart: measurementPeriod.start?.toISOString(),
      measurementPeriodEnd: measurementPeriod.end?.toISOString()
    };

    if (id && measureBundle.content) {
      const patientBundle = createPatientBundle(currentPatients[id].patient, currentPatients[id].resources);

      const mrResults = await Calculator.calculateMeasureReports(measureBundle.content, [patientBundle], options);
      const [measureReport] = mrResults.results as fhir4.MeasureReport[];

      const nextPatientState = produce(currentPatients, draftState => {
        draftState[id].measureReport = measureReport;
      });

      setCurrentPatients(nextPatientState);
    }
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end'
        }}
      >
        <Button
          onClick={() => {
            clickCalculateButton(selectedPatient);
          }}
          variant="outline"
        >
          Calculate
        </Button>
      </div>
      <div className={classes.highlightedMarkup}>
        {parse(currentPatients[patientId].measureReport?.text?.div || '')}
      </div>
    </>
  );
}
