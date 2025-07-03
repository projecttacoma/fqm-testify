import { atom } from 'recoil';

interface EvaluationStateType {
  evaluationServiceUrl: string;
  evaluationMeasureId: string;
}

/**
 * Atom tracking and controlling the value of uploaded measure bundle
 */
export const evaluationState = atom<EvaluationStateType>({
  key: 'evaluationState',
  default: {
    evaluationServiceUrl: '',
    evaluationMeasureId: ''
  }
});
