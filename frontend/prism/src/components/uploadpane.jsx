import React, { Component } from "react";
import Dropzone from "react-dropzone";
import classNames from "classnames";

class UploadPane extends Component {
  state = {
    acceptedFiles: null
  };

  render() {
    return (
      <Dropzone
        onDrop={(acceptedFiles, rejectedFiles) => {
          this.props.onDrop(acceptedFiles);
        }}
      >
        {({ getRootProps, getInputProps, isDragActive }) => {
          return (
            <div
              {...getRootProps()}
              className={classNames("dropzone", {
                "dropzone--isActive": isDragActive
              })}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop files here...</p>
              ) : (
                <p>
                  Try dropping some files here, or click to select files to
                  upload.
                </p>
              )}
            </div>
          );
        }}
      </Dropzone>
    );
  }
}

export default UploadPane;
