import React from "react";

const DownloadZone = onClick => {
  return (
    <div className="card bg-light text-center col-12 mx-auto rounded-lg">
      <div style={{ padding: "60px 30px" }} className="card-body">
        <div>
          <div className="col-12">
            <i style={{ padding: "20px" }} className="fa fa-4x fa-file-pdf-o" />
          </div>
          <button
            className="btn btn-success col-6"
            type="button"
            onClick={() => onClick()}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadZone;
