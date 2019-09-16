import React from "react";
import Button from "react-bootstrap/Button";

const ConvertButton = ({ onClick, disabled }) => {
  return (
    <Button onClick={() => onClick()} disabled={disabled}>
      Begin Conversion
    </Button>
  );
};

export default ConvertButton;
