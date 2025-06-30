import serverless from 'serverless-http';
import app from './app.js';
import {
  getAllUsersLambda,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  checkDbConnection,
  uploadUserProfile,
  getUserProfileFile,
  deleteUserProfileFile
} from './controllers/user.controller.js';

export const handler = serverless(app);
export { getAllUsersLambda, getUserById, createUser, updateUser, deleteUser, checkDbConnection, uploadUserProfile, getUserProfileFile, deleteUserProfileFile };
// For backward compatibility, also export getAllUsers as getAllUsersLambda
export { getAllUsersLambda as getAllUsers };
