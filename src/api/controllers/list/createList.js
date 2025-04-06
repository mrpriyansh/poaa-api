/* eslint-disable */
const puppeteer = require('puppeteer');
const loginWebsite = require('../../utils/portalLogin');
const connectDB = require('../../../config/db');
const User = require('../../models/User');
const List = require('../../models/List');
const CryptoJS = require('crypto-js');
const any = require('promise.any');
const fs = require('fs').promises;
const { REFERENCE_NO_CREATED } = require('../../utils/constants');
const { uploadFile } = require('../../../config/storageUtils');
const { formatDate, checkFileExist } = require('../../utils');

module.exports = async (id, userDetails, taskId, globalTimeout = 3000) => {
  let browser = null;

  try {
    await connectDB();
    await List.updateOne({ _id: id }, { $set: { taskId } });
    const { list, agentId } = await List.findOne({ _id: id });
    // launch browser instance
    browser = await puppeteer.launch({
      headless: process.env.NODE_ENV === 'production',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath:
        process.env.NODE_ENV === 'production'
          ? '/usr/bin/google-chrome'
          : '/usr/bin/google-chrome-stable',
    });
    await process.send({
      status: 'Running',
      progress: 'List generation started.',
      listData: list,
      agentId,
      browserPid: browser.process().pid,
      globalTimeout,
    });

    const user = await User.findOne({ email: userDetails.email });

    // pPassword will be empty
    if (user && !user.pPassword)
      throw new Error('Password not availablae! Please reset your password.');
    // decrypt the password
    const password = CryptoJS.AES.decrypt(user.pPassword, process.env.ENCRYPT_SALT).toString(
      CryptoJS.enc.Utf8
    );
    user.pPassword = password;
    // get new page
    const page = await browser.newPage();
    await page.setDefaultTimeout(globalTimeout);

    await loginWebsite(page, user, globalTimeout);
    // check for login
    const accountButtonSelector = `a[name="HREF_Accounts"]`;

    await page.waitForSelector(accountButtonSelector, { timeout: 1000 });
    process.send({ progress: 'Successfully logged into DOP. Listing accounts.' });

    await page.$eval(accountButtonSelector, el => el.click());
    const accountEnquireSelector = `a[id="Agent Enquire & Update Screen"]`;
    await page.waitForSelector(accountEnquireSelector);
    await page.$eval(accountEnquireSelector, el => el.click());

    const listsRefno = [];
    for (const [listIndex, listData] of list.entries()) {
      await process.send({ progress: `Fetching accounts for list ${listIndex + 1}` });
      const allAccounts = listData.accounts.map(ele => ele.accountNo.toString()).sort();

      const accountsFieldSelector = `textarea[name="CustomAgentRDAccountFG.ACCOUNT_NUMBER_FOR_SEARCH"]`;
      await page.waitForSelector(accountsFieldSelector, { timeout: 2 * globalTimeout });
      await page.$eval(
        accountsFieldSelector,
        (el, value) => (el.value = value),
        allAccounts.toString()
      );

      const fetchButtonSelector = `input[name="Action.FETCH_INPUT_ACCOUNT"]`;
      await page.$eval(fetchButtonSelector, el => el.click());

      const tableStatsSelector = `#repeatDiv > h2 > span.right > span`;
      const checkError = await checkForError(page, tableStatsSelector);
      if (checkError !== 'NOT_FOUND') {
        throw new Error(checkError);
      }

      const bannerText = await page.$eval(tableStatsSelector, el => el.innerHTML);
      const regexTemp = /.* \d+ - \d+ of  (\d+) results/;
      const groups = bannerText.match(regexTemp);
      if (+groups[1] !== allAccounts.length) {
        if (listIndex == 2) return;
        throw new Error(`Check all the accounts of list number ${listIndex + 1}`);
      }

      const txnModeSelector = `input[name="CustomAgentRDAccountFG.PAY_MODE_SELECTED_FOR_TRN"][value='C']`;
      await page.waitForSelector(txnModeSelector);
      await page.$eval(txnModeSelector, el => el.click());

      for (const [ind, ele] of allAccounts.entries()) {
        const accCBSelector = `input[name="CustomAgentRDAccountFG.SELECT_INDEX_ARRAY[${ind}]"]`;
        if (ind && ind % 10 == 0) {
          const nextBtnSelector = `input[name="Action.AgentRDActSummaryAllListing.GOTO_NEXT__"]`;
          await page.waitForSelector(nextBtnSelector);
          await page.$eval(nextBtnSelector, el => el.click());
        }
        await page.waitForSelector(accCBSelector);
        await page.$eval(accCBSelector, el => el.click());
      }
      refNo = await afterSelectingAcc(page, allAccounts, listData, listIndex);
      listsRefno.push({ refNo });
    }

    await process.send({
      mis: listsRefno,
      progress: 'List has been generated, file downloading is in progress!',
    });
    await List.updateOne({ _id: id }, { $set: { status: REFERENCE_NO_CREATED } });

    const lists = [];
    for (const list of listsRefno) {
      const url = await downloadList(page, list.refNo, globalTimeout);
      lists.push({ refNo: list.refNo, url });
    }
    await process.send({ misc: lists, status: 'Done', progress: 100.0 });
  } catch (error) {
    await process.send({ error: error.message });
  } finally {
    if (browser) browser.close();
  }
};

