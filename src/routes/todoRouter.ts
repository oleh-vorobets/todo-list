import express, {Router} from 'express';

import {getTasks, postTask, getTask, updateTask, deleteTask} from '../controllers/todoController.js';

const todoRouter: Router = express.Router();

todoRouter.route('/')
          .get(getTasks) // Get all tasks for a certain user
          .post(postTask); // Post task for certain user

todoRouter.route('/:id')
          .get(getTask) // Get certain user's task
          .patch(updateTask) // Update certain user's task
          .delete(deleteTask); // Delete certain user's task

export default todoRouter;