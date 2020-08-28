require('dotenv').config();

const { MONGODBURI, JWTKEY } = process.env;

const config = {
  mongoURI: MONGODBURI,
  jwtKey: JWTKEY,
};

module.exports = config;
