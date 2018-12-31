import React, { Component } from "react";
import Dropzone from "react-dropzone";
//import classNames from "classnames";

class FilesDrop extends Component {
  onDrop = (acceptedFiles, rejectedFiles) => {
    console.log(acceptedFiles);
  };

  render() {
    return (
      <Dropzone accept="image/*">
        {({
          getRootProps,
          getInputProps,
          isDragActive,
          isDragAccept,
          isDragReject,
          acceptedFiles,
          rejectedFiles
        }) => {
          const baseStyle = {
            width: 200,
            height: 200,
            borderWidth: 10,
            borderColor: "#666",
            borderStyle: "dashed",
            borderRadius: 5
          };

          let styles = { ...baseStyle };
          //styles = isDragActive ? { ...styles, ...this.activeStyle } : styles;
          //styles = isDragReject ? { ...styles, ...this.rejectStyle } : styles;

          return (
            <div {...getRootProps()} style={styles}>
              <input {...getInputProps()} />
              <div>{isDragAccept ? "Drop" : "Drag"} files here...</div>
              {isDragReject && <div>Unsupported file type...</div>}
            </div>
          );
        }}
      </Dropzone>
    );
  }
}

export default FilesDrop;
