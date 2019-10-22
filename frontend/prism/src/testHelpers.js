const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");
const { getDocument } = require("pdfjs-dist");

/**
 * This function defines the exeuction of an individual test:
 * STEP 1 | Sets the downloads directory to the correct path
 * STEP 2 | Uploads an input pdf to the webpage
 * STEP 3 | Selects the settings for the conversion
 * STEP 4 | Begins the conversion
 * STEP 5 | Validate the output (html content and/or pdf content)
 *
 * If the test does not complete within testSettings.timeout seconds,
 * Jest will fail the test
 *
 * @param {object} browserPage The Puppeteer.Page object used to navigate the webpage
 * @param {object} suiteSettings JSON object containing suite settings
 * @param {object} testSettings JSON object containing test settings
 */
function runTest(
  browserPage,
  { inputPath, suiteDownloadDirectory },
  { testName, testNumber, settings, output, timeout }
) {
  test(
    settings.join("-") || "default",
    async () => {
      // STEP 1 | Sets the downloads directory to the correct path
      // we structure the directory as such:
      // -> .tmp/{suiteNumber}-{suiteName}/{testNumber}-{testName}
      const testId = `${testNumber}-${testName}`;
      const testDownloadDir = path.join(suiteDownloadDirectory, testId);
      fs.mkdirSync(testDownloadDir);
      await setDownloadsDirectory(browserPage, testDownloadDir);

      // STEP 2 | Uploads an input pdf to the webpage
      await uploadFile(browserPage, inputPath);

      // STEP 3 | Selects the settings for the conversion
      await selectSettings(settings, browserPage);

      // STEP 4 | Begin the conversion
      await browserPage.click("#convertButton");

      // STEP 5 | Validate the output
      const { pdf: pdfOutput, html: htmlOutput } = output;
      if (!htmlOutput) await validateHtmlOutput(browserPage, htmlOutput);
      if (!pdfOutput) await validatePdfOutput(pdfOutput, testDownloadDir);
    },
    timeout * 1000
  );
}

/**
 * Opens an instance of Chrome using Puppeteer and navigates to PrismPDF home.
 * Ensures that the page is properly loaded before returning
 *
 * Returns:
 * @returns {object} browser The Puppeteer.Browser object to display the page on
 * @returns {object} page The Puppeteer.Page object to navigate the webpage with
 */
async function launchBrowser() {
  // First create a new instance of Chromium
  const browser = await puppeteer.launch({
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true
  });

  // Now navigate to PrismPDF homepage using page object
  const page = await browser.newPage();
  page.emulate({
    viewport: {
      width: 1900,
      height: 1080
    },
    userAgent: ""
  });
  await page.goto("https://prismpdf.com");

  // Wait for the sub-heading selector to apepar and an indicator that the page
  // is loaded
  await page.waitForSelector(".sub-heading");
  return { browser, page };
}

/**
 * Configures Chromium's downloads directory so that we can override the default
 * of using $HOME/Downloads
 * @param {object} page The Puppeteer.Page object to navigate with
 * @param {object} testDownloadDir The desired path to direct downlaods to
 */
async function setDownloadsDirectory(page, testDownloadDir) {
  await page._client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: testDownloadDir
  });
}

/**
 * Uses Puppeteer to upload a file to the DropZone on PrismPDF
 * @param {object} page The Puppeteer.Page object to navigate with
 * @param {object} pdfPath The path of the file to upload
 */
async function uploadFile(page, pdfPath) {
  const [fileChooser] = await Promise.all([
    page.waitForFileChooser(),
    page.click("#pdfUploadButton")
  ]);
  await fileChooser.accept([pdfPath]);
}

/**
 * Selects the switches on conversionZone to configure the pdf conversion settings
 * @param {object} settings list of settings to select (valid: 'doubleSided', 'collate')
 * @param {object} page The Puppeteer.Page object to navigate with
 */
async function selectSettings(settings, page) {
  if (settings.indexOf("doubleSided") > -1)
    await page.click("#doubleSidedSwitch");
  if (settings.indexOf("collate") > -1) await page.click("#collateSwitch");
}

/**
 * Validates the html content of the webpage for a given selector/value
 * @param {object} page The Puppeteer.Page object to navigate with
 * @param {object} output JSON object containing the desired html output
 * - output.html.selector -> selector of the html element to validate (i.e. #title)
 * - output.html.output -> desired contents of the html selector is (i.e. My Title)
 */
