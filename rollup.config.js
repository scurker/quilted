import pkg from './package.json';
import babel from 'rollup-plugin-babel';

const sharedOpts = {
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ],
  external: [...Object.keys(pkg.dependencies), 'url']
};

export default [
  Object.assign({}, sharedOpts, {
    input: 'src/index.js',
    output: [
      {
        format: 'es',
        file: pkg.module
      },
      {
        format: 'cjs',
        file: pkg.main
      }
    ]
  }),
  Object.assign({}, sharedOpts, {
    input: 'src/cli.js',
    output: [{
      banner: '#!/usr/bin/env node',
      format: 'cjs',
      file: pkg.bin['quilted']
    }]
  })
];