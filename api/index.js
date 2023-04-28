const express = require('express');

const router = express.Router();

const signUp = require('./controllers/user/signup');
const signIn = require('./controllers/user/signin');
const userDetails = require('./controllers/user/userDetails');
const userAuth = require('./middlewares/userAuth');
const addAccount = require('./controllers/account/addAccount');
const allAccounts = require('./controllers/account/allAccounts');
const { sendMail } = require('./utils');
const editAccount = require('./controllers/account/editAccount');
const deleteAccount = require('./controllers/account/deleteAccount');
const addInstallment = require('./controllers/installment/addInstallment');
const editInstallment = require('./controllers/installment/editInstallment');
const deleteInstallment = require('./controllers/installment/deleteInstallment');
const allInstallments = require('./controllers/installment/allInstallments');
const generateList = require('./controllers/list/generateList');
const allLists = require('./controllers/list/allLists');
const createList = require('./controllers/list/createList');
const updateBulkAslaas = require('./controllers/account/updateBulkAslaas');
const useSSE = require('./middlewares/useSSE');
const ssetest = require('./controllers/ssetest');
const processScheduler = require('./controllers/scheduler/processScheduler');
const updateStatus = require('./controllers/scheduler/updateStatus');
const abortProcesses = require('./controllers/process/abortProcesses');
const revertList = require('./controllers/list/revertList');
const updateUserDetails = require('./controllers/user/updateUserDetails');
const getBanner = require('./controllers/banner/getBanner');

router.post('/signup', (req, res, next) => {
  signUp(req, res, next);
});
router.post('/signin', (req, res, next) => {
  signIn(req, res, next);
});
router.get('/userdetails', userAuth, (req, res, next) => {
  userDetails(req, res, next);
});
router.patch('/update-user-details', userAuth, (req, res, next) => {
  updateUserDetails(req, res, next);
});
router.post('/addaccount', userAuth, (req, res, next) => {
  addAccount(req, res, next);
});
router.get('/allaccounts', userAuth, (req, res, next) => {
  allAccounts(req, res, next);
});
router.put('/editaccount', userAuth, (req, res, next) => {
  editAccount(req, res, next);
});
router.delete('/deleteaccount', userAuth, (req, res, next) => {
  deleteAccount(req, res, next);
});
router.get('/send-mail', async (_, res, next) => {
  try {
    await sendMail();
    res.json('Mail sent');
  } catch (err) {
    next(err);
  }
});

router.post('/addInstallment', userAuth, async (req, res, next) => {
  await addInstallment(req, res, next);
});
router.put('/editInstallment', userAuth, async (req, res, next) => {
  await editInstallment(req, res, next);
});

router.delete('/deleteInstallment', userAuth, async (req, res, next) => {
  await deleteInstallment(req, res, next);
});

router.get('/getAllInstallments', userAuth, async (req, res, next) => {
  await allInstallments(req, res, next);
});

router.post('/generateList', userAuth, async (req, res, next) => {
  await generateList(req, res, next);
});

router.get('/getAllLists', userAuth, async (req, res, next) => {
  await allLists(req, res, next);
});

router.delete('/revertList/:listId', userAuth, async (req, res, next) => {
  await revertList(req, res, next);
});

router.post('/createList', async (req, res, next) => {
  await createList(req, res, next);
});

router.post('/update-aslaas', async (req, res, next) => {
  await updateBulkAslaas(req, res, next);
});

router.get('/stream-random', useSSE, ssetest);

router.post('/abortProcesses', userAuth, abortProcesses);
router.post('/schedule/:type', userAuth, processScheduler);

router.get('/status', [useSSE], updateStatus);

router.get('/feature-flags', getBanner);

module.exports = router;
