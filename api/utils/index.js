/* eslint-disable no-restricted-syntax */
const nodemailer = require('nodemailer');
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
    return Promise.reject(err);
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

const sendMail = async (
  mailId = 'mr.priyanshgaharana+poaa_test@gmail.com',
  content = '<p> Sample Mail! </p>',
  subject = 'Important Information'
) => {
  try {
    const smtpTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SERVER_MAIL_ADDRESS,
        pass: process.env.SERVER_MAIL_PWD,
      },
    });
    await smtpTransport.sendMail({
      from: `POAA Officials <${process.env.SERVER_MAIL_ADDRESS}>`,
      to: mailId,
      subject,
      text: 'There is an update for you! Please check our website. https://poaa-ui.poaa.tk',
      html: content,
    });
    return { statusCode: 200, message: 'Mail send successfully' };
  } catch (err) {
    return err;
  }
};

module.exports = { isNull, insertAccount, sendMail, insertInstallment };