const afterSelectingAcc = async (page, allAccounts, listData, listIndex) => {
  try {
    const saveBtnSelector = `input[name="Action.SAVE_ACCOUNTS"]`;
    await page.waitForSelector(saveBtnSelector);
    await page.$eval(saveBtnSelector, el => el.click());

    const paySaveInstSelector = `input[name="Action.PAY_ALL_SAVED_INSTALLMENTS"]`;
    const checkError = await checkForError(page, paySaveInstSelector);
    if (checkError !== 'NOT_FOUND') {
      throw new Error(checkError);
    }

    await process.send({ progress: `Chaning Installments of accounts of list ${listIndex + 1}` });
    for (const [ind, elem] of listData.accounts
      .sort((a, b) => a.accountNo.localeCompare(b.accountNo))
      .entries()) {
      if (ind && ind % 10 == 0) {
        const nextBtnSelector = `input[name="Action.SelectedAgentRDActSummaryListing.GOTO_NEXT__"]`;
        await page.waitForSelector(nextBtnSelector);
        await page.$eval(nextBtnSelector, el => el.click());
      }
      if (elem.paidInstallments !== 1) {
        await changeInstallments(page, ind, elem);
      }
    }

    const paybtnSelector = `input[name="Action.PAY_ALL_SAVED_INSTALLMENTS"]`;
    await page.waitForSelector(paybtnSelector);
    await page.$eval(paybtnSelector, el => el.click());

    const greenBannerSelector = `div[class="greenbg"]`;
    await page.waitForSelector(greenBannerSelector);
    const bannerText = await page.$eval(greenBannerSelector, el => el.innerHTML);
    const regexTemp = /Payment successful. Your payment reference number is (C\d{9}). Please note your reference number for future queries./;
    return bannerText.match(regexTemp)[1];
  } catch (error) {
    throw error;
  }
};

const changeInstallments = async (page, ind, elem) => {
  const accRadioSelector = `input[name="CustomAgentRDAccountFG.SELECTED_INDEX"][value="${ind}"]`;
  const noOfInstSelector = `input[name="CustomAgentRDAccountFG.RD_INSTALLMENT_NO"]`;

  try {
    const tablePage = Math.floor(ind / 10);
    if (tablePage) {
      const inputPageSelector = `input[name="CustomAgentRDAccountFG.SelectedAgentRDActSummaryListing_REQUESTED_PAGE_NUMBER"]`;
      const goButtonSelector = `input[name="Action.SelectedAgentRDActSummaryListing.GOTO_PAGE__"]`;
      await page.waitForSelector(inputPageSelector);
      await page.$eval(inputPageSelector, (el, value) => (el.value = value), 1 + tablePage);
      await page.$eval(goButtonSelector, el => el.click());
    }
    await page.waitForSelector(accRadioSelector);
    await page.$eval(accRadioSelector, el => el.click());
    await page.$eval(noOfInstSelector, (el, value) => (el.value = value), elem.paidInstallments);

    const saveInstBtnSelector = `input[name="Action.ADD_TO_LIST"]`;
    await page.$eval(saveInstBtnSelector, el => el.click());
  } catch (error) {
    throw error;
  }
};

// after clicking on the save button
const checkForError = async (page, fallBackSelector) => {
  try {
    const redBannerSelector = `div[class="redbg"]`;
    await any([page.waitForSelector(redBannerSelector), page.waitForSelector(fallBackSelector)]);
    const bannerText = await page.$eval(redBannerSelector, el => el.innerHTML);
    return bannerText.split('</a>')[1];
  } catch (err) {
    return 'NOT_FOUND';
  }
};
const downloadList = async (page, listRefNo, globalTimeout) => {
  try {
    const reportsTagSelector = `a[name="HREF_Reports"]`;
    await page.waitForSelector(reportsTagSelector);
    await page.$eval(reportsTagSelector, el => el.click());
    const refNoFieldSelector = `input[name="CustomAgentRDAccountFG.EBANKING_REF_NUMBER"]`;
    await page.waitForSelector(refNoFieldSelector);
    await page.$eval(refNoFieldSelector, (el, value) => (el.value = value), listRefNo);
    const reportSearchBtnSelector = `input[name="Action.SEARCH_INSTALLMENT_DETAILS"]`;
    await page.$eval(reportSearchBtnSelector, el => el.click());
    const fileTypeSelector = `select[name="CustomAgentRDAccountFG.OUTFORMAT"]`;
    await page.waitForSelector(fileTypeSelector);
    await page.select(fileTypeSelector, '4');
    const downloadBtnSelector = `input[name="Action.GENERATE_REPORT"]`;

    const downloadPath = `/tmp/${listRefNo}`;
    await fs.mkdir(downloadPath);
    await page._client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: downloadPath,
    });
    const fileName = `RDInstallmentReport${formatDate(new Date())}.xls`;
    await page.$eval(downloadBtnSelector, el => el.click());
    const filePath = `${downloadPath}/${fileName}`;
    await checkFileExist(filePath, globalTimeout);

    const destination = `Reports/${listRefNo}/${fileName}`;
    await uploadFile(filePath, {
      destination,
      public: true,
    });
    return `https://storage.googleapis.com/poaa-api/${destination}`;
  } catch (err) {
    throw err;
  }
};
