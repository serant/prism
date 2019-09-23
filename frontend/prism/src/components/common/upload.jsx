import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import Button from "react-bootstrap/Button";

const Upload = ({ onUpload, maxSize }) => {
  const [pdfName, setPdfName] = useState("");

  const onDropAccepted = ([pdf]) => {
    // Added due to https://github.com/react-dropzone/react-dropzone/issues/276
    if (!pdf.name.endsWith(".pdf")) return;
    setPdfName(pdf.name);
    onUpload(pdf);
  };

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

  return (
    <div className="text-center" {...getRootProps()}>
      <div className="container row bg-light rounded text-center mx-auto">
        <input {...getInputProps()} />

        <i style={{ padding: "20px" }} className="fa fa-4x fa-file-o col-12" />
        {pdfName && <p className="text-center">{pdfName}</p>}
        <Button className="col-12">Choose a PDF to upload</Button>
        <p className="col-12">
          {!isDragActive && "or drag and drop one here..."}
          {isDragActive && !isDragReject && "drop here!"}
          {isDragReject && "Only PDF documents less than 30 MB accepted!"}
          {isFileTooLarge && "File size exceed maximum size of 30 MB"}
        </p>
      </div>
    </div>
  );
};

export default Upload;
