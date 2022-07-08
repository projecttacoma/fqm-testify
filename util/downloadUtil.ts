import JSZip from 'jszip';
import FileSaver from 'file-saver';

/**
 * Creates a temporary download link in the document to download a file with the
 * passed in filename and fileContents
 * @param filename {String} the filename to download
 * @param fileContents {String} the contents of the file to download
 */
export const download = (filename: string, fileContents: string) => {
  const blob = new Blob([fileContents], { type: 'application/json+fhir' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('data-testid', 'temp-download-link');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  // keep the link for one tick before click for testing
  setTimeout(() => {
    link.click();
    document.body.removeChild(link);
  });
};

export const downloadZip = (zip: JSZip, fileName: string) => {
  // Create a blob of zip and save
  zip.generateAsync({ type: 'blob' }).then(blob => {
    FileSaver.saveAs(blob, fileName);
  });
};
