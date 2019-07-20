import React from "react";
import { Document, Page } from "react-pdf";

/**
 * Inputs:
 *  - PDF
 *
 * Outputs
 *  - onDownload
 */

const PDFViewer = ({ pdf }) => {
  return (
    <Document file={pdf}>
      <Page pageNumber={1} />
    </Document>
  );
};

export default PDFViewer;
