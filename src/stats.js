import chalk from 'chalk';
import prettyBytes from 'pretty-bytes';
import columnify from 'columnify';

function colorUsed(usedBytes, totalBytes) {
  let used = prettyBytes(usedBytes);

  if (totalBytes && usedBytes === 0) {
    used = chalk.red(used);
  } else {
    used = chalk.gray(used);
  }

  return used;
}

function colorUnused(unusedBytes, totalBytes) {
  let unused = prettyBytes(unusedBytes);

  if (unusedBytes && unusedBytes === totalBytes) {
    unused = chalk.red(unused);
  } else if (unusedBytes > 0) {
    unused = chalk.yellow(unused);
  } else {
    unused = chalk.green(unused);
  }

  return unused;
}

function colorCoverage(coveragePercent) {
  let precision = parseFloat(coveragePercent).toPrecision(coveragePercent < 10 ? 3 : 4)
    , coverage = `${~~coveragePercent !== coveragePercent ? precision : coveragePercent}%`;

  if (coveragePercent === 100) {
    coverage = chalk.green(coverage);
  } else if (coveragePercent > 0) {
    coverage = chalk.yellow(coverage);
  } else {
    coverage = chalk.red(coverage);
  }

  return coverage;
}

export default function(coverage) {
  let { host, coverages } = coverage;

  coverages = coverages.map(entry => {
    let { path, type, totalBytes, usedBytes, unusedBytes, coverage: coveredPercent } = entry;

    const total = prettyBytes(totalBytes);
    const used = colorUsed(usedBytes, totalBytes);
    const unused = colorUnused(unusedBytes, totalBytes);
    const coverage = colorCoverage(coveredPercent);

    return { path, type, total, used, unused, coverage };
  });

  // Set right column alignments for numeric values
  const config = ['total', 'used', 'unused', 'coverage'].reduce((o, name) => (o[name] = { align: 'right' }) && o, {});

  const columns = columnify(coverages, { truncate: true, maxWidth: 120, minWidth: 8, config });

  return `${host} Coverage\n\n${columns}`;
}