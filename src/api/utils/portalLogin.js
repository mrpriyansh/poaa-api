const User = require('../models/User');
const { createWorker } = require('tesseract.js');
const any = require('promise.any');
const { ErrorHandler } = require('../../services/handleError');

const shortWaitingTime = 1000;
// there is one more instance, change there if changing wrongPwdTemplate
const wrongPwdTemplate = 'The maximum retry attempts allowed for this access mode are 5.';
const wrongPwdMsg = 'Wrong Password! Please reset portal password, if not done!';
const pwdExpMsg = 'Password Expired! Please reset portal password, if not done!';
const dopUrl = 'https://dopagent.indiapost.gov.in/';

const notFoundChangePwderrMsg = (waitingTime) => {
  return (
    'waiting for selector `a[name=' +
    `"HREF_Change Password"]` +
    '` failed: timeout ' +
    waitingTime +
    'ms exceeded'
  );
};

const removePwd = async (userDetails, msg) => {
  try {
    await User.updateOne({ email: userDetails.email }, { $unset: { pPassword: '' } });
    await process.send({ error: msg });
  } catch (error) {
    console.log(error);
  } finally {
    process.disconnect();
  }
};

const getCaptcha = async (imgBase64) => {
  let worker = null;
  try {
    worker = await createWorker();
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
    if (worker) await worker.terminate();
  }
};

const attempToLogin = async (page, userDetails, attemp, globalTimeout) => {
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
      page.waitForResponse((resp) => resp.url().includes('AuthenticationController;jsessionid')),
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

    await page.$eval(formSelector.login, (el) => el.click());
    const changePwdButtonSelector = `a[name="HREF_Change Password"]`;
    const errorBadgeSelector = `div[class="redbg"]`;
    await any([
      page.waitForSelector(errorBadgeSelector),
      page.waitForSelector(changePwdButtonSelector),
    ]);
    await page.waitForSelector(changePwdButtonSelector, { timeout: shortWaitingTime });

    const headingSelector = `div[id="PgHeading.Ra1.C2"]`;
    await page.waitForSelector(headingSelector, { timeout: shortWaitingTime });
    const headerTitle = await page.$eval(headingSelector, (el) => el.innerHTML);
    if (headerTitle !== '<h1>Dashboard</h1>') throw new ErrorHandler(400, pwdExpMsg);

    return true;
  } catch (error) {
    console.log(error.message);
    if (
      error.message === notFoundChangePwderrMsg(globalTimeout) ||
      error.message === notFoundChangePwderrMsg(shortWaitingTime)
    ) {
      const errorBadgeSelector = `div[class="redbg"]`;
      const bannerText = await page.$eval(errorBadgeSelector, (el) => el.innerHTML);
      const regexTemp = /(.)* (The maximum retry attempts allowed for this access mode are 5.)/;
      const groups = bannerText.match(regexTemp);
      if (groups && groups.length >= 2 && groups[2] === wrongPwdTemplate) {
        removePwd(userDetails, wrongPwdMsg);
      }
    } else {
      const pwdExpired = await testForPwdExpiry(page);
      if (pwdExpired) removePwd(userDetails, pwdExpMsg);
    }
    return false;
  }
};

const testForPwdExpiry = async (page) => {
  try {
    const pwdPolicyGuidlinesSelector = `span[id="Guidelines"]`;
    await page.waitForSelector(pwdPolicyGuidlinesSelector, { timeout: shortWaitingTime });
    return true;
  } catch (err) {
    return false;
  }
};

const loginWebsite = async (page, userDetails, globalTimeout) => {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  for (const ind of arr) {
    const isLoggedIn = await attempToLogin(page, userDetails, ind, globalTimeout);
    console.log(ind, isLoggedIn);
    if (isLoggedIn) return true;
  }
  return false;
};

module.exports = loginWebsite;
