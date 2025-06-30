import express from 'express';
import * as userController from '../controllers/user.controller.js';

const router = express.Router();

// These routes are for local development/testing only.
// Lambda handlers are exported directly from userHandlers.js for serverless deployment.
router.post('/create', userController.createUser);
router.get('/all', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
// Add route for uploading user profile image
router.post('/:id/profile', userController.uploadUserProfile);

export default router;
