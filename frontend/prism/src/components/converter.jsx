import React, { useState } from "react";
import { splitPDF, parsePDFColors, zipPDFs } from "../tools/pdfParser";
import collateDocuments from "../tools/collate";
import { sortPages, calculateSavings, calculateProgress } from "../tools/utils";
import { saveAs } from "file-saver";
import ConversionZone from "./views/conversion";
import LoadingZone from "./views/loading";
import DownloadZone from "./views/download";

const Converter = () => {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [isConverted, setConverted] = useState(false);
  const [savings, setSavings] = useState(0);
  const [download, setDownload] = useState({ zip: null, zipName: "" });

  const handleProgress = (bw, color, total) => {
    setProgress(calculateProgress(bw, color, total));
    setSavings(calculateSavings(bw));
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
      {isConverted && (
        <DownloadZone
          onRedo={() => setConverted(false)}
          onDownload={() => handleDownload()}
          saved={savings}
        />
      )}
    </React.Fragment>
  );
};

export default Converter;
