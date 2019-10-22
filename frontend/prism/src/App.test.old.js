const puppeteer = require("puppeteer");
const fs = require("fs");
const contents = fs.readFileSync("testPlan.json");
const testPlan = JSON.parse(contents);
const { suites, globalSettings } = testPlan;

const launchBrowser = async () => {
  let browser = await puppeteer.launch({
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: false
    // slowMo: 50
  });
  let page = await browser.newPage();
  page.emulate({
    viewport: {
      width: 1900,
      height: 1080
    },
    userAgent: ""
  });
  await page.goto("http://localhost:3000/");
  await page.waitForSelector(".sub-heading");
  return { browser, page };
};

const convertPdf = async (page, pdfPath, settings) => {
  const [fileChooser] = await Promise.all([
    page.waitForFileChooser(),
    page.click("#pdf-upload-button")
  ]);
  await fileChooser.accept([pdfPath]);
  if (settings.indexOf("doubleSided") > -1)
    await page.click("#doubleSidedSwitch");

  if (settings.indexOf("collate") > -1) await page.click("#collateSwitch");

  await page.click("#convert-button");
};

const runSuite = (page, { name, pdfPath }, settings) => {
  test(settings, async () => {
    await convertPdf(page, pdfPath, settings);
    await page.waitForSelector("#conversionCompleteHeader");
    const outputHtml = await page.$eval(
      "#conversionCompleteHeader",
      e => e.innerHTML
    );
    expect(outputHtml).toBe("Conversion Complete!");
  });

  test(settings, async () => {
    await convertPdf(page, pdfPath, settings);
    await page.waitForSelector("#conversionCompleteHeader");
    const outputHtml = await page.$eval(
      "#conversionCompleteHeader",
      e => e.innerHTML
    );
    expect(outputHtml).toBe("Conversion Complete!");
  });

  test(settings, async () => {
    await convertPdf(page, pdfPath, ["doubleSided", settings]);
    await page.waitForSelector("#conversionCompleteHeader");
    const outputHtml = await page.$eval(
      "#conversionCompleteHeader",
      e => e.innerHTML
    );
    expect(outputHtml).toBe("Conversion Complete!");
  });

  test(settings, async () => {
    await convertPdf(page, pdfPath, settings);
    await page.waitForSelector("#conversionCompleteHeader");
    const outputHtml = await page.$eval(
      "#conversionCompleteHeader",
      e => e.innerHTML
    );
    expect(outputHtml).toBe("Conversion Complete!");
  });
};

describe("Verify Prism Uploads", () => {
  let browser = null,
    page = null;

  beforeAll(async () => {
    return ({ browser, page } = await launchBrowser());
  });
  beforeEach(async () => await page.goto("http://localhost:3000/"));
  afterAll(() => browser.close());

  for (let i = 0; i < suites.length; i++) {
    runSuite(page, suites[i], globalSettings);
  }
});
