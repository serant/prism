import React from "react";
import Button from "react-bootstrap/Button";

const Download = ({ onRedo, onDownload, saved }) => {
  return (
    <div className="container">
      <div className="row">
        <h4 className="col-12 text-center">Conversion Complete!</h4>
        {saved > 0 && (
          <h5 className="col-12 text-center">
            You've saved ${saved}
            <sup>*</sup>
          </h5>
        )}
        <p className="col-12">
          Your download should begin in a few moments. Or click{" "}
          <a href="#" onClick={onDownload}>
            here
          </a>{" "}
          to start the download immediately.
        </p>

        <Button className="text-center mx-auto" onClick={onRedo}>
          Split another document
        </Button>
      </div>
    </div>
  );
};

export default Download;
