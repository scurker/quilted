import stripAnsi from 'strip-ansi';
import { test } from 'ava';
import stats from '../src/stats';

const coverage = {
  url: 'http://localhost:8080',
  host: 'localhost:8080',
  totalBytes: 193,
  totalUsedBytes: 89,
  totalCoverage: 46.1139896373057,
  coverages:
   [ { path: '/a.js',
       type: 'script',
       totalBytes: 10,
       usedBytes: 10,
       unusedBytes: 0,
       coverage: 100 },
     { path: '/b.js',
       type: 'script',
       totalBytes: 30,
       usedBytes: 0,
       unusedBytes: 30,
       coverage: 0 },
     { path: '/c.js',
       type: 'script',
       totalBytes: 62,
       usedBytes: 32,
       unusedBytes: 30,
       coverage: 51.61290322580645 },
     { path: '/',
       type: 'document',
       totalBytes: 5,
       usedBytes: 5,
       unusedBytes: 0,
       coverage: 100 },
     { path: '/a.css',
       type: 'stylesheet',
       totalBytes: 21,
       usedBytes: 21,
       unusedBytes: 0,
       coverage: 100 },
     { path: '/b.css',
       type: 'stylesheet',
       totalBytes: 21,
       usedBytes: 0,
       unusedBytes: 21,
       coverage: 0 },
     { path: '/c.css',
       type: 'stylesheet',
       totalBytes: 44,
       usedBytes: 21,
       unusedBytes: 23,
       coverage: 47.72727272727273 } ] };

test('should show statics for coverage', async t => {
  t.is(stripAnsi(stats(coverage).trim()), `localhost:8080 Coverage

PATH     TYPE          TOTAL     USED   UNUSED COVERAGE
/a.js    script         10 B     10 B      0 B     100%
/b.js    script         30 B      0 B     30 B       0%
/c.js    script         62 B     32 B     30 B   51.61%
/        document        5 B      5 B      0 B     100%
/a.css   stylesheet     21 B     21 B      0 B     100%
/b.css   stylesheet     21 B      0 B     21 B       0%
/c.css   stylesheet     44 B     21 B     23 B   47.73%`);
});

test('should show colors for statistics', async t => {
  t.is(stats(coverage).trim(), `localhost:8080 Coverage

PATH     TYPE          TOTAL     USED   UNUSED COVERAGE
/a.js    script         10 B     [90m10 B[39m      [32m0 B[39m     [32m100%[39m
/b.js    script         30 B      [31m0 B[39m     [31m30 B[39m       [31m0%[39m
/c.js    script         62 B     [90m32 B[39m     [33m30 B[39m   [33m51.61%[39m
/        document        5 B      [90m5 B[39m      [32m0 B[39m     [32m100%[39m
/a.css   stylesheet     21 B     [90m21 B[39m      [32m0 B[39m     [32m100%[39m
/b.css   stylesheet     21 B      [31m0 B[39m     [31m21 B[39m       [31m0%[39m
/c.css   stylesheet     44 B     [90m21 B[39m     [33m23 B[39m   [33m47.73%[39m`);
});