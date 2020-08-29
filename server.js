const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cron = require('node-cron');
const fetch = require('node-fetch');
const connectDB = require('./config/db');
const { handleError } = require('./services/handleError');

const cronJob = require('./api/utils/cronJob');

const app = express();

app.use(cors());
app.use(express.json({ extended: false }));
app.use(morgan('tiny'));

connectDB();

const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => res.send('Server Up and running'));
app.use('/api', require('./api/index.js'));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  handleError(err, req, res);
});

// cron.schedule('*/15 * * * *', () => {
//   fetch('https://immense-hamlet-02246.herokuapp.com')
//     .then(res => console.log(`successful job: ${res.ok}`))
//     .catch(err => console.log(err));
// });

cron.schedule('5 0 * * *', async () => {
  console.log('a');
  await cronJob();
});
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Server is running on ', PORT);
});
