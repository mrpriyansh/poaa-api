const express = require('express');

const router = express.Router();

const signUp = require('./controllers/signup');
const signIn = require('./controllers/signin');
const userDetails = require('./controllers/userDetails');
const userAuth = require('./middlewares/userAuth');
const addAccount = require('./controllers/addAccount');
const allAccounts = require('./controllers/allAccounts');
const { sendMail } = require('./utils');
const editAccount = require('./controllers/editAccount');
const deleteAccount = require('./controllers/deleteAccount');

router.post('/signup', (req, res, next) => {
  signUp(req, res, next);
});
router.post('/signin', (req, res, next) => {
  signIn(req, res, next);
});
router.get('/userdetails', userAuth, (req, res, next) => {
  userDetails(req, res, next);
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
})
router.get('/send', async (req, res, next) => {
  const response = await sendMail();
  res.json('Mail sent');
});

module.exports = router;
