const path = require('path');

module.exports = {
  input: './src/index.ts',
  output: {
    dir: './dist',
    format: ['cjs', 'esm', 'umd'],
    minify: true,
    moduleName: 'caslin'
  },
  plugins: {
    typescript2: {
      cacheRoot: path.join(__dirname, '.rpt2_cache'),
    },
  },
};
