const express = require('express');
const { body, param } = require('express-validator');
const controller = require('./task.controller');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { roleMiddleware } = require('../../middlewares/role.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');

const router = express.Router();

router.use(authMiddleware);

const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Task id must be a positive integer')
];

const createTaskValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage('Title is required and must be at most 120 characters')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be at most 500 characters')
    .escape(),
  body('status')
    .optional()
    .isIn(['PENDING', 'COMPLETED'])
    .withMessage('Status must be PENDING or COMPLETED')
];

const updateTaskValidation = [
  ...idValidation,
  body().custom((value, { req }) => {
    const allowed = ['title', 'description', 'status'];
    const hasUpdateField = allowed.some((field) => Object.prototype.hasOwnProperty.call(req.body, field));

    if (!hasUpdateField) {
      throw new Error('At least one field (title, description, status) is required');
    }

    return true;
  }),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage('Title must be between 1 and 120 characters')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be at most 500 characters')
    .escape(),
  body('status')
    .optional()
    .isIn(['PENDING', 'COMPLETED'])
    .withMessage('Status must be PENDING or COMPLETED')
];

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management APIs
 *
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 101
 *         title:
 *           type: string
 *           example: Prepare release notes
 *         description:
 *           type: string
 *           example: Include bug fixes and known issues
 *           nullable: true
 *         status:
 *           type: string
 *           enum: [PENDING, COMPLETED]
 *           example: PENDING
 *         userId:
 *           type: integer
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *     CreateTaskRequest:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           example: Prepare release notes
 *         description:
 *           type: string
 *           example: Include bug fixes and known issues
 *         status:
 *           type: string
 *           enum: [PENDING, COMPLETED]
 *           example: PENDING
 *     UpdateTaskRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: Update release notes
 *         description:
 *           type: string
 *           example: Add deployment checklist
 *         status:
 *           type: string
 *           enum: [PENDING, COMPLETED]
 *           example: COMPLETED
 *
 * /tasks:
 *   get:
 *     summary: Get tasks owned by authenticated user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskRequest'
 *     responses:
 *       201:
 *         description: Created task
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *
 * /tasks/all:
 *   get:
 *     summary: Get all tasks (admin only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *
 * /tasks/{id}:
 *   get:
 *     summary: Get one task by id (owner or admin)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 *   put:
 *     summary: Update one task by id (owner or admin)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTaskRequest'
 *     responses:
 *       200:
 *         description: Updated task
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Task not found
 *   delete:
 *     summary: Delete one task by id (owner or admin)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       404:
 *         description: Task not found
 */
router.get('/', controller.getTasks);
router.get('/all', roleMiddleware('ADMIN'), controller.getAllTasks);
router.get('/:id', idValidation, validateRequest, controller.getTaskById);
router.post('/', createTaskValidation, validateRequest, controller.createTask);
router.put('/:id', updateTaskValidation, validateRequest, controller.updateTask);
router.delete('/:id', idValidation, validateRequest, controller.deleteTask);

module.exports = router;
