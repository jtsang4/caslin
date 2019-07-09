const enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');
const { configure } = enzyme;

configure({ adapter: new Adapter() });
