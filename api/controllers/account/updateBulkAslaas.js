/* eslint-disable */
const puppeteer = require('puppeteer');
const { createWorker } = require('tesseract.js');
const User = require('../../models/User');
const connectDB = require('../../../config/db');

const notFoundAccountsLinkErrorMessage =
  'waiting for selector `a[name=' + `"HREF_Accounts"]` + '` failed: timeout 60000ms exceeded';
const wrongPwdTemplate = 'The maximum retry attempts allowed for this access mode are 5.';
const dopUrl = 'https://dopagent.indiapost.gov.in/';

module.exports = async allAccounts => {
  connectDB();
  if (!allAccounts.length) throw new Error('No valid accounts found');
  await process.send({ status: 'Started' });

  const userDetails = {
    id: 'dop.mi2110080200001',
    email: 'kulshreshtha.manish@gmail.com',
    password: 'rama1980#',
  };
  const user = await User.findOne({ email: userDetails.email });
  if (user && user.pPassword) throw new Error('Please reset your password.');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    for (const ind of arr) {
      console.log(ind);
      const isLoggedIn = await loginWebsite(page, userDetails);
      console.log(isLoggedIn);
      if (isLoggedIn) break;
    }

    const accountButtonSelector = `a[name="HREF_Accounts"]`;
    await page.waitForSelector(accountButtonSelector, { timeout: 10000 });
    await page.$eval(accountButtonSelector, el => el.click());

    const accountEnquireSelector = `a[name="HREF_Update ASLAAS Number"]`;
    await page.waitForSelector(accountEnquireSelector);
    await page.$eval(accountEnquireSelector, el => el.click());
    const succ = [],
      fail = [];
    for (const ind in allAccounts) {
      const err = await updateAslaas(page, allAccounts[ind]);
      if (err) {
        fail.push(allAccounts[ind]);
      } else succ.push(allAccounts[ind]);
      if (ind % 5 == 0 && ind != allAccounts.length - 1)
        await process.send({ progress: (100 * ind) / allAccounts.length });
    }

    await process.send({ misc: { fail, succ }, status: 'DONE!', progress: 100.0 });
    process.disconnect();
  } catch (error) {
    await process.send({ error: error.message });
  } finally {
    browser.close();
  }
};

const loginWebsite = async (page, userDetails) => {
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
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('AuthenticationController;jsessionid')),
      page.goto(dopUrl),
    ]);

    const buffer = await response.buffer();
    const imgBase64 = 'data:image/jpeg;base64,' + buffer.toString('base64');

    const captcha = await getCaptcha(imgBase64);

    await page.waitForSelector(formSelector.id);

    await page.$eval(formSelector.id, (el, value) => (el.value = value), userDetails.id);
    await page.$eval(
      formSelector.password,
      (el, value) => (el.value = value),
      userDetails.password
    );
    console.log(captcha);
    await page.$eval(formSelector.captcha, (el, value) => (el.value = value), captcha);

    await page.waitForSelector(formSelector.captcha);
    await page.$eval(formSelector.login, el => el.click());
    const accountButtonSelector = `a[name="HREF_Accounts"]`;
    await page.waitForSelector(accountButtonSelector, { timeout: 60000 });
    return true;
  } catch (error) {
    if (error.message === notFoundAccountsLinkErrorMessage) {
      const errorBadgeSelector = `div[class="redbg"]`;
      const bannerText = await page.$eval(errorBadgeSelector, el => el.innerHTML);
      checkForWrongPwd(bannerText, userDetails);
    }
    return false;
  }
};

const checkForWrongPwd = async (bannerText, userDetails) => {
  try {
    const regexTemp = /(.)* (The maximum retry attempts allowed for this access mode are 5.)/;
    const groups = bannerText.match(regexTemp);
    if (groups && groups.length >= 2 && groups[2] === wrongPwdTemplate) {
      const t = await User.updateOne({ email: userDetails.email }, { $unset: { pPassword: '' } });
      await process.send({ error: 'Please reset your password' });
    }
  } catch (error) {
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

    let count = 0;
    let captcha = '';
    const {
      data: { text },
    } = await worker.recognize(imgBase64);

    console.log('sfdadfs', text);
    for (const ind in text) {
      const char = text[ind];
      console.log(char);
      if (
        ('A' <= char && char <= 'Z') ||
        ('a' <= char && char <= 'z') ||
        ('0' <= char && char <= '9')
      )
        captcha += char;
    }
    if (captcha.length !== 6) throw new Error('Captcha not found!');
    console.log(captcha);
    return captcha;
  } catch (error) {
    throw error;
  } finally {
    await worker.terminate();
  }
};

const updateAslaas = async (page, account) => {
  try {
    if (
      (account.accountNo && !account.accountNo.length) ||
      (account.aslaasNo && !account.aslaasNo.length)
    )
      throw new Error('Invalid details');
    const accountEnquireSelector = `a[name="HREF_Update ASLAAS Number"]`;
    await page.waitForSelector(accountEnquireSelector);
    await page.$eval(accountEnquireSelector, el => el.click());
    const aslaasFormTags = {
      accountNo: 'CustomAgentAslaasNoFG.RD_ACC_NO',
      aslaasNo: 'CustomAgentAslaasNoFG.ASLAAS_NO',
      continueButton: 'Action.LOAD_CONFIRM_PAGE',
      addButton: 'Action.ADD_FIELD_SUBMIT',
    };

    const aslaasFormSelector = {
      accountNo: `input[name="${aslaasFormTags.accountNo}"]`,
      aslaasNo: `input[name="${aslaasFormTags.aslaasNo}"]`,
      continueButton: `input[name="${aslaasFormTags.continueButton}"]`,
      addButton: `input[name="${aslaasFormTags.addButton}"]`,
    };

    await page.waitForSelector(aslaasFormSelector.accountNo);
    await page.$eval(
      aslaasFormSelector.accountNo,
      (el, value) => (el.value = value),
      account.accountNo
    );
    await page.$eval(
      aslaasFormSelector.aslaasNo,
      (el, value) => (el.value = value),
      account.aslaasNo
    );
    await page.$eval(aslaasFormSelector.continueButton, el => el.click());

    await page.waitForSelector(aslaasFormSelector.addButton);
    await page.$eval(aslaasFormSelector.addButton, el => el.click());

    await page.waitForSelector(aslaasFormSelector.continueButton);
    return false;
  } catch (err) {
    return true;
  }
};
