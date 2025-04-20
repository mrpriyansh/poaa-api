// @ts-nocheck
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cron from 'node-cron';

import connectDB from './config/db';

const { handleError } = require('./services/handleError');
const cronJob = require('./api/utils/cronJob');
const User = require('./api/models/User.js');
const webPush = require('./config/webPush.js');

const app = express();

app.use(
  cors({
    origin: '*',
  })
);
app.use(express.json({ extended: false }));

app.use(
  morgan('tiny', {
    skip: (req) => {
      return req.path === '/' && req.method === 'GET';
    },
  })
);

connectDB();

webPush();

const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => res.send(`Server Up and running v${process.env.npm_package_version}`));

app.use('/api', require('./api/index.js'));

app.use((err, req, res) => {
  handleError(err, req, res);
});

// cron.schedule('*/15 * * * *', () => {
//   fetch('https://immense-hamlet-02246.herokuapp.com')
//     .then(res => console.log(`successful job: ${res.ok}`))
//     .catch(err => console.log(err));
// });

cron.schedule('5 0 * * *', async () => {
  const users = await User.find({});

  const allPromises = users.map((agent) => {
    return cronJob({
      name: agent.name,
      email:
        process.env.NODE_ENV === 'production'
          ? agent.email
          : 'mr.priyanshgaharana+poaa_testing@gmail.com',
      agentId: agent.userId,
    });
  });

  await Promise.all(allPromises);
});

app.listen(PORT, () => {
  console.log(`Server ${process.env.npm_package_version} is running on ${PORT}`);
});
