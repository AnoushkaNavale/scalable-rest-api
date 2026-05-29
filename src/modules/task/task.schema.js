// src/modules/task/task.schema.js
const { z } = require('zod');

const createTaskSchema = z.object({
  title:       z.string().min(1, 'Title is required').max(200).trim(),
  description: z.string().max(2000).trim().optional(),
  status:      z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).default('PENDING'),
});

const updateTaskSchema = createTaskSchema.partial();

const taskQuerySchema = z.object({
  page:    z.coerce.number().int().positive().default(1),
  limit:   z.coerce.number().int().min(1).max(100).default(10),
  sortBy:  z.enum(['createdAt', 'updatedAt', 'title', 'status']).default('createdAt'),
  order:   z.enum(['asc', 'desc']).default('desc'),
  status:  z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  search:  z.string().max(100).trim().optional(),
});

module.exports = { createTaskSchema, updateTaskSchema, taskQuerySchema };
