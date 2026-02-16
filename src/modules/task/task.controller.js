const prisma = require('../../config/prisma');

exports.createTask = async (req, res, next) => {
  try {
    const task = await prisma.task.create({
      data: {
        title: req.body.title,
        description: req.body.description,
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
    const tasks = req.user.role === 'ADMIN'
      ? await prisma.task.findMany()
      : await prisma.task.findMany({ where: { userId: req.user.id } });

    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await prisma.task.update({
      where: { id: Number(req.params.id) },
      data: req.body
    });
    res.json(task);
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    await prisma.task.delete({
      where: { id: Number(req.params.id) }
    });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
};
