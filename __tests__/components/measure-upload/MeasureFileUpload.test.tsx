import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Calculator } from 'fqm-execution';
import { mantineRecoilWrap, getMockRecoilState } from '../../helpers/testHelpers';
import { measureBundleState } from '../../../state/atoms/measureBundle';
import MeasureUpload from '../../../components/measure-upload/MeasureFileUpload';

const MOCK_BUNDLE: fhir4.Bundle = {
  resourceType: 'Bundle',
  type: 'collection'
};

describe('MeasureUpload', () => {
  it('renders a dropzone with generic label when no measure uploaded', () => {
    render(mantineRecoilWrap(<MeasureUpload logError={jest.fn()} />));

    const title = screen.getByText('Drag a Measure Bundle JSON file here or click to select file');
    expect(title).toBeInTheDocument();
  });

  it('renders a dropzone with measure bundle name label when measure uploaded', async () => {
    jest.spyOn(Calculator, 'calculateDataRequirements').mockResolvedValue({
      results: {
        resourceType: 'Library',
        status: 'draft',
        type: {}
      }
    });

    const MockMB = getMockRecoilState(measureBundleState, {
      fileName: 'testName',
      content: MOCK_BUNDLE,
      isFile: true,
      measureRepositoryUrl: '',
      selectedMeasureId: null,
      displayMap: {}
    });

    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockMB />
            <MeasureUpload logError={jest.fn()} />
          </>
        )
      );
    });

    const dropzone = screen.getByRole('presentation');
    expect(dropzone).toBeInTheDocument();
    const title = screen.getByText('testName');
    expect(title).toBeInTheDocument();
  });
  // TODO: Consider testing for recoil state changes once file upload fire events are figured out
});
