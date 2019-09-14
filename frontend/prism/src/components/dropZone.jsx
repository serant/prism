import React from "react";
import Zone from "./common/zone";
import { useDropzone } from "react-dropzone";

const DropZone = props => {
  const { onDrop } = props;

  const maxSize = 31457280; // 30 MB

  const onDropAccepted = ([pdf]) => {
    // Added due to https://github.com/react-dropzone/react-dropzone/issues/276
    if (!pdf.name.endsWith(".pdf")) return;
    onDrop(pdf);
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
          <button className="btn btn-success col-6" type="button">
            Choose a PDF to upload
          </button>
          <p className="col-12">
            {isDragActive && !isDragReject && "drop here!"}
            {isDragReject && "Only PDF documents less than 30 MB accepted!"}
            {isFileTooLarge && "File size exceed maximum size of 30 MB"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DropZone;
