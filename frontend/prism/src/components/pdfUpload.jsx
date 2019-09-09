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

  const onDropAccepted = acceptedFiles => {
    console.log(isFileTooLarge);
    console.log(acceptedFiles);
    const droppedPdf = acceptedFiles[0];
    console.log(droppedPdf.size);
    // Added due to https://github.com/react-dropzone/react-dropzone/issues/276
    if (!droppedPdf.name.endsWith(".pdf")) return;

    let fileReader = new FileReader();
    fileReader.onload = async () => {
      await parsePdf(droppedPdf.name, fileReader.result);
    };

    // fileReader.readAsArrayBuffer(droppedPdf);
  };

  const maxSize = 31457280;

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    rejectedFiles
  } = useDropzone({
    onDropAccepted,
    maxSize,
    multiple: false,
    accept: "application/pdf"
  });
  const isFileTooLarge =
    rejectedFiles.length > 0 && rejectedFiles[0].size > maxSize;

  const getButtonContent = () => {
    return (
      <React.Fragment>
        <span
          className={isLoading ? "spinner-border spinner-border-sm" : ""}
          role="status"
          aria-hidden="true"
        ></span>
        {isLoading && `${message} (${progress}) %`}
        {!isLoading && "Choose a PDF to upload"}
      </React.Fragment>
    );
  };

  const getLabelContent = () => {
    return (
      <p className="col-12">
        {!isDragActive &&
          !isLoading &&
          !isFileTooLarge &&
          "or drag and drop one here"}

        {isDragActive && !isDragReject && "drop here!"}
        {isDragReject && "Only PDF documents less than 30 MB accepted!"}
        {isFileTooLarge && "File size exceed maximum size of 30 MB"}
        {isLoading && `${(bwPages.length * 0.3).toFixed(2)} saved so far`}
        <sup>*</sup>
      </p>
    );
  };

  return (
    <div
      className="card bg-light text-center col-12 mx-auto rounded-lg"
      {...getRootProps()}
    >
      <div style={{ padding: "60px 30px" }} className="card-body">
        <div>
          <input {...getInputProps()} />
          <i
            style={{ padding: "20px" }}
            className="fa fa-4x fa-file-pdf-o col-12"
          />
          <button
            className="btn btn-success col-6"
            type="button"
            disabled={isLoading ? true : false}
          >
            {getButtonContent()}
          </button>
          {getLabelContent()}
        </div>
      </div>
    </div>
  );
};

export default PDFUpload;
