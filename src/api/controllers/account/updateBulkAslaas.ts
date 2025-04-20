const puppeteer = require('puppeteer');
const User = require('../../models/User');
const connectDB = require('../../../config/db');
const loginWebsite = require('../../utils/portalLogin');

module.exports = async (allAccounts) => {
  connectDB();
  if (!allAccounts.length) throw new Error('No valid accounts found');
  await process.send({ status: 'Started' });

  const userDetails = {
    pAccountNo: 'dop.mi2110080200022',
    email: 'kulshreshtha.manish@gmail.com',
    pPassword: 'rama1980#',
  };
  // const user = await User.findOne({ email: userDetails.email });
  // if (user && user.pPassword) throw new Error('Please reset your password.');

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
    await page.$eval(accountButtonSelector, (el) => el.click());

    const accountEnquireSelector = `a[name="HREF_Update ASLAAS Number"]`;
    await page.waitForSelector(accountEnquireSelector);
    await page.$eval(accountEnquireSelector, (el) => el.click());
    const succ = [],
      fail = [];
    for (const index in allAccounts) {
      const ind = parseInt(index, 10);
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

const updateAslaas = async (page, account) => {
  try {
    account.aslaasNo = account.aslaasNo || '';
    account.accountNo = account.accountNo || '';
    if (!account.accountNo.length || !account.aslaasNo.length) throw new Error('Invalid details');
    const accountEnquireSelector = `a[name="HREF_Update ASLAAS Number"]`;
    await page.waitForSelector(accountEnquireSelector);
    await page.$eval(accountEnquireSelector, (el) => el.click());
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
    await page.$eval(aslaasFormSelector.continueButton, (el) => el.click());

    await page.waitForSelector(aslaasFormSelector.addButton);
    await page.$eval(aslaasFormSelector.addButton, (el) => el.click());

    await page.waitForSelector(aslaasFormSelector.continueButton);
    return false;
  } catch (err) {
    return true;
  }
};