async function validateHtmlOutput(page, { html: { selector, output } }) {
  await page.waitForSelector(selector);
  const outputHtml = await page.$eval(selector, e => e.innerHTML);
  expect(outputHtml).toBe(output);
}

/**
 * Unzips an archive and returns the path of the contents
 * @param {string} archivePath The path of the archive to unzip
 */
async function unzipArchive(archivePath) {
  // Read in the archive to get a list of file paths
  const exportPath = archivePath.split(".zip")[0];

  const data = fs.readFileSync(archivePath);
  const zip = new JSZip();
  const { files } = await zip.loadAsync(data, { createFolders: true });

  // Extract file for each file path.
  // Create sub-directories as needed
  fs.mkdirSync(exportPath);

  let pdfs = [];
  Object.keys(files).forEach(async fn => {
    if (!files[fn]["dir"]) {
      const content = zip.file(fn);
      const dest = path.join(exportPath, fn);

      fs.mkdirSync(
        dest
          .split("/")
          .slice(0, -1)
          .join("/"),
        { recursive: true }
      );
      fs.writeFileSync(dest, content);
      pdfs.push(dest);
    }
  });
  return pdfs;
}

function getTestPdfPaths(pdfDir) {
  let paths = [];
  let pathList = fs.readdirSync(pdfDir);
  pathList.forEach(file => {
    file = path.join(pdfDir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) paths = paths.concat(getTestPdfPaths(file));
    else if (path.basename(file).split(".")[1] === "pdf") paths.push(file);
  });
  return paths;
}

/**
 * Goes through a zipped archive of pdf documents and compares their content
 * to that specified in the testInputs.
 *
 * @param {str} targetPdfPath
 * @param {str} downloadsDir
 */
async function validatePdfOutput(targetPdfPath, downloadsDir) {
  // First unzip the archive to get a list of all pdf paths
  const downloadedZip = fs
    .readdirSync(downloadsDir)
    .filter(f => f.includes(".zip"))[0];
  let inputPaths = await unzipArchive(downloadedZip);
  inputPaths = sortByBasename(inputPaths);

  // Now get a list of test input files
  let targetPaths = getTestPdfPaths(targetPdfPath);
  targetPaths = sortByBasename(targetPaths);

  if (inputPaths.length !== targetPaths.length) return false;

  // Compare all file names
  for (let i = 0; i < targetPaths.length; i++) {
    const targetFileName = path.basename(targetPaths[i]);
    const inputFileName = path.basename(inputPaths[i]);
    if (targetFileName !== inputFileName) return false;
  }

  // Now go through each pdf and verify that the content is identical
  for (let i = 0; i < targetPaths.length; i++) {
    if (!comparePdfs([targetPaths[i], inputPaths[i]]))
      console.log(targetPaths[i], " and ", inputPaths[i], " are not equal!");
    console.log(targetPaths[i], " and ", inputPaths[i], " are equal!");
  }
  console.log("all pdfs are equal!");
  return true;
}

/**
 * Compares a list of pdfs and returns whether the pdfs in the
 * list are identical or not.
 * @param {list} pdfPaths list of the paths of all pdf documents to compare
 */
const comparePdfs = async pdfPaths => {
  let compareData = [];
  for (let i = 0; i < pdfPaths.length; i++) {
    const pdf = await getDocument(fs.readFileSync(pdfPaths[0])).promise;
    compareData.push({ numPages: pdf.numPages });
  }

  return compareData.every(v => v["numPages"] === compareData[0]["numPages"]);
};

/**
 * HELPER FUNCTIONS
 */

/**
 * Sorts a list of files by its basename (rather than first letter of path)
 * @param {list} files List of files to sort by basename
 */
function sortByBasename(files) {
  return files.sort((a, b) => {
    return path.basename(a) < path.basename(b) ? -1 : 1;
  });
}

/**
 * Ensures that two arrays are identical in length, order and contents
 * @param {list} a First array to compare
 * @param {list} b Second array to compare
 */
function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

module.exports = {
  runTest,
  launchBrowser,
  selectSettings,
  setDownloadsDirectory,
  sortByBasename,
  unzipArchive,
  uploadFile,
  validateHtmlOutput,
  validatePdfOutput,
  comparePdfs
};
