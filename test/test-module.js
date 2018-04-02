import path from 'path';
import server from 'http-server';
import { test } from 'ava';
import _quilted from '../src/';

const host = 'http://localhost';
const port = 8080;
const url = `${host}:${port}`;

var quilted;
if(process.env.TRAVIS) {
  // Travis CI currently doesn't run Chrome headless in sandboxed mode
  // Ref: https://docs.travis-ci.com/user/chrome
  // Ref: https://github.com/travis-ci/travis-ci/issues/8836
  quilted = (url, opts) => _quilted(url, { ...opts, args: '--no-sandbox' });
} else {
  quilted = _quilted;
}

var httpServer;
test.before(async () => {
  httpServer = server.createServer({ root: path.resolve(__dirname, 'fixtures') });
  await new Promise(resolve => {
    httpServer.listen(port, 'localhost', resolve);
  });
});

test.after(() => {
  httpServer.close();
});

const findCoverageUrl = (url, coverages) => coverages.find(({ path }) => path === url) || {};

test('should return all coverages', async t => {
  const coverage = await quilted(url);
  const { coverages, host, url: coveredUrl, totalBytes, totalCoverage, totalUsedBytes } = coverage;
  const find = url => findCoverageUrl(url, coverages);

  t.is(host, 'localhost:8080');
  t.is(coveredUrl, 'http://localhost:8080');
  t.is(totalBytes, 8469);
  t.is(totalCoverage, 6.647774235446924);
  t.is(totalUsedBytes, 563);

  t.is(coverages.length, 8);

  t.deepEqual(find('/a.js'), {
    coverage: 100,
    path: '/a.js',
    totalBytes: 10,
    type: 'script',
    unusedBytes: 0,
    usedBytes: 10,
  });

  t.deepEqual(find('/b.js'), {
    coverage: 0,
    path: '/b.js',
    totalBytes: 30,
    type: 'script',
    unusedBytes: 30,
    usedBytes: 0,
  });

  t.deepEqual(find('/c.js'), {
    coverage: 51.61290322580645,
    path: '/c.js',
    totalBytes: 62,
    type: 'script',
    unusedBytes: 30,
    usedBytes: 32,
  });

  t.deepEqual(find('/a.css'), {
    coverage: 100,
    path: '/a.css',
    totalBytes: 21,
    type: 'stylesheet',
    unusedBytes: 0,
    usedBytes: 21,
  });

  t.deepEqual(find('/b.css'), {
    coverage: 0,
    path: '/b.css',
    totalBytes: 21,
    type: 'stylesheet',
    unusedBytes: 21,
    usedBytes: 0,
  });

  t.deepEqual(find('/c.css'), {
    coverage: 47.72727272727273,
    path: '/c.css',
    totalBytes: 44,
    type: 'stylesheet',
    unusedBytes: 23,
    usedBytes: 21,
  });

  t.deepEqual(find('/'), {
    coverage: 100,
    path: '/',
    totalBytes: 5,
    type: 'document',
    unusedBytes: 0,
    usedBytes: 5,
  });

  t.deepEqual(find('https://unpkg.com/preact@8.2.7/dist/preact.min.js'), {
    path: 'https://unpkg.com/preact@8.2.7/dist/preact.min.js',
    type: 'script',
    totalBytes: 8276,
    usedBytes: 474,
    unusedBytes: 7802,
    coverage: 5.727404543257612,
  });

});

test('should return only js coverage', async t => {
  const coverage = await quilted(url, { css: false });
  const { coverages, totalBytes, totalCoverage, totalUsedBytes } = coverage;

  t.is(totalBytes, 8383);
  t.is(totalCoverage, 6.214958845282119);
  t.is(totalUsedBytes, 521);

  t.deepEqual(coverages.map(({ path }) => path), [
    '/a.js',
    '/b.js',
    '/c.js',
    'https://unpkg.com/preact@8.2.7/dist/preact.min.js',
    '/',
  ]);
});

test('should return only css coverage', async t => {
  const coverage = await quilted(url, { js: false });
  const { coverages, totalBytes, totalCoverage, totalUsedBytes } = coverage;

  t.is(totalBytes, 86);
  t.is(totalCoverage, 48.837209302325576);
  t.is(totalUsedBytes, 42);

  t.deepEqual(coverages.map(({ path }) => path), [
    '/a.css',
    '/b.css',
    '/c.css',
  ]);
});

test('should only cover same-origin requests', async t => {
  const coverage = await quilted(url, { sameOrigin: true });
  const { coverages, totalBytes, totalCoverage, totalUsedBytes } = coverage;

  t.is(totalBytes, 193);
  t.is(totalCoverage, 46.1139896373057);
  t.is(totalUsedBytes, 89);

  t.is(coverages.length, 7);
  t.is(coverages.map(({ path }) => path).indexOf('https://unpkg.com/preact@8.2.7/dist/preact.min.js'), -1);
});

test('should throw an error with invalid urls', async t => {
  try {
    await quilted('asdf');
  } catch(ex) {
    t.true(ex instanceof Error);
    t.is(ex.message, 'Url requires a valid protocol and host name.');
  }
});

test('should throw an error with unresolvable urls', async t => {
  try {
    await quilted('http://foo');
  } catch(ex) {
    t.true(ex instanceof Error);
    t.is(ex.message, 'net::ERR_NAME_NOT_RESOLVED');
  }
});