/* eslint-disable */
const puppeteer = require('puppeteer');

module.exports = async (req, res, next) => {
  const dopUrl = 'https://dopagent.indiapost.gov.in/';
  // res.send('data');
  const formDetails = {
    id: 'AuthenticationFG.USER_PRINCIPAL',
    password: 'AuthenticationFG.ACCESS_CODE',
    login: 'Action.VALIDATE_RM_PLUS_CREDENTIALS_CATCHA_DISABLED',
  };
  const formSelector = {
    id: `input[name="${formDetails.id}"]`,
    password: `input[name="${formDetails.password}"]`,
    login: `input[name="${formDetails.login}"]`,
  };
  const userDetails = { id: 'dop.mi2110080200001', password: 'rama1980#' };

  const listData = [
    {
      accounts: [
        {
          paidInstallments: 9,
          accountno: 3153880130,
          name: 'VIJAY LAKSHMI',
          amount: 1000,
          totalAmount: 9000,
        },
        {
          paidInstallments: 8,
          accountno: 2864376710,
          name: 'MANISH',
          amount: 800,
          totalAmount: 6400,
        },
      ],
      totalAmount: 19900,
      count: 3,
    },
    {
      accounts: [
        {
          paidInstallments: 1,
          accountno: 1456874236,
          name: 'MMMMMMMMMMMMMM',
          amount: 500,
          totalAmount: 500,
        },
        {
          paidInstallments: 1,
          accountno: 3243860981,
          name: 'DEENA NATH VERMA',
          amount: 1000,
          totalAmount: 1000,
        },
      ],
      totalAmount: 1500,
      count: 2,
    },
  ];

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto(dopUrl);
  await page.waitForSelector(formSelector.id);

  await page.$eval(formSelector.id, (el, value) => (el.value = value), userDetails.id);
  await page.$eval(formSelector.password, (el, value) => (el.value = value), userDetails.password);

  const captchaSelector = `img[id="IMAGECAPTCHA"]`;
  console.log('sf');
  const data = await page.$$eval(captchaSelector, imgs => imgs.map(img => img.getAttribute('src')));
  console.log(data);
  // await page.$eval(captchaSelector, el => {
  //   console.log(el);
  //   console.log('sdfa');
  // });
  res.json('test');
  // await page.$eval(formSelector.login, el => el.click());

  // const accountButtonSelector = `a[name="HREF_Accounts"]`;

  // await page.waitForSelector(accountButtonSelector);
  // await page.$eval(accountButtonSelector, el => el.click());

  // const accountEnquireSelector = `a[id="Agent Enquire & Update Screen"]`;
  // await page.waitForSelector(accountEnquireSelector);
  // await page.$eval(accountEnquireSelector, el => el.click());

  // const allAccounts = listData[0].accounts.map(ele => ele.accountno.toString()).sort();

  // const accountsFieldSelector = `textarea[name="CustomAgentRDAccountFG.ACCOUNT_NUMBER_FOR_SEARCH"]`;
  // await page.waitForSelector(accountsFieldSelector);
  // await page.$eval(
  //   accountsFieldSelector,
  //   (el, value) => (el.value = value),
  //   allAccounts.toString()
  // );

  // const fetchButtonSelector = `input[name="Action.FETCH_INPUT_ACCOUNT"]`;
  // await page.$eval(fetchButtonSelector, el => el.click());

  // const txnModeSelector = `input[name="CustomAgentRDAccountFG.PAY_MODE_SELECTED_FOR_TRN"][value='C']`;
  // await page.waitForSelector(txnModeSelector);
  // await page.$eval(txnModeSelector, el => el.click());

  // console.log(allAccounts);
  // for (const [ind, ele] of allAccounts.entries()) {
  //   console.log(ind, ele);
  //   const accCBSelector = `input[name="CustomAgentRDAccountFG.SELECT_INDEX_ARRAY[${ind}]"]`;
  //   await page.waitForSelector(accCBSelector);
  //   await page.$eval(accCBSelector, el => el.click());
  //   if (ind % 10 == 9) {
  //     const nextBtnSelector = `input[name="Action.AgentRDActSummaryAllListing.GOTO_NEXT__"]`;
  //     await page.$eval(nextBtnSelector, el => el.click());
  //   }
  // }
  // console.log(allAccounts);
  // listRefNo = await afterSelectingAcc(page, allAccounts, listData[0]);
  // res.json(listRefNo);

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
  // await page.$eval(downloadBtnSelector, el => el.click());
};

const afterSelectingAcc = async (page, allAccounts, listData) => {
  const saveBtnSelector = `input[name="Action.SAVE_ACCOUNTS"]`;
  await page.waitForSelector(saveBtnSelector);
  await page.$eval(saveBtnSelector, el => el.click());

  const paySaveInstSelector = `input[name="Action.PAY_ALL_SAVED_INSTALLMENTS"]`;

  await page.waitForSelector(paySaveInstSelector);

  let ind = 0;
  for (const elem of listData.accounts.sort()) {
    await changeInstallments(page, ind, elem);
    console.log(ind);
    ind++;
  }

  const paybtnSelector = `input[name="Action.PAY_ALL_SAVED_INSTALLMENTS"]`;
  await page.waitForSelector(paybtnSelector);
  await page.$eval(paybtnSelector, el => el.click());
  console.log('Done');

  const greenBannerSelector = `div[class="greenbg"]`;
  await page.waitForSelector(greenBannerSelector);
  const bannerText = await page.$eval(greenBannerSelector, el => el.innerHTML);
  const regexTemp = /Payment successful. Your payment reference number is (C\d{9}). Please note your reference number for future queries./;
  return bannerText.match(regexTemp)[1];
};

const changeInstallments = async (page, ind, elem) => {
  const accRadioSelector = `input[name="CustomAgentRDAccountFG.SELECTED_INDEX"][value="${ind}"]`;
  const noOfInstSelector = `input[name="CustomAgentRDAccountFG.RD_INSTALLMENT_NO"]`;

  console.log(ind);
  await page.waitForSelector(accRadioSelector);
  await page.$eval(accRadioSelector, el => el.click());
  await page.$eval(noOfInstSelector, (el, value) => (el.value = value), elem.paidInstallments);

  const saveInstBtnSelector = `input[name="Action.ADD_TO_LIST"]`;
  await page.$eval(saveInstBtnSelector, el => el.click());
};
