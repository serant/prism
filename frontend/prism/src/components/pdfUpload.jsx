import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { splitPDF, parsePDFColors, zipPDF } from "../tools/pdfParser";
import { saveAs } from "file-saver";

const PDFUpload = () => {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [bwPages, setBwPages] = useState([]);

  const handleProgress = (bwPages, colorPages, totalPages) => {
    setBwPages(bwPages);
    setProgress(
      Math.round(((bwPages.length + colorPages.length) * 100) / totalPages)
    );
  };

  const parsePdf = async (pdfName, pdfData) => {
    const data = new Uint8Array(pdfData);

    setMessage("Parsing Documents...");
    setBwPages([]);
    setProgress(0);
    setLoading(true);

    let { bwPages, colorPages } = await parsePDFColors(data, handleProgress);

    bwPages = bwPages.sort((a, b) => {
      return a - b;
    });
    colorPages = colorPages.sort((a, b) => {
      return a - b;
    });

    setMessage("Splitting Documents...");
    const { bwPDF, colorPDF } = await splitPDF(data, bwPages, colorPages);
    const fileBase = pdfName.split(".pdf")[0];
    const bwName = fileBase + " BW.pdf";
    const colorName = fileBase + " Color.pdf";
    const zipName = fileBase + ".zip";

    setMessage("Saving Documents...");
    const zip = await zipPDF(
      { name: bwName, data: bwPDF },
      { name: colorName, data: colorPDF }
    );
    await saveAs(zip, zipName);

    setLoading(false);
  };

  const onDrop = acceptedFiles => {
    const droppedPdf = acceptedFiles[0];

    // Added due to https://github.com/react-dropzone/react-dropzone/issues/276
    if (!droppedPdf.name.endsWith(".pdf")) return;

    let fileReader = new FileReader();
    fileReader.onload = async () => {
      await parsePdf(droppedPdf.name, fileReader.result);
    };

    fileReader.readAsArrayBuffer(droppedPdf);
  };

  const getDropzoneContent = inputProps => {
    if (isLoading) {
      return (
        <React.Fragment>
          <button className="btn btn-success" type="button" disabled>
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            {message} ({progress} %)
          </button>
          <p>
            ${(bwPages.length * 0.3).toFixed(2)} saved so far<sup>*</sup>
          </p>
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <button className="btn btn-success row">
            <input {...inputProps} />
            Choose PDF to Upload...
          </button>
          <p style={{ padding: "10px" }} className="card-text text-center">
            {bwPages.length === 0
              ? "or drag and drop one here"
              : `$${(bwPages.length * 0.3).toFixed(2)} saved in total`}
            <sup>*</sup>
          </p>
        </React.Fragment>
      );
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div
      className="card bg-light text-center col-12 mx-auto rounded-lg"
      {...getRootProps()}
    >
      <div style={{ padding: "60px 30px" }} className="card-body">
        <div>
          <i
            style={{ padding: "20px" }}
            className="fa fa-4x fa-file-pdf-o row"
          />
        </div>
        {getDropzoneContent(
          getInputProps({ multiple: false, accept: "application/pdf" })
        )}
      </div>
    </div>
  );
};

export default PDFUpload;
