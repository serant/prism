import React from "react";
import { Document, Page } from "react-pdf";

const PDFPane = ({ file, options, numPages, onLoadSuccess, onPageLoad }) => {
  return (
    <div style={{ overflowY: "scroll", height: "700px" }}>
      <div>
        <Document file={file} onLoadSuccess={onLoadSuccess} options={options}>
          {Array.from(new Array(numPages), (el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              renderMode="canvas"
              onLoadSuccess={onPageLoad}
            />
          ))}
        </Document>
      </div>
    </div>
  );
};

export default PDFPane;
