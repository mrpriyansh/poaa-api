/* eslint-disable*/
const User = require('../models/User');
const { createWorker } = require('tesseract.js');
const any = require('promise.any');

const waitingTime = 45000;
const shortWaitingTime = 1000;
const notFoundAccountsLinkErrorMessageShort =
  'waiting for selector `a[name=' +
  `"HREF_Accounts"]` +
  '` failed: timeout ' +
  shortWaitingTime +
  'ms exceeded';
const notFoundAccountsLinkErrorMessage =
  'waiting for selector `a[name=' +
  `"HREF_Accounts"]` +
  '` failed: timeout ' +
  waitingTime +
  'ms exceeded';
const wrongPwdTemplate = 'The maximum retry attempts allowed for this access mode are 5.';
const dopUrl = 'https://dopagent.indiapost.gov.in/';

const notFoundAccountErrMsg = waitingTime => {
  return (
    'waiting for selector `a[name=' +
    `"HREF_Accounts"]` +
    '` failed: timeout ' +
    waitingTime +
    'ms exceeded'
  );
};

const checkForWrongPwd = async userDetails => {
  try {
    await User.updateOne({ email: userDetails.email }, { $unset: { pPassword: '' } });
    await process.send({ error: 'Wrong Password! Please reset your password' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  } finally {
    process.disconnect();
  }
};

const getCaptcha = async imgBase64 => {
  const worker = createWorker();
  try {
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');

    let captcha = '';
    const {
      data: { text },
    } = await worker.recognize(imgBase64);

    for (const ind in text) {
      const char = text[ind];
      if (
        ('A' <= char && char <= 'Z') ||
        ('a' <= char && char <= 'z') ||
        ('0' <= char && char <= '9')
      )
        captcha += char;
    }
    if (captcha.length !== 6) throw new Error('Captcha not found!');
    return captcha;
  } catch (error) {
    throw error;
  } finally {
    await worker.terminate();
  }
};

const loginWebsite = async (page, userDetails, attemp, globalTimeout) => {
  const formDetails = {
    id: 'AuthenticationFG.USER_PRINCIPAL',
    password: 'AuthenticationFG.ACCESS_CODE',
    captcha: 'AuthenticationFG.VERIFICATION_CODE',
    login: 'Action.VALIDATE_RM_PLUS_CREDENTIALS_CATCHA_DISABLED',
  };

  const formSelector = {
    id: `input[name="${formDetails.id}"]`,
    password: `input[name="${formDetails.password}"]`,
    captcha: `input[name="${formDetails.captcha}"]`,
    login: `input[name="${formDetails.login}"]`,
  };

  try {
    await process.send({
      progress: `Trying to loggin to website. Attempt ${Math.ceil(attemp / 3)}`,
    });
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('AuthenticationController;jsessionid')),
      page.goto(dopUrl),
    ]);

    const buffer = await response.buffer();
    const imgBase64 = 'data:image/jpeg;base64,' + buffer.toString('base64');

    const captcha = await getCaptcha(imgBase64);

    await page.waitForSelector(formSelector.id);

    await page.$eval(formSelector.id, (el, value) => (el.value = value), userDetails.pAccountNo);
    await page.$eval(
      formSelector.password,
      (el, value) => (el.value = value),
      userDetails.pPassword
    );
    await page.waitForSelector(formSelector.captcha);
    await page.$eval(formSelector.captcha, (el, value) => (el.value = value), captcha);
    await page.waitForSelector(formSelector.login);

    await page.$eval(formSelector.login, el => el.click());
    const accountButtonSelector = `a[name="HREF_Accounts"]`;
    const errorBadgeSelector = `div[class="redbg"]`;
    await any([
      page.waitForSelector(errorBadgeSelector),
      page.waitForSelector(accountButtonSelector),
    ]);
    await page.waitForSelector(accountButtonSelector, { timeout: shortWaitingTime });
    return true;
  } catch (error) {
    console.log(error);
    if (
      error.message === notFoundAccountErrMsg(globalTimeout) ||
      error.message === notFoundAccountErrMsg(shortWaitingTime)
    ) {
      const errorBadgeSelector = `div[class="redbg"]`;
      const bannerText = await page.$eval(errorBadgeSelector, el => el.innerHTML);
      const regexTemp = /(.)* (The maximum retry attempts allowed for this access mode are 5.)/;
      const groups = bannerText.match(regexTemp);
      if (groups && groups.length >= 2 && groups[2] === wrongPwdTemplate) {
        checkForWrongPwd(userDetails);
      }
    }
    return false;
  }
};

module.exports = loginWebsite;
