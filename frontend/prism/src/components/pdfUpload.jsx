import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

/**
 * Requirements:
 * 1. Only accept 1 file maximum [DONE]
 * 2. Reject non-pdfs [DONE]
 * 3. Asthetics [DONE]
 */

const PDFUpload = props => {
  const onDrop = useCallback(
    acceptedFiles => {
      const file = acceptedFiles[0];

      // Added due to https://github.com/react-dropzone/react-dropzone/issues/276
      if (!file.name.endsWith(".pdf")) return;

      props.onDrop(file);
    },
    [props]
  );
  const { getRootProps, getInputProps } = useDropzone({ onDrop });
  return (
    <div
      className="card bg-light text-center col-6 mx-auto rounded-lg"
      {...getRootProps()}
    >
      <div style={{ padding: "60px 30px" }} className="card-body">
        <div>
          <i
            style={{ padding: "20px" }}
            className="fa fa-4x fa-file-pdf-o row"
          />
        </div>

        <button className="btn btn-success row">
          <input
            {...getInputProps({ multiple: false, accept: "application/pdf" })}
          />
          Choose PDF to Upload
        </button>
        <p style={{ padding: "10px" }} className="card-text text-center">
          or drag and drop one here
        </p>
      </div>
    </div>
  );
};

export default PDFUpload;
