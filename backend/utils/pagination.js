const buildPagination = (page, limit, total) => {
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const perPage = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const totalPages = Math.ceil(total / perPage) || 1;

  return {
    page: currentPage,
    limit: perPage,
    total,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};

const parseSort = (sortStr, allowedFields, defaultSort = '-createdAt') => {
  if (!sortStr) return defaultSort;
  const field = sortStr.replace(/^-/, '');
  if (!allowedFields.includes(field)) return defaultSort;
  return sortStr;
};

const buildSearchQuery = (search, fields) => {
  if (!search) return {};
  const regex = new RegExp(search, 'i');
  return { $or: fields.map((field) => ({ [field]: regex })) };
};

module.exports = { buildPagination, parseSort, buildSearchQuery };
