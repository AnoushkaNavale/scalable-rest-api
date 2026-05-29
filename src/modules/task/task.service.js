// src/modules/task/task.service.js
const prisma   = require('../../config/prisma');
const ApiError = require('../../utils/ApiError');
const { parsePagination, paginatedResponse } = require('../../utils/paginate');
const { invalidateCache } = require('../../middlewares/cache.middleware');

// ─── Get Tasks (paginated + filtered + searched) ─────────────────────────────
const getTasks = async (userId, role, query) => {
  const { skip, take, page, limit, orderBy } = parsePagination(query);
  const { status, search } = query;

  const where = {
    // Admins see all tasks; regular users see only their own
    ...(role !== 'ADMIN' && { userId }),
    ...(status && { status }),
    ...(search && {
      OR: [
        { title:       { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  // Atomic count + fetch — prevents race conditions on paginated data
  const [tasks, total] = await prisma.$transaction([
    prisma.task.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.task.count({ where }),
  ]);

  return paginatedResponse(tasks, total, page, limit);
};

// ─── Get Single Task ─────────────────────────────────────────────────────────
const getTaskById = async (id, userId, role) => {
  const task = await prisma.task.findUnique({
    where:   { id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  if (!task) throw new ApiError(404, 'Task not found');
  if (role !== 'ADMIN' && task.userId !== userId) throw new ApiError(403, 'Forbidden');

  return task;
};

// ─── Create Task ─────────────────────────────────────────────────────────────
const createTask = async (userId, data) => {
  const task = await prisma.task.create({
    data:    { ...data, userId },
    include: { user: { select: { id: true, name: true } } },
  });

  // Invalidate this user's task list cache
  await invalidateCache(`cache:${userId}:*`);

  return task;
};

// ─── Update Task ─────────────────────────────────────────────────────────────
const updateTask = async (id, userId, role, data) => {
  await getTaskById(id, userId, role); // ownership/existence check

  const task = await prisma.task.update({
    where:   { id },
    data,
    include: { user: { select: { id: true, name: true } } },
  });

  await invalidateCache(`cache:${userId}:*`);
  if (role === 'ADMIN') await invalidateCache(`cache:*:*`); // admins see all

  return task;
};

// ─── Delete Task ─────────────────────────────────────────────────────────────
const deleteTask = async (id, userId, role) => {
  await getTaskById(id, userId, role); // ownership/existence check

  await prisma.task.delete({ where: { id } });

  await invalidateCache(`cache:${userId}:*`);
  if (role === 'ADMIN') await invalidateCache(`cache:*:*`);
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask };
