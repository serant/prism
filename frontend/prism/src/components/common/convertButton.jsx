import React from "react";
import Button from "react-bootstrap/Button";

const ConvertButton = ({ onClick, disabled }) => {
  return (
    <Button id="convertButton" onClick={() => onClick()} disabled={disabled}>
      Begin Conversion
    </Button>
  );
};

export default ConvertButton;
