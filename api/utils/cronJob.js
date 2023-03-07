/* eslint-disable no-console */

const Accounts = require('../models/Accounts');
const { sendMail } = require('.');
const mailContent = require('./mailContent');

const formatDate = (day, month, year) => {
  const date = `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
  return new Date(date);
};
module.exports = async agentDetails => {
  try {
    const date = new Date();
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1;
    const year = date.getUTCFullYear();
    let duration = 'Today';
    const fromDate = formatDate(day, month, year);
    let toDate = formatDate(day + 1, month, year);

    // decide duration
    if (day === 1) {
      toDate = formatDate(day, month + 1, year);
      duration = 'this Month';
    } else if (date.getUTCDay() === 0) {
      toDate = formatDate(day + 7, month, year);
      duration = 'this Week';
    }

    const maturingAccounts = await Accounts.find({
      agentId: agentDetails.agentId,
      maturityDate: { $gte: fromDate, $lt: toDate },
    });
    if (maturingAccounts.length) {
      await sendMail(
        agentDetails.email,
        mailContent(maturingAccounts, agentDetails.name, duration),
        `Accounts Maturing ${duration}`
      );
      console.log(
        `${fromDate}: Mail Send for ${maturingAccounts.length} accounts to ${agentDetails.name} for ${duration}`
      );
    } else console.log(`${fromDate}: No accounts found for ${agentDetails.name} for ${duration}`);
  } catch (err) {
    console.log(err);
  }
};
