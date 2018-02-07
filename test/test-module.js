import path from 'path';
import server from 'http-server';
import { test } from 'ava';
import _quilted from '../src/';

const url = 'http://localhost:8080';

var quilted;
if(process.env.TRAVIS) {
  // Travis CI currently doesn't run Chrome headless in sandboxed mode
  quilted = () => _quilted({ args: '--no-sandbox' });
} else {
  quilted = _quilted;
}

var httpServer;

test.before(async () => {
  httpServer = server.createServer({ root: path.resolve(__dirname, 'fixtures') });
  await new Promise(resolve => {
    httpServer.listen(8080, 'localhost', resolve);
  });
});

test.after(() => {
  httpServer.close();
});

test('should return all coverage', async t => {
  t.deepEqual(await quilted(url), {
    coverages: [
      {
        coverage: 100,
        path: '/a.js',
        totalBytes: 10,
        type: 'script',
        unusedBytes: 0,
        usedBytes: 10,
      },
      {
        coverage: 0,
        path: '/b.js',
        totalBytes: 30,
        type: 'script',
        unusedBytes: 30,
        usedBytes: 0,
      },
      {
        coverage: 51.61290322580645,
        path: '/c.js',
        totalBytes: 62,
        type: 'script',
        unusedBytes: 30,
        usedBytes: 32,
      },
      {
        coverage: 100,
        path: '/',
        totalBytes: 5,
        type: 'document',
        unusedBytes: 0,
        usedBytes: 5,
      },
      {
        coverage: 100,
        path: '/a.css',
        totalBytes: 21,
        type: 'stylesheet',
        unusedBytes: 0,
        usedBytes: 21,
      },
      {
        coverage: 0,
        path: '/b.css',
        totalBytes: 21,
        type: 'stylesheet',
        unusedBytes: 21,
        usedBytes: 0,
      },
      {
        coverage: 47.72727272727273,
        path: '/c.css',
        totalBytes: 44,
        type: 'stylesheet',
        unusedBytes: 23,
        usedBytes: 21,
      }
    ],
    host: 'localhost:8080',
    url: 'http://localhost:8080',
    totalBytes: 193,
    totalCoverage: 46.1139896373057,
    totalUsedBytes: 89
  });
});

test('should return only js coverage', async t => {
  t.deepEqual(await quilted(url, { css: false }), {
    coverages: [
      {
        coverage: 100,
        path: '/a.js',
        totalBytes: 10,
        type: 'script',
        unusedBytes: 0,
        usedBytes: 10,
      },
      {
        coverage: 0,
        path: '/b.js',
        totalBytes: 30,
        type: 'script',
        unusedBytes: 30,
        usedBytes: 0,
      },
      {
        coverage: 51.61290322580645,
        path: '/c.js',
        totalBytes: 62,
        type: 'script',
        unusedBytes: 30,
        usedBytes: 32,
      },
      {
        coverage: 100,
        path: '/',
        totalBytes: 5,
        type: 'document',
        unusedBytes: 0,
        usedBytes: 5,
      }
    ],
    host: 'localhost:8080',
    url: 'http://localhost:8080',
    totalBytes: 107,
    totalCoverage: 43.925233644859816,
    totalUsedBytes: 47
  });
});

test('should return only css coverage', async t => {
  t.deepEqual(await quilted(url, { js: false }), {
    coverages: [
      {
        coverage: 100,
        path: '/a.css',
        totalBytes: 21,
        type: 'stylesheet',
        unusedBytes: 0,
        usedBytes: 21,
      },
      {
        coverage: 0,
        path: '/b.css',
        totalBytes: 21,
        type: 'stylesheet',
        unusedBytes: 21,
        usedBytes: 0,
      },
      {
        coverage: 47.72727272727273,
        path: '/c.css',
        totalBytes: 44,
        type: 'stylesheet',
        unusedBytes: 23,
        usedBytes: 21,
      }
    ],
    host: 'localhost:8080',
    url: 'http://localhost:8080',
    totalBytes: 86,
    totalCoverage: 48.837209302325576,
    totalUsedBytes: 42
  });
});