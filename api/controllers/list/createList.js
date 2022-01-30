/* eslint-disable */
const puppeteer = require('puppeteer');
const loginWebsite = require('../../utils/portalLogin');
const connectDB = require('../../../config/db');
const User = require('../../models/User');
const List = require('../../models/List');
const crypto = require('crypto');

const dopUrl = 'https://dopagent.indiapost.gov.in/';
module.exports = async (id, userDetails, taskId, globalTimeout = 3000) => {
  connectDB();

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    await List.updateOne({ _id: id }, { $set: { taskId } });
    const { list } = await List.findOne({ _id: id });
    await process.send({ status: 'Running', progress: 'List generation started.', listData: list });

    const user = await User.findOne({ email: userDetails.email });
    if (user && !user.pPassword)
      throw new Error('Password not availablae! Please reset your password.');

    const dkey = crypto.createDecipher(process.env.ENCRYPT_ALGO, process.env.ENCRYPT_SALT);
    let password = dkey.update(user.pPassword, 'hex', 'utf8');
    password += dkey.final('utf-8');

    userDetails.pPassword = password;
    const page = await browser.newPage();
    await page.setDefaultTimeout(globalTimeout);

    await loginWebsite(page, userDetails, globalTimeout);

    const accountButtonSelector = `a[name="HREF_Change Password"]`;

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

      await page.waitForSelector(tableStatsSelector);
      const bannerText = await page.$eval(tableStatsSelector, el => el.innerHTML);
      const regexTemp = /.* \d+ - \d+ of  (\d+) results/;
      const groups = bannerText.match(regexTemp);
      if (+groups[1] !== allAccounts.length) {
        if (listIndex == 2) return;
        throw new Error(`Verify account no of all list`);
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
      listsRefno.push(refNo);
    }
    await process.send({ misc: listsRefno, status: 'Done', progress: 100.0 });
  } catch (error) {
    await process.send({ error: error.message });
  } finally {
    browser.close();
  }
};

const afterSelectingAcc = async (page, allAccounts, listData, listIndex) => {
  try {
    const saveBtnSelector = `input[name="Action.SAVE_ACCOUNTS"]`;
    await page.waitForSelector(saveBtnSelector);
    await page.$eval(saveBtnSelector, el => el.click());

    const paySaveInstSelector = `input[name="Action.PAY_ALL_SAVED_INSTALLMENTS"]`;

    await page.waitForSelector(paySaveInstSelector);

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

const downloadList = () => {
  // const reportsTagSelector = `a[name="HREF_Reports"]`;
  // await page.$eval(reportsTagSelector, el => el.click());
  // const refNoFieldSelector = `input[name="CustomAgentRDAccountFG.EBANKING_REF_NUMBER"]`;
  // await page.waitForSelector(refNoFieldSelector);
  // await page.$eval(refNoFieldSelector, (el, value) => (el.value = value), listRefNo);
  // const reportSearchBtnSelector = `input[name="Action.SEARCH_INSTALLMENT_DETAILS"]`;
  // await page.$eval(reportSearchBtnSelector, el => el.click());
  // const fileTypeSelector = `select[name="CustomAgentRDAccountFG.OUTFORMAT"]`;
  // await page.waitForSelector(fileTypeSelector);
  // await page.select(fileTypeSelector, '4');
  // // await page.select(fileTypeSelectId, '4');
  // const downloadBtnSelector = `input[name="Action.GENERATE_REPORT"]`;
  // const results = [];
  // let paused = false;
  // let pausedRequests = [];
  // await page.$eval(downloadBtnSelector, el => el.click());
  // const nextRequest = () => {
  //   if (pausedRequests.length === 0) paused = false;
  //   else {
  //     pausedRequests.shift()();
  //   }
  //   console.log('sdfs');
  // };
  // await page.setRequestInterception(true);
  // // page.on('request', request => {
  //   console.log('sdaf12');
  //   if (paused) pausedRequests.push(() => request.continue());
  //   else {
  //     paused = true;
  //     request.continue();
  //   }
  // });
  // page.on('requestfinished', async request => {
  //   console.log('13');
  //   const response = await request.response();
  //   let responseBody;
  //   if (request.redirectChain().length === 0) {
  //     responseBody = await response.buffer();
  //   }
  //   results.push(responseBody);
  //   console.log(responseBody);
  //   nextRequest();
  // });
  // page.on('requestfailed', request => {
  //   nextRequest();
  // });
  // console.log(results);
  // page.on('response', async response => {
  //   try {
  //     if (
  //       response._headers['content-disposition'] ===
  //       'attachment; filename="RDInstallmentReport11-11-2021.xls"'
  //     ) {
  //       console.log(response);
  //       console.log('fsdasd');
  //       const te = await response.buffer();
  //       console.log(te);
  //       console.log(response.body);
  //       // console.log(response.postData());
  //       // console.log(response.headers());
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // });
  // const [response] = await Promise.all([
  //   page.waitForResponse(resp => resp.url().includes('Finacle;jsessionid')),
  // ]);
  // console.log(response);
  // const buffer = await response.buffer();
  // console.log('buffer');
  // console.log(buffer);
  // }0
};
