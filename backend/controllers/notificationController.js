const Notification = require('../models/Notification');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { buildPagination } = require('../utils/pagination');

const getMyNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const filter = { user: req.user._id };
  if (unreadOnly === 'true') filter.isRead = false;

  const total = await Notification.countDocuments(filter);
  const notifications = await Notification.find(filter)
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  return ApiResponse.success(res, 200, 'Notifications fetched', notifications, buildPagination(page, limit, total));
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true, readAt: Date.now() },
    { new: true }
  );
  return ApiResponse.success(res, 200, 'Notification marked as read', notification);
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true, readAt: Date.now() });
  return ApiResponse.success(res, 200, 'All notifications marked as read');
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ user: req.user._id, isRead: false });
  return ApiResponse.success(res, 200, 'Unread count', { count });
});

module.exports = { getMyNotifications, markAsRead, markAllAsRead, getUnreadCount };
