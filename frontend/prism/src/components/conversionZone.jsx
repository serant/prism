import React, { useState } from "react";

// Input: File Name
// Output: conversionSettings, onStartConversion

const ConversionZone = ({ pdfName, onStartConversion }) => {
  const [collate, setCollate] = useState(true);
  const [doubleSided, setDoubleSided] = useState(false);

  return (
    <div className="card bg-light text-center col-12 mx-auto rounded-lg">
      <div style={{ padding: "60px 30px" }} className="card-body">
        <div>
          <div className="col-12">
            <i style={{ padding: "20px" }} className="fa fa-4x fa-file-pdf-o" />
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                value=""
                defaultChecked={collate}
                onChange={() => setCollate(!collate)}
                id="defaultCheck1"
              ></input>
              <label className="form-check-label">Collate</label>
            </div>
          </div>
          <button
            className="btn btn-success col-6"
            type="button"
            onClick={() => onStartConversion({ collate, doubleSided })}
          >
            Begin Conversion!
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversionZone;
