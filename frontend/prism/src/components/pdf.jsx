import React, { Component } from "react";

class Pdf extends Component {
  render() {
    return (
      <div>
        <span className="badge m-2 badge-primary">
          {this.props.pdf.fileName}
        </span>
        <button
          onClick={() => this.props.onDownload(this.props.pdf)}
          className="btn btn-secondary btn-sm"
        >
          Download
        </button>
      </div>
    );
  }
}

export default Pdf;
