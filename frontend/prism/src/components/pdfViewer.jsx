import React from "react";

import PDFPane from "./pdfPane";

const PDFViewer = ({
  title,
  file,
  options,
  numPages,
  onLoadSuccess,
  onPageLoad
}) => {
  return (
    <div className="container">
      <h1 className="text-center row">{title}</h1>
      <PDFPane
        file={file}
        onLoadSuccess={onLoadSuccess}
        onPageLoad={onPageLoad}
        options={options}
        numPages={numPages}
        className="row"
      />
      <button className="btn btn-success mx-auto row">Download</button>
    </div>
  );
};

export default PDFViewer;
