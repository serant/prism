import React, { Component } from "react";
import Dropzone from "react-dropzone";
import classNames from "classnames";
import axios from "axios";

class FilesDrop extends Component {
  render() {
    const baseStyle = {
      width: 200,
      height: 200,
      borderWidth: 2,
      borderColor: "#666",
      borderStyle: "dashed",
      borderRadius: 5
    };
    const activeStyle = {
      borderStyle: "solid",
      borderColor: "#6c6",
      backgroundColor: "#eee"
    };
    const rejectStyle = {
      borderStyle: "solid",
      borderColor: "#c66",
      backgroundColor: "#eee"
    };
    return (
      <Dropzone onDrop={this.props.onDrop}>
        {({
          getRootProps,
          getInputProps,
          isDragActive,
          isDragAccept,
          isDragReject,
          acceptedFiles,
          rejectedFiles
        }) => {
          let styles = { ...baseStyle };
          styles = isDragActive ? { ...styles, ...activeStyle } : styles;
          styles = isDragReject ? { ...styles, ...rejectStyle } : styles;

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
