const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");
const { getDocument } = require("pdfjs-dist");
const pdfjs = require("pdfjs-dist/build/pdf");
const pdfjsWorker = require("pdfjs-dist/build/pdf.worker.entry");
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * MAIN TEST RUNNER
 *
 * First some definitions:
 * Suite -> a set of tests. A suite should have one 'inputPath' which is
 * the pdf to convert. For example, the suite "bwPdf" has a set of tests
 * that all use ./testData/1-bwPdf/1-Thirugnanam,Seran_MarketingReport2018.pdf
 * as its 'inputPath'.
 *
 * Test -> an individual test using an 'inputPath' defined by its enclosing suite.
 * The test can be seen as an actual conversion of the pdf. It has a list of settings
 * to test (i.e. colalted and double sided) and a desired output (i.e. a specific html
 * element value and pdf output).
 *
 * Tests are organized as follows:
 * - Suite 1
 *     - Test 1
 *     - Test 2
 *     - ...
 * - Suite 2
 *     - ...
 * - ... Suite n
 *
 * This function is where we create each suite. Here all suites are as Jest.test objects.
 * Inside each suite we also define each test.
 */
describe("Test Prism App", () => {
  const contents = fs.readFileSync("testPlan.json");
  const { suites } = JSON.parse(contents);
  const saveDir = "./tmp";

  // Create/delete temporary test directory for storing pdf test data
  beforeAll(() => !fs.existsSync(saveDir) && fs.mkdirSync(saveDir));
  afterAll(() => fs.existsSync(saveDir) && fs.rmdirSync(saveDir));

  // Now go through each test suite and create each test instance
  suites.forEach(suiteSettings => {
    const { suiteName, suiteNumber, tests, inputPath } = suiteSettings;
    const suiteId = `${suiteNumber}-${suiteName}`;
    const suiteDownloadDir = path.join(saveDir, suiteId);
    describe(suiteId, () => {
      let browser, browserPage;

      // Before every test suite, launch a new browser instance and close afterwards
      beforeAll(async () => {
        // Make a downloads directory for the suite
        !fs.existsSync(suiteDownloadDir) && fs.mkdirSync(suiteDownloadDir);
        ({ browser, browserPage } = await launchBrowser());
      }, 10000);
      afterAll(async () => browser.close());

      // Before each test, ensure that we reload the webpage
      beforeEach(
        async () => await browserPage.goto("http://localhost:3000/"),
        10000
      );
      // Create each test
      tests.forEach(({ testName, testNumber, settings, timeout, output }) =>
        test(
          testName,
          async () => {
            console.log("Starting TEST: ", testName);
            console.log("STEP 1 | Set downloads directory to the correct path");
            // we structure the directory as such:
            // -> .tmp/{suiteNumber}-{suiteName}/{testNumber}-{testName}
            const testId = `${testNumber}-${testName}`;
            const testDownloadDir = path.join(suiteDownloadDir, testId);
            !fs.existsSync(testDownloadDir) && fs.mkdirSync(testDownloadDir);
            await setDownloadsDirectory(browserPage, testDownloadDir);

            console.log("STEP 2 | Uploads an input pdf to the webpage");
            await uploadFile(browserPage, inputPath);

            console.log("STEP 3 | Select the settings for the conversion");
            await selectSettings(settings, browserPage);

            console.log("STEP 4 | Begin the conversion");
            await browserPage.click("#convertButton");

            console.log("STEP 5 | Validate the html output");
            const { pdf, html } = output;
            if (html) await validateHtmlOutput(browserPage, html);

            if (pdf) {
              // First we need to wait for the pdf
              console.log("STEP 6 | Wait for PDF to finish downloading");
              const testDownloadPdf = await waitForDownload(testDownloadDir);
              console.log("STEP 7 | Validate the pdf output");
              await validatePdfOutput(pdf, testDownloadPdf);
            }
          },
          timeout * 1000
        )
      );
    });
  });
});

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
  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: false,
    slowMo: 30
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
  await page.goto("http://localhost:3000/");

  // Wait for the sub-heading selector to apepar and an indicator that the page
  // is loaded
  await page.waitForSelector(".sub-heading");
  return { browser, browserPage: page };
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
    page.waitForFileChooser({ timeout: 0 }),
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

  if (settings.indexOf("ignoreText") > -1)
    await page.click("#ignoreTextSwitch");
}

/**
 * Validates the html content of the webpage for a given selector/value
 * @param {object} page The Puppeteer.Page object to navigate with
 * @param {object} output JSON object containing the desired html output
 * - output.html.selector -> selector of the html element to validate (i.e. #title)
 * - output.html.output -> desired contents of the html selector is (i.e. My Title)
 */
async function validateHtmlOutput(page, { selector, output }) {
  await page.waitForSelector(selector, { timeout: 0 });
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
  await zip.loadAsync(data, { createFolders: true });
  fs.mkdirSync(exportPath);

  let pdfs = [];
  return new Promise(resolve => {
    let promises = [];
    zip.forEach(async (relativePath, file) => {
      promises.push(
        new Promise(resUnzip => {
          if (file["dir"]) resUnzip();
          const dest = path.join(exportPath, relativePath);

          fs.mkdirSync(path.dirname(dest), { recursive: true });

          zip
            .file(relativePath)
            .async("nodebuffer")
            .then(content => {
              fs.writeFileSync(dest, content);
              pdfs.push(dest);
              return resUnzip(dest);
            });
        })
      );
    });
    Promise.all(promises).then(() => {
      return resolve(pdfs);
    });
  });
}

function getTestPdfPaths(pdfDir) {
  let paths = [];
  let pathList = fs.readdirSync(pdfDir);
  pathList.forEach(file => {
    file = path.join(pdfDir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) paths = paths.concat(getTestPdfPaths(file));
    else if (path.extname(file) === ".pdf") paths.push(file);
  });
  return paths;
}

async function waitForDownload(downloadsDir, timeout) {
  const sleep = ms => {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  };

  return new Promise(async (resolve, reject) => {
    // First wait until we have a .zip file in the folder
    let fileName = null;

    do {
      fileName = fs
        .readdirSync(downloadsDir)
        .filter(f => path.extname(f) === ".zip")[0];
      await sleep(100);
    } while (!fileName);

    resolve(path.join(downloadsDir, fileName));
  });
}

/**
 * Goes through a zipped archive of pdf documents and compares their content
 * to that specified in the testInputs.
 *
 * @param {str} targetPdfPath
 * @param {str} downloadsDir
 */
async function validatePdfOutput(targetPdfPath, downloadedZip) {
  // First unzip the archive to get a list of all pdf paths
  let inputPaths = await unzipArchive(downloadedZip);
  inputPaths = sortByBasename(inputPaths);

  // Now get a list of test input files
  let targetPaths = getTestPdfPaths(targetPdfPath);
  targetPaths = sortByBasename(targetPaths);

  expect(inputPaths.length).toBe(targetPaths.length);

  // Compare all file names
  for (let i = 0; i < targetPaths.length; i++) {
    const targetFileName = path.basename(targetPaths[i]);
    const inputFileName = path.basename(inputPaths[i]);
    expect(targetFileName).toBe(inputFileName);
  }

  // Now go through each pdf and verify that the content is identical
  for (let i = 0; i < targetPaths.length; i++) {
    if (!targetPaths[i].includes("pdf")) continue;
    expect(comparePdfs([targetPaths[i], inputPaths[i]])).toBeTruthy();
  }
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
