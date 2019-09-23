import React from "react";
import ProgressBar from "react-bootstrap/ProgressBar";
import Spinner from "react-bootstrap/Spinner";

const Loading = ({ percent, message, saved }) => {
  return (
    <div className="container text-center">
      <Spinner animation="border" role="status">
        <span className="sr-only">Loading...</span>
      </Spinner>
      <p>${saved} saved so far!</p>
      <ProgressBar
        animated
        now={percent}
        label={`${message} (${percent}%)`}
      ></ProgressBar>
    </div>
  );
};

export default Loading;
