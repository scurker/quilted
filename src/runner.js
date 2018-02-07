import puppeteer from 'puppeteer';
import { parse } from 'url';

async function setPageOptions(page, options) {
  let { cookies, headers, userAgent, viewport } = options;

  if(typeof cookies !== 'undefined') {
    if(!Array.isArray(cookies)) {
      cookies = [cookies];
    }
    await page.setCookies(...cookies);
  }

  if(typeof headers !== 'undefined') {
    await page.setExtraHTTPHeaders(headers);
  }

  if(typeof userAgent !== 'undefined') {
    await page.setUserAgent(userAgent);
  }

  if(typeof viewport !== 'undefined') {
    await page.setViewport(viewport);
  }
}

export default async function(urlString, options = {}) {
  const { args, timeout } = options
      , browser = await puppeteer.launch({ args, timeout })
      , page = await browser.newPage()
      , { coverage } = page
      , url = parse(urlString);

  if(!url || !url.protocol) {
    throw new Error('A valid url is required.');
  }

  // Set default options
  options = { js: true, css: true, ...options };
  await setPageOptions(page, options);

  // Map the requests to match covered requests later
  let requestMap = new Map();
  page.on('request', request => {
    let requestUrl = request.url()
      , req = parse(requestUrl);
    requestMap.set(requestUrl, {
      type: request.resourceType(),
      headers: request.headers(),
      sameOrigin: req.host === url.host,
      ...req
    });
  });

  const pageFinished = new Promise(resolve => {
    page.on('requestfinished', resolve);
  });

  await Promise.all([
    options.js && coverage.startJSCoverage(),
    options.css && coverage.startCSSCoverage()
  ]);

  try {
    await page.goto(urlString);
  } catch (ex) {
    throw ex;
  }

  const [ jsCoverage, cssCoverage ] = await Promise.all([
    options.js ? coverage.stopJSCoverage() : [],
    options.css ? coverage.stopCSSCoverage() : []
  ]);

  await pageFinished;


  let assets = []
    , entries = [ ...jsCoverage, ...cssCoverage ];

  if(options.sameOrigin) {
    entries = entries.filter(entry => requestMap.get(entry.url).sameOrigin);
  }

  for (const entry of entries) {
    let totalBytes = entry.text.length
      , usedBytes = 0
      , req = requestMap.get(entry.url);

    for (const range of entry.ranges) {
      usedBytes += range.end - range.start;
    }

    assets.push({
      path: req.sameOrigin ? req.path : req.href,
      type: req.type,
      totalBytes,
      usedBytes,
      unusedBytes: totalBytes - usedBytes,
      coverage: totalBytes !== usedBytes ? usedBytes / totalBytes * 100 : 100
    });
  }

  await browser.close();

  let totalBytes = assets.reduce((totalBytes, assets) => totalBytes + assets.totalBytes, 0)
    , totalUsedBytes = assets.reduce((totalUsedBytes, assets) => totalUsedBytes + assets.usedBytes, 0);

  return {
    url: urlString,
    host: parse(url).host,
    totalBytes,
    totalUsedBytes,
    totalCoverage: totalUsedBytes / totalBytes * 100,
    coverages: assets
  };
}