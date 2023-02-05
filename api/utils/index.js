/* eslint-disable no-restricted-syntax */
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const Account = require('../models/Accounts');
const { ErrorHandler } = require('../../services/handleError');
const Installment = require('../models/Installment');
const { INSTALLMENT_PENDING } = require('./constants');

const isNull = (obj, fields) => {
  // eslint-disable-next-line guard-for-in
  for (const prop in fields) {
    if (!obj[fields[prop]]) {
      return true;
    }
  }
  return false;
};

const insertAccount = async (account, agentId) => {
  try {
    const exists = await Account.findOne({ accountNo: account.accountNo });
    if (exists) throw new ErrorHandler(409, 'Account Already Exists');
    await Account.create({ ...account, agentId });
    return new ErrorHandler(200, 'Account Added Succesfully');
  } catch (err) {
    return err;
  }
};

const insertInstallment = async (installment, next) => {
  try {
    const exists = await Installment.findOne({
      accountNo: installment.accountNo,
      status: INSTALLMENT_PENDING,
    });
    if (exists) throw new ErrorHandler(409, 'Account already logged, Try to edit it');
    await Installment.create({ ...installment, status: INSTALLMENT_PENDING });
    return 'Installment Logged Successfully';
  } catch (err) {
    next(err);
    throw err;
  }
};

const sendMail = async (content, mailId) => {
  try {
    const { OAuth2 } = google.auth;
    const oauth2Client = new OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );
    oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN,
    });
    const accessToken = oauth2Client.getAccessToken();
    const smtpTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.SERVER_MAIL_ADDRESS,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken,
      },
    });
    await smtpTransport.sendMail({
      from: process.env.SERVER_MAIL_ADDRESS,
      to: mailId,
      subject: 'Important Information',
      text: `Checkout Accounts for Maturity`,
      html: content,
    });
    return { statusCode: 200, message: 'Mail send successfully' };
  } catch (err) {
    return err;
  }
};

module.exports = { isNull, insertAccount, sendMail, insertInstallment };
