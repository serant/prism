import React from "react";
import Dropzone from "react-dropzone";

function PDFDropZone({ onDrop }) {
  return (
    <Dropzone onDrop={onDrop}>
      {({ getRootProps, getInputProps }) => (
        <section>
          <div
            style={{ height: "200px", margin: 20 }}
            className="card bg-light text-center col-4 mx-auto"
            {...getRootProps()}
          >
            <div className="card-body">
              <input {...getInputProps()} />
              <span className="align-middle align-text-middle">
                Drag and drop a PDF here, or click to select PDF
              </span>
            </div>
          </div>
        </section>
      )}
    </Dropzone>
  );
}

export default PDFDropZone;
