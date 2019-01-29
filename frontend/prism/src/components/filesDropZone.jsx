import React, { Component } from "react";
import Dropzone from "react-dropzone";
import classNames from "classnames";

class FilesDrop extends Component {
  onDrop = (acceptedFiles, rejectedFiles) => {
    //console.log(acceptedFiles);
    const url = "http://localhost:3000/api/conversions";
    fetch(url, {
      method: "POST",
      body: {
        key: "conversionPdf",
        value: acceptedFiles
      }
    }).then(function(response) {
      console.log(response);
      // return response.json();
    });
  };

  render() {
    return (
      <Dropzone onDrop={this.onDrop}>
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

export default FilesDrop;
