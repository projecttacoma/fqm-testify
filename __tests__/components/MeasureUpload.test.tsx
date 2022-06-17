import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { mantineRecoilWrap, getMockRecoilState } from '../helpers/testHelpers';
import { measureBundleState } from '../../state/atoms/measureBundle';
import MeasureUpload from '../../components/MeasureUpload';
import testBundle from '../fixtures/bundles/EXM130Fixture.json';

describe('MeasureUpload', () => {
  it('renders a dropzone with generic label when no measure uploaded', () => {
    render(mantineRecoilWrap(<MeasureUpload />));

    const dropzone = screen.getByRole('button');
    expect(dropzone).toBeInTheDocument();
    const title = screen.getByText('Drag a Measure Bundle JSON file here or click to select files');
    expect(title).toBeInTheDocument();
  });
  it('renders a dropzone with measure bundle name label when measure uploaded', async () => {
    const MockMB = getMockRecoilState(measureBundleState, {
      name: 'testName',
      content: testBundle as fhir4.Bundle
    });
    await act(async () => {
      render(
        mantineRecoilWrap(
          <>
            <MockMB />
            <MeasureUpload />
          </>
        )
      );
    });

    const dropzone = screen.getByRole('button');
    expect(dropzone).toBeInTheDocument();
    const title = screen.getByText('testName');
    expect(title).toBeInTheDocument();
  });
  // TODO: Consider testing for recoil state changes once file upload fire events are figured out
});
