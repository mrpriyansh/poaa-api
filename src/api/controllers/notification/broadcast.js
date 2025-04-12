const webpush = require('web-push');
const Subscription = require('../../models/Subscription');

module.exports = async (_, res, next) => {
  try {
    const subscriptions = await Subscription.find();
    const notificationPromises = subscriptions.map((subs) => {
      return webpush.sendNotification(
        subs,
        JSON.stringify({
          title: 'Bhulna nahi!!',
          body: 'Aaaj paise laaye ho na... Darj bhi kar do!!!',
          icon: '/logo192.png',
          actions: [
            {
              action: 'ADD_INSTALLMENT',
              title: 'Add Installment',
            },
            {
              action: 'dismiss',
              title: 'Dismiss',
            },
          ],
        })
      );
    });
    const fullfilledPromises = await Promise.allSettled(notificationPromises);
    const failedEnpoints = fullfilledPromises
      .filter((promise) => promise.status === 'rejected')
      .map((promise) => promise.reason.endpoint);

    await Subscription.bulkWrite(
      failedEnpoints.map((endpoint) => {
        return {
          deleteOne: {
            filter: { endpoint },
          },
        };
      })
    );

    res.json('Notification sent');
  } catch (err) {
    next(err);
  }
};
