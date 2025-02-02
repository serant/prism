import React, { useState } from "react";
import Settings from "../common/settings";
import Upload from "../common/upload";
import ConvertButton from "../common/convertButton";

const Conversion = ({ onStartConversion }) => {
  // State hooks
  const [collate, setCollate] = useState(false);
  const [doubleSided, setDoubleSided] = useState(false);
  const [ignoreText, setIgnoreText] = useState(false);

  const [pdf, setPdf] = useState(null);

  // Component variables
  const maxSize = 31457280; // 30 MB

  const settings = [
    {
      name: "doubleSided",
      value: doubleSided,
      description:
        "Ensures b/w pages on the back of a color page are in the same pdf. Enable this if you plan to print double sided.",
      onChange: () => setDoubleSided(!doubleSided),
      label: "Double sided printing"
    },
    {
      name: "collate",
      description:
        "Each PDF will only have consecutive page numbers. Useful for printing long documents.",
      value: collate,
      onChange: () => setCollate(!collate),
      label: "Collate pages"
    },
    {
      name: "ignoreText",
      description: "Useful if you only care about printing pictures in color.",
      value: ignoreText,
      onChange: () => setIgnoreText(!ignoreText),
      label: "Ignore Colored Text"
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
            onClick={() =>
              onStartConversion(pdf, { collate, doubleSided, ignoreText })
            }
            disabled={pdf ? false : true}
          />
        </div>
      </div>
    </div>
  );
};

export default Conversion;
