import React from "react";
import Button from "react-bootstrap/Button";

const Error = ({ onRedo, reason }) => {
  return (
    <div className="container">
      <div className="row">
        <h2 id="failedErrorHeader" className="col-12 text-center">
          Conversion Unsuccessful
        </h2>
        <h5 id="failedReasonHeader" className="col-12 text-center">
          {reason}
        </h5>
        <Button className="text-center mx-auto" onClick={onRedo}>
          Split another document
        </Button>
      </div>
    </div>
  );
};

export default Error;
