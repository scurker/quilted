import puppeteer from 'puppeteer';
import { parse } from 'url';

export async function setPageOptions(page, options) {
  let { cookies, headers, userAgent, viewport } = options;

  if(typeof cookies !== 'undefined') {
    if(!Array.isArray(cookies)) {
      cookies = [cookies];
    }
    await page.setCookie(...cookies);
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
  const url = parse(urlString || '');

  if(!url || !url.protocol) {
    throw new Error('Url requires a valid protocol and host.');
  }

  const { args = [], timeout } = options
      , browser = await puppeteer.launch({ args: Array.isArray(args) ? args : [args], timeout })
      , page = await browser.newPage()
      , { coverage } = page;

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
      sameOrigin: !req.host ? true : req.host === url.host,
      ...req
    });
  });

  await Promise.all([
    options.js && coverage.startJSCoverage(),
    options.css && coverage.startCSSCoverage()
  ]);

  try {
    await page.goto(urlString, { waitUntil: 'networkidle0' });
  } catch (ex) {
    await browser.close();
    throw ex;
  }

  const [ jsCoverage, cssCoverage ] = await Promise.all([
    options.js ? coverage.stopJSCoverage() : Promise.resolve([]),
    options.css ? coverage.stopCSSCoverage() : Promise.resolve([])
  ]);

  let assets = []
    , entries = [ ...jsCoverage, ...cssCoverage ];

  if(options.sameOrigin) {
    entries = entries.filter(entry => requestMap.get(entry.url).sameOrigin);
  }

  for (const entry of entries) {
    let totalBytes = entry.text.length
      , usedBytes = 0
      , req = requestMap.get(entry.url) || {};

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