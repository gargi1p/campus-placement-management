const AuditLog = require('../models/AuditLog');

const logActivity = async ({ userId, action, entity, entityId, changes, req }) => {
  try {
    await AuditLog.create({
      user: userId,
      action,
      entity,
      entityId,
      changes,
      ip: req?.ip || req?.headers?.['x-forwarded-for'],
      userAgent: req?.headers?.['user-agent'],
    });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
};

module.exports = { logActivity };
