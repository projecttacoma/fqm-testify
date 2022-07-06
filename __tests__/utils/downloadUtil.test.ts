import { download } from '../../util/downloadUtil';
import { getByTestId, waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom';

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
});
