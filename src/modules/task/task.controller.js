// src/modules/task/task.controller.js
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse  = require('../../utils/ApiResponse');
const taskService  = require('./task.service');

const getAllTasks = asyncHandler(async (req, res) => {
  const result = await taskService.getTasks(req.user.id, req.user.role, req.query);
  res.json(new ApiResponse(200, result));
});

const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.id, req.user.id, req.user.role);
  res.json(new ApiResponse(200, task));
});

const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.user.id, req.body);
  res.status(201).json(new ApiResponse(201, task, 'Task created'));
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.user.id, req.user.role, req.body);
  res.json(new ApiResponse(200, task, 'Task updated'));
});

const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.params.id, req.user.id, req.user.role);
  res.json(new ApiResponse(200, null, 'Task deleted'));
});

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask };
