const path = require('path');
const config = require('../../../jest.config');

module.exports = {
  ...config,
  setupFiles: [path.resolve(__dirname, './setupTests.js')],
};
