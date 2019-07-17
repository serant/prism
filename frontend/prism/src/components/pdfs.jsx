import React, { Component } from "react";
import Pdf from "./pdf";

class Pdfs extends Component {
  render() {
    const { onDownload, pdfs, fileName } = this.props;

    return (
      <div>
        {pdfs.map(pdf => (
          <Pdf fileName={fileName} onDownload={onDownload} pdf={pdf} />
        ))}
      </div>
    );
  }
}

export default Pdfs;
