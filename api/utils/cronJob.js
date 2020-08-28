const Accounts = require('../models/Accounts');
const { sendMail } = require('.');
const mailContent = require('./mailContent');

module.exports = async () => {
  const date = new Date();
  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1;
  const year = date.getUTCFullYear();
  const todaysDate = `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
  const todaysAccount = await Accounts.find({ maturityDate: todaysDate });
  //   console.log(mailContent(todaysAccount));
  if (todaysAccount.length) await sendMail(mailContent(todaysAccount));
  console.log('running a task every minute');
};
