// src/modules/task/task.routes.js
const express  = require('express');
const router   = express.Router();
const ctrl     = require('./task.controller');
const { authenticate }   = require('../../middlewares/auth.middleware');
const { authorize }      = require('../../middlewares/rbac.middleware');
const validate           = require('../../middlewares/validate.middleware');
const { cache }          = require('../../middlewares/cache.middleware');
const { createTaskSchema, updateTaskSchema, taskQuerySchema } = require('./task.schema');

// All task routes require a valid JWT
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task CRUD — paginated, filtered, sorted
 */

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get your tasks (paginated + filtered)
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [createdAt, updatedAt, title, status], default: createdAt }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, IN_PROGRESS, COMPLETED] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search in title and description
 *     responses:
 *       200:
 *         description: Paginated task list
 */
router.get('/', validate(taskQuerySchema, 'query'), cache(60), ctrl.getAllTasks);

/**
 * @swagger
 * /tasks/all:
 *   get:
 *     summary: Get ALL tasks — admin only
 *     tags: [Tasks]
 *     responses:
 *       200: { description: All tasks paginated }
 *       403: { description: Admin only }
 */
router.get('/all', authorize('ADMIN'), validate(taskQuerySchema, 'query'), cache(30), ctrl.getAllTasks);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a single task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Task found }
 *       403: { description: Not your task }
 *       404: { description: Task not found }
 */
router.get('/:id', ctrl.getTaskById);

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:       { type: string, example: Fix login bug }
 *               description: { type: string }
 *               status:      { type: string, enum: [PENDING, IN_PROGRESS, COMPLETED] }
 *     responses:
 *       201: { description: Task created }
 *       422: { description: Validation error }
 */
router.post('/', validate(createTaskSchema), ctrl.createTask);

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:       { type: string }
 *               description: { type: string }
 *               status:      { type: string, enum: [PENDING, IN_PROGRESS, COMPLETED] }
 *     responses:
 *       200: { description: Task updated }
 *       403: { description: Not your task }
 *       404: { description: Task not found }
 */
router.put('/:id', validate(updateTaskSchema), ctrl.updateTask);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Task deleted }
 *       403: { description: Not your task }
 *       404: { description: Task not found }
 */
router.delete('/:id', ctrl.deleteTask);

module.exports = router;
