const Notification = require('../models/Notification');

const createNotification = async ({ userId, type, title, message, relatedEntity }) => {
  return Notification.create({
    user: userId,
    type,
    title,
    message,
    relatedEntity,
  });
};

const notifyMany = async (userIds, { type, title, message, relatedEntity }) => {
  const notifications = userIds.map((userId) => ({
    user: userId,
    type,
    title,
    message,
    relatedEntity,
  }));
  return Notification.insertMany(notifications);
};

module.exports = { createNotification, notifyMany };
