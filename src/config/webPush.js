// import webpush from 'web-push';
const webpush = require('web-push');

module.exports = () => {
  webpush.setVapidDetails(
    'mailto:test@test.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
};
