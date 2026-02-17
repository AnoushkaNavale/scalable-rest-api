const prisma = require('../../config/prisma');

const findAccessibleTask = (taskId, user) => {
  if (user.role === 'ADMIN') {
    return prisma.task.findUnique({ where: { id: taskId } });
  }

  return prisma.task.findFirst({
    where: {
      id: taskId,
      userId: user.id
    }
  });
};

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        userId: req.user.id
      }
    });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

exports.getAllTasks = async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

exports.getTaskById = async (req, res, next) => {
  try {
    const taskId = Number(req.params.id);
    const task = await findAccessibleTask(taskId, req.user);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json(task);
  } catch (err) {
    return next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const taskId = Number(req.params.id);
    const existingTask = await findAccessibleTask(taskId, req.user);

    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const updateData = {};
    ['title', 'description', 'status'].forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updateData[field] = req.body[field];
      }
    });

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData
    });

    return res.json(task);
  } catch (err) {
    return next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const taskId = Number(req.params.id);
    const existingTask = await findAccessibleTask(taskId, req.user);

    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    return res.json({ message: 'Deleted successfully' });
  } catch (err) {
    return next(err);
  }
};
