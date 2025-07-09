import { atom } from 'recoil';

interface EvaluationStateType {
  evaluationServiceUrl: string;
  evaluationMeasureId: string;
}

/**
 * Atom tracking and controlling values for the evaluation service
 */
export const evaluationState = atom<EvaluationStateType>({
  key: 'evaluationState',
  default: {
    evaluationServiceUrl: '',
    evaluationMeasureId: ''
  }
});
