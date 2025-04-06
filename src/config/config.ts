import dotenv from "dotenv";

dotenv.config();

const { MONGODBURI, JWTKEY } = process.env;

interface Config {
  mongoURI: string;
  jwtKey: string;
}

const config: Config = {
  mongoURI: MONGODBURI || "",
  jwtKey: JWTKEY || "",
};

export default config;