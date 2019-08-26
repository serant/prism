import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

const getDroponeContent = (parsing, inputProps) => {
  if (parsing) {
    return (
      <React.Fragment>
        <span
          className="spinner-grow spinner-grow-sm"
          role="status"
          aria-hidden="true"
        />
        Converting PDF...
      </React.Fragment>
    );
  } else {
    return (
      <React.Fragment>
        <div>
          <i
            style={{ padding: "20px" }}
            className="fa fa-4x fa-file-pdf-o row"
          />
        </div>

        <button className="btn btn-success row">
          <input {...inputProps} />
          Choose PDF to Upload...
        </button>
        <p style={{ padding: "10px" }} className="card-text text-center">
          or drag and drop one here
        </p>
      </React.Fragment>
    );
  }
};

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
      className="card bg-light text-center col-12 mx-auto rounded-lg"
      {...getRootProps()}
    >
      <div style={{ padding: "60px 30px" }} className="card-body">
        {getDroponeContent(
          props.parsing,
          getInputProps({ multiple: false, accept: "application/pdf" })
        )}
      </div>
    </div>
  );
};

export default PDFUpload;
