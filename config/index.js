var str = process.env.NODE_ENV;
var env = str.trim();

switch (env) {
  case 'development':
    module.exports = require('./development');
    break;
  case 'staging':
    module.exports = require('./staging');
    break;
  case 'production':
    module.exports = require('./production');
    break;
  default:
    console.error("Unrecognized NODE_ENV: " + process.env.NODE_ENV);
    process.exit(1);
}

//module.exports.ids = require('./auth').ids;