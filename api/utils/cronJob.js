const Accounts = require('../models/Accounts');
const { sendMail } = require('.');
const mailContent = require('./mailContent');

module.exports = async () => {
  const date = new Date();
  console.log(date);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const todaysDate = `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
  const todaysAccount = await Accounts.find({ maturityDate: new Date(todaysDate) });
  if (todaysAccount.length) await sendMail(mailContent(todaysAccount));
  console.log(todaysAccount);
  console.log('running a task every minute');
};
