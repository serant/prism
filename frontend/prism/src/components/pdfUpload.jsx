import React, { useState } from "react";
import { splitPDF, parsePDFColors, zipPDF } from "../tools/pdfParser";
import { saveAs } from "file-saver";
import DropZone from "./dropZone";
import ConversionZone from "./conversionZone";
import LoadingZone from "./loadingZone";
import DownloadZone from "./downloadZone";

const PDFUpload = () => {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [isDropped, setDropped] = useState(false);
  const [isConverted, setConverted] = useState(false);
  const [bwPages, setBwPages] = useState([]);
  const [pdf, setPdf] = useState(null);
  const [zip, setZip] = useState({ zip: null, zipName: "" });

  const handleProgress = (bwPages, colorPages, totalPages) => {
    setBwPages(bwPages);
    setProgress(
      Math.round(((bwPages.length + colorPages.length) * 100) / totalPages)
    );
  };

  const parsePdf = async (pdfName, pdfData) => {
    const data = new Uint8Array(pdfData);

    setMessage("Parsing Documents...");
    setBwPages([]);
    setProgress(0);
    setLoading(true);

    let { bwPages, colorPages } = await parsePDFColors(data, handleProgress);

    bwPages = bwPages.sort((a, b) => {
      return a - b;
    });
    colorPages = colorPages.sort((a, b) => {
      return a - b;
    });

    setMessage("Splitting Documents...");
    const { bwPDF, colorPDF } = await splitPDF(data, bwPages, colorPages);
    const fileBase = pdfName.split(".pdf")[0];
    const bwName = fileBase + " BW.pdf";
    const colorName = fileBase + " Color.pdf";
    const zipName = fileBase + ".zip";
    setMessage("Saving Documents...");

    const zip = await zipPDF(
      { name: bwName, data: bwPDF },
      { name: colorName, data: colorPDF }
    );

    setZip({ zip, zipName });

    await saveAs(zip, zipName);

    setLoading(false);
  };

  const handleDrop = pdf => {
    setPdf(pdf);
    setDropped(true);
  };

  const handleConversion = ({ collate }) => {
    let fileReader = new FileReader();
    fileReader.onload = async () => {
      await parsePdf(pdf.name, fileReader.result);
      setConverted(true);
    };
    fileReader.readAsArrayBuffer(pdf);
  };

  const handleDownload = () => {
    // return saveAs(...zip);
  };

  return (
    <React.Fragment>
      {!isLoading && !isDropped && <DropZone onDrop={pdf => handleDrop(pdf)} />}
      {!isLoading && isDropped && !isConverted && (
        <ConversionZone
          onStartConversion={settings => handleConversion(settings)}
        />
      )}

      {isLoading && <LoadingZone percent={progress} message={message} />}
      {isConverted && <DownloadZone onClick={() => handleDownload()} />}
    </React.Fragment>
  );
};

export default PDFUpload;
