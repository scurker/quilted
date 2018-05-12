import puppeteer from 'puppeteer';

let browserWSEndpoint;

async function launch(opts = {}) {
  let browser;

  if(!browserWSEndpoint) {
    browser = await puppeteer.launch(opts);
    browserWSEndpoint = browser.wsEndpoint();
  } else {
    browser = puppeteer.connect({ browserWSEndpoint });
  }

  return browser;
}

export default launch;