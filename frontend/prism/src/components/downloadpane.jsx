import React, { Component } from "react";
import Pdfs from "./pdfs";

class DownloadPane extends Component {
  handleDownload() {
    console.log("Start Download");
  }
  render() {
    return (
      <div className="column">
        <Pdfs pdfs={this.props.pdfs} onDownload={this.handleDownload} />
        <button className="btn-primary">Download</button>
      </div>
    );
  }
}

export default DownloadPane;
