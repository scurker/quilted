import yargs from 'yargs';
import runner from './runner';
import stats from './stats';

const BASIC_OPTIONS = 'Basic options:';
const PUPPETEER_OPTIONS = 'Puppeteer options:';

const _yargs = yargs.usage('\nUsage: $0 <url> [options]')
  .options({

    // Basic Options
    'no-css': {
      type: 'boolean',
      describe: 'disables css code coverage',
      group: BASIC_OPTIONS
    },
    'no-js': {
      type: 'boolean',
      describe: 'disables js code coverage',
      group: BASIC_OPTIONS
    },
    origin: {
      type: 'boolean',
      alias: 'o',
      describe: 'only cover same-origin assets',
      group: BASIC_OPTIONS
    },

    // Puppeteer Options
    timeout: {
      type: 'number',
      alias: 't',
      describe: 'maximum number of milliseconds to wait for the browser to start',
      group: PUPPETEER_OPTIONS
    },
    viewportWidth: {
      type: 'number',
      alias: 'vw',
      describe: 'sets viewport width for page render',
      group: PUPPETEER_OPTIONS
    },
    viewportHeight: {
      type: 'number',
      alias: 'vh',
      describe: 'sets viewport height for page render',
      group: PUPPETEER_OPTIONS
    },
    viewport: {
      type: 'string',
      alias: 'V',
      describe: 'sets viewport for page render i.e. 800x600',
      group: PUPPETEER_OPTIONS
    },
    userAgent: {
      type: 'string',
      alias: 'ua',
      describe: 'sets the user agent for the request',
      group: PUPPETEER_OPTIONS
    },
    headers: {
      type: 'string',
      alias: 'H',
      describe: 'sets headers for the page request\nexample: $0 <url> -H "X-Header: 123"',
      group: PUPPETEER_OPTIONS
    },

  })
  .array('headers')
  .alias('help', 'h')
  .alias('version', 'v')
  .help();

function parseHeaders(headers) {
  return headers.reduce((headers, headerString) => {
    let [ key, value ] = headerString.split(/:\s+/);

    if (key && value) {
      headers[key] = value;
    }

    return headers;
  }, {});
}

(async function () {
  let [ url ] = _yargs.argv._
    , { origin, noCss, noJs, viewportHeight, viewportWidth, viewport, headers, userAgent } = yargs.argv;

  if (!url) {
    yargs.showHelp();
    return;
  }

  if (viewport) {
    [ viewportWidth, viewportHeight ] = viewport.split('x').map(x => parseInt(x, 10) || void 0);
  }

  if (typeof viewportWidth === 'undefined' && viewportHeight && typeof viewportHeight === 'number') {
    viewportWidth = ~~(viewportHeight * (4/3));
  }

  if (typeof viewportHeight === 'undefined' && viewportWidth && typeof viewportWidth === 'number') {
    viewportHeight = ~~(viewportHeight * (3/4));
  }

  if (viewportHeight && viewportWidth) {
    viewport = { height: viewportHeight, width: viewportWidth };
  }

  if (headers) {
    headers = parseHeaders(headers);
  }

  const coverage = await runner(url, { sameOrigin: origin, css: !noCss, js: !noJs, viewport, headers, userAgent });

  console.log(stats(coverage));
})();