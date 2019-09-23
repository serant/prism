import React, { useState } from "react";
import Settings from "../common/settings";
import Upload from "../common/upload";
import ConvertButton from "../common/convertButton";

const Conversion = ({ onStartConversion }) => {
  // State hooks
  const [collate, setCollate] = useState(false);
  const [doubleSided, setDoubleSided] = useState(false);
  const [pdf, setPdf] = useState(null);

  // Component variables
  const maxSize = 31457280; // 30 MB

  const settings = [
    {
      name: "doubleSided",
      value: doubleSided,
      onChange: () => setDoubleSided(!doubleSided),
      label: "Double sided printing"
    },
    {
      name: "collate",
      value: collate,
      onChange: () => setCollate(!collate),
      label: "Collate pages"
    }
  ];

  return (
    <div className="container ">
      <div className="row">
        <div className="col-md">
          <Upload onUpload={pdf => setPdf(pdf)} maxSize={maxSize} />
        </div>
        <div className="col-md">
          <Settings settings={settings} />
        </div>
        <div
          className="container mx-auto text-center"
          style={{ padding: "20px" }}
        >
          <ConvertButton
            onClick={() => onStartConversion(pdf, { collate, doubleSided })}
            disabled={pdf ? false : true}
          />
        </div>
      </div>
    </div>
  );
};

export default Conversion;
