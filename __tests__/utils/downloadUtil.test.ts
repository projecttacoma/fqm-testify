import { download, downloadZip } from '../../util/downloadUtil';
import { getByTestId, waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom';
import JSZip from 'jszip';
import FileSaver from 'file-saver';

jest.mock('file-saver', () => ({
  saveAs: jest.fn()
}));

describe('downloadUtil testing', () => {
  test('test file download creates and removes link', async () => {
    const prevCreateObj = URL.createObjectURL;
    URL.createObjectURL = jest.fn().mockReturnValue('testURL');
    download('testfilename', 'testcontents');
    const link = getByTestId(document.body, 'temp-download-link');
    expect(link).toHaveAttribute('download', 'testfilename');
    expect(link).toHaveAttribute('href', 'testURL');

    const onClick = jest.fn();
    link.addEventListener('click', onClick);
    await waitFor(() => {
      expect(onClick).toHaveBeenCalledTimes(1);
    });
    expect(link).not.toBeInTheDocument();
    URL.createObjectURL = prevCreateObj; // reset mock of createObjectURL
  });

  test('test zip download saves zip file with appropriate contents', async () => {
    const testZip = new JSZip();
    const zipName = 'test-zip';

    await downloadZip(testZip, zipName);

    expect(FileSaver.saveAs).toHaveBeenCalledTimes(1);
    expect(FileSaver.saveAs).toHaveBeenCalledWith(expect.any(Blob), zipName);
  });
});
