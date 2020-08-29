const Accounts = require('../models/Accounts');
const { sendMail } = require('.');
const mailContent = require('./mailContent');

module.exports = async () => {
  const date = new Date();
  console.log(date);
  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1;
  const year = date.getUTCFullYear();
  const todaysDate = `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
  const todaysAccount = await Accounts.find({ maturityDate: new Date(todaysDate) });
  if (todaysAccount.length) {
    await sendMail(mailContent(todaysAccount), 'rammurat1000@gmail.com');
    await sendMail(mailContent(todaysAccount), 'kulshreshtha.manish@gmail.com');
    console.log(`Mail Send on ${todaysDate} for ${todaysAccount.length} accounts`);
  }else console.log(`No accounts found on ${todaysDate}`)
  console.log('running a task every minute');
};
