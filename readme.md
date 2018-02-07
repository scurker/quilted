<div align="center" markdown="1">

![quilted logo](https://user-images.githubusercontent.com/1062039/35892723-4a4e70aa-0b70-11e8-90a8-082686146a1b.png)

# quilted

[![Build Status](https://travis-ci.org/scurker/quilted.svg?branch=master)](https://travis-ci.org/scurker/quilted)
[![Coverage Status](https://coveralls.io/repos/scurker/quilted/badge.svg?branch=master&service=github)](https://coveralls.io/github/scurker/quilted?branch=master)
[![npm](https://img.shields.io/npm/v/quilted.svg?style=flat)](https://www.npmjs.com/package/quilted)

> A css/js coverage tool for websites built using [Puppeteer](https://github.com/GoogleChrome/puppeteer).

</div>

## Installation

With [npm](https://www.npmjs.com/):

```sh
npm install --save quilted
```

With [yarn](https://yarnpkg.com):

```sh
yarn add quilted
```

## Usage

### CLI

```sh
quilted <url> [options]
```

### Module

```js
import quilted from 'quilted';

quilted('https://example.com').then(coverage => {
  // ...
});
```

## CLI

```sh
$ quilted --help

Usage: quilted <url> [options]

Basic options:
  --no-css  disables css code coverage                                 [boolean]
  --no-js   disables js code coverage                                  [boolean]

Puppeteer options:
  --origin, -o            only cover same-origin assets                [boolean]
  --viewportWidth, --vw   sets viewport width for page render           [number]
  --viewportHeight, --vh  sets viewport height for page render          [number]
  --viewport, -V          sets viewport for page render i.e. 800x600    [string]
  --headers, -H           sets headers for the page request
                          example: $0 <url> -H "X-Header: 123"           [array]
  --userAgent, --ua       sets the user agent for the request           [string]

Options:
  --version, -v  Show version number                                   [boolean]
  --help         Show help                                             [boolean]
```

## Module Options

| Option    | Description       | Default |
|-----------|-------------------|---------|
| `js`      | Run js coverage.  | `true`  |
| `css`     | Run css coverage. | `true`  |
| `origin`  | Only cover requests from the same origin | `false`  |
| `cookies` | [Set cookies for the page request.](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagesetcookiecookies) | `null` |
| `headers` | [Set headers for the page request.](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagesetextrahttpheadersheaders) | `null` |
| `userAgent` | Sets the user agent for the page request. | Default Chrome Headless User Agent String |
| `viewport` | [Sets the viewport size for the page request.](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagesetviewportviewport) | `800x600` |

## License

[MIT](/license)
