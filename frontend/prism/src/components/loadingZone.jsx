import React, { useState } from "react";

// Input: File Name
// Output: conversionSettings, onStartConversion

const LoadingZone = ({ percent, message }) => {
  return (
    <div className="card bg-light text-center col-12 mx-auto rounded-lg">
      <div style={{ padding: "60px 30px" }} className="card-body">
        <div>
          <div className="progress">
            <div
              className="progress-bar progress-bar-striped progress-bar-animated"
              role="progressbar"
              style={{ width: `${percent}%` }}
              aria-valuenow="10"
              aria-valuemin="0"
              aria-valuemax="100"
            >
              {message} ({percent})%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingZone;
