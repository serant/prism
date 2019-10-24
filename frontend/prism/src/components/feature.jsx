import React from "react";

const Feature = ({ iconClass, heading, description }) => {
  return (
    <React.Fragment>
      <i className={`fa fa-2x ${iconClass} row`} style={{ padding: "15px" }} />
      <h5>{heading}</h5>
      <p>{description}</p>
    </React.Fragment>
  );
};

const FeatureSet = () => {
  return (
    <div className="row text-center">
      <div className="col-sm">
        <Feature
          iconClass="fa-usd"
          heading="Cut Printing Costs"
          description="Pay printers charge a premium when printing colored PDFs -
      even for black/white pages. PrismPDF splits a PDF by page
      color so that you only need to pay a premium for the color
      pages. This is perfect if you're in a co-working space,
      college, or using a printing service."
        />
      </div>
      <div className="col-sm">
        <Feature
          iconClass="fa-lock"
          heading="No File Transfer"
          description="The conversion is done entirely in your browser. This means that your documents never leave your computer and are not transferred over the web."
        />
      </div>
      {/* <div className="col-sm">
        <Feature
          iconClass="fa-lightbulb-o"
          heading="Accurate and Intelligent"
          description="PrismPDF supports collating pages and double sided documents.
      It can even ignore colored text so that you are paying for
      color printing on pages with images."
        />
      </div> */}
    </div>
  );
};

export default FeatureSet;
