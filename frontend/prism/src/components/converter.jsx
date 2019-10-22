import React, { useState } from "react";
import { splitPDF, parsePDFColors, zipPDFs } from "../tools/pdfParser";
import collateDocuments from "../tools/collate";
import { sortPages, calculateSavings, calculateProgress } from "../tools/utils";
import { saveAs } from "file-saver";
import ConversionZone from "./views/conversion";
import LoadingZone from "./views/loading";
import DownloadZone from "./views/download";
import ErrorZone from "./views/error";

const Converter = () => {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [isConverted, setConverted] = useState(false);
  const [error, setError] = useState(null);
  const [savings, setSavings] = useState(0);
  const [download, setDownload] = useState({ zip: null, zipName: "" });

  const handleProgress = (bw, color, total) => {
    setProgress(calculateProgress(bw, color, total));
    setSavings(calculateSavings(bw));
  };

  const failConversion = reason => {
    setError(reason);
    setLoading(false);
  };

  const parsePdf = async (pdfName, pdfData, { collate, doubleSided }) => {
    const data = new Uint8Array(pdfData);

    setMessage("Parsing Documents...");
    setProgress(0);
    setLoading(true);
    let { bwPages, colorPages } = await parsePDFColors(
      data,
      (bw, color, total) => handleProgress(bw, color, total),
      doubleSided
    );
    if (bwPages.length + colorPages.length === 0)
      return failConversion("Document is empty.");
    else if (bwPages.length + colorPages.length === 1)
      return failConversion("Document must have more than one page.");
    else if (bwPages.length === 0)
      return failConversion("All pages in document are colored.");
    else if (colorPages.length === 0)
      return failConversion("All pages in document are black and white.");

    bwPages = sortPages(bwPages);
    colorPages = sortPages(colorPages);

    setMessage("Splitting Documents...");
    const pdfBasename = pdfName.split(".pdf")[0];

    let documentMap = [
      { pages: bwPages, name: `${pdfBasename} BW.pdf`, data: null },
      { pages: colorPages, name: `${pdfBasename} Color.pdf`, data: null }
    ];

    if (collate) documentMap = collateDocuments(documentMap);

    documentMap = await splitPDF(data, documentMap);
    setMessage("Saving Documents...");

    const zip = await zipPDFs(documentMap, collate);
    const zipName = pdfBasename + ".zip";

    await setDownload({ zip, zipName });
    await saveAs(zip, zipName);
    setLoading(false);
  };

  const handleConversion = (pdf, { collate, doubleSided }) => {
    let fileReader = new FileReader();
    fileReader.onload = async () => {
      await parsePdf(pdf.name, fileReader.result, { collate, doubleSided });
      setConverted(true);
    };
    fileReader.readAsArrayBuffer(pdf);
  };

  const handleDownload = async () => {
    const { zip, zipName } = download;
    await saveAs(zip, zipName);
  };

  const handleRedo = () => {
    setError(null);
    setConverted(false);
  };

  return (
    // Render the correct zone depending on which
    // stage of parsing we're in
    <React.Fragment>
      {!isLoading && !isConverted && (
        <ConversionZone
          onStartConversion={(pdf, settings) => handleConversion(pdf, settings)}
        />
      )}

      {isLoading && (
        <LoadingZone percent={progress} message={message} saved={savings} />
      )}
      {error && <ErrorZone reason={error} onRedo={() => handleRedo()} />}
      {isConverted && !error && (
        <DownloadZone
          onRedo={() => handleRedo()}
          onDownload={() => handleDownload()}
          saved={savings}
        />
      )}
    </React.Fragment>
  );
};

export default Converter;
