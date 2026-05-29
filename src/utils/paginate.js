// src/utils/paginate.js
// Shared pagination, sorting, and response wrapper for all list endpoints.

/**
 * Parse pagination params from req.query (already Zod-coerced).
 * @param {{ page?: number, limit?: number, sortBy?: string, order?: string }} query
 */
function parsePagination(query) {
  const page  = Math.max(1, Number(query.page)  || 1);
  const limit = Math.min(100, Number(query.limit) || 10);
  const skip  = (page - 1) * limit;

  const sortBy = query.sortBy || 'createdAt';
  const order  = query.order === 'asc' ? 'asc' : 'desc';

  return { skip, take: limit, page, limit, orderBy: { [sortBy]: order } };
}

/**
 * Wrap data in a standardized paginated envelope.
 */
function paginatedResponse(data, total, page, limit) {
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages:  Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
}

module.exports = { parsePagination, paginatedResponse };
