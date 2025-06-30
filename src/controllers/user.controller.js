import { User } from "../models/user.model.js";
import { knex } from "../db.js";
import multipart from 'lambda-multipart-parser';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { uploadFile, getFileUrl, deleteFile } from '../utils/s3.js';

const isExpress = (res) => res && typeof res.status === "function";
const lambdaResponse = (statusCode, body) => ({
  statusCode,
  body: JSON.stringify(body),
});
const handleError = (error, res) => {
  const err = { error: error.message };
  if (isExpress(res)) return res.status(500).json(err);
  return lambdaResponse(500, err);
};

const getBody = (event, res) => {
  if (isExpress(res)) return event.body;
  try {
    return typeof event.body === "string" ? JSON.parse(event.body) : event.body;
  } catch {
    return {};
  }
};

const getId = (event, res) =>
  isExpress(res) ? event.params.id : event.pathParameters?.id;

export const createUser = async (event, res) => {
  const { name, email } = getBody(event, res);
  try {
    const user = await User.query().insert({ name, email });
    if (isExpress(res)) return res.status(201).json(user);
    return lambdaResponse(201, user);
  } catch (error) {
    return handleError(error, res);
  }
};

export const getAllUsers = async (event, res) => {
  let page, limit;
  if (isExpress(res)) {
    page = Math.max(1, parseInt(event.query?.page) || 1);
    limit = Math.max(1, parseInt(event.query?.limit) || 10);
  } else {
    const query = event.queryStringParameters || {};
    page = Math.max(1, parseInt(query.page) || 1);
    limit = Math.max(1, parseInt(query.limit) || 10);
  }
  const offset = (page - 1) * limit;
  try {
    const [users, total] = await Promise.all([
      User.query().orderBy("name").limit(limit).offset(offset),
      User.query().resultSize(),
    ]);
    const result = { users, total, page, limit };
    if (isExpress(res)) return res.status(200).json(result);
    return lambdaResponse(200, result);
  } catch (error) {
    return handleError(error, res);
  }
};

// For compatibility, export getAllUsersLambda as an alias to getAllUsers
export { getAllUsers as getAllUsersLambda };

export const getUserById = async (event, res) => {
  const id = getId(event, res);
  try {
    const user = await User.query().findById(id);
    if (!user) {
      const notFound = { error: "User not found" };
      if (isExpress(res)) return res.status(404).json(notFound);
      return lambdaResponse(404, notFound);
    }
    if (isExpress(res)) return res.status(200).json(user);
    return lambdaResponse(200, user);
  } catch (error) {
    return handleError(error, res);
  }
};

export const updateUser = async (event, res) => {
  const id = getId(event, res);
  const { name, email } = getBody(event, res);
  try {
    const updatedUser = await User.query().patchAndFetchById(id, {
      name,
      email,
    });
    if (!updatedUser) {
      const notFound = { error: "User not found" };
      if (isExpress(res)) return res.status(404).json(notFound);
      return lambdaResponse(404, notFound);
    }
    if (isExpress(res)) return res.status(200).json(updatedUser);
    return lambdaResponse(200, updatedUser);
  } catch (error) {
    return handleError(error, res);
  }
};

export const deleteUser = async (event, res) => {
  const id = getId(event, res);
  try {
    const numDeleted = await User.query().deleteById(id);
    if (!numDeleted) {
      const notFound = { error: "User not found" };
      if (isExpress(res)) return res.status(404).json(notFound);
      return lambdaResponse(404, notFound);
    }
    if (isExpress(res)) return res.status(204).send();
    return { statusCode: 204 };
  } catch (error) {
    return handleError(error, res);
  }
};

export const checkDbConnection = async () => {
  try {
    await knex.raw("SELECT 1+1 AS result");
    return lambdaResponse(200, { message: "Database connection successful" });
  } catch (error) {
    return lambdaResponse(500, { error: error.message });
  }
};

// uploading user profile image
// export const uploadUserProfile = async (event, res) => {
//   const id = getId(event, res);
//   if (isExpress(res)) {
//     // Express: handled by middleware, do nothing here
//     return res
//       .status(501)
//       .json({ error: "Not implemented in controller. Use route middleware." });
//   }
//   // Lambda/serverless: parse multipart and upload to S3
//   try {
//     const multipart = await import("lambda-multipart-parser");
//     const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
//     const { v4: uuidv4 } = await import("uuid");
//     const result = await multipart.default.parse(event);
//     if (!result.files || result.files.length === 0) {
//       return lambdaResponse(400, { error: "No file uploaded" });
//     }
//     const file = result.files[0];
//     const fileExt = file.filename.split(".").pop();
//     const key = `profiles/${id}-${uuidv4()}.${fileExt}`;
//     const s3 = new S3Client({ region: process.env.AWS_DEFAULT_REGION });
//     await s3.send(
//       new PutObjectCommand({
//         Bucket: process.env.AWS_S3_BUCKET_NAME,
//         Key: key,
//         Body: file.content,
//         ContentType: file.contentType,
//       })
//     );
//     const profileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_DEFAULT_REGION}.amazonaws.com/${key}`;
//     const updatedUser = await User.query().patchAndFetchById(id, {
//       profile: profileUrl,
//     });
//     if (!updatedUser) {
//       return lambdaResponse(404, { error: "User not found" });
//     }
//     return lambdaResponse(200, updatedUser);
//   } catch (error) {
//     return lambdaResponse(500, { error: error.message });
//   }
// };


export const uploadUserProfile = async (event, res) => {
  const id = getId(event, res);
  if (isExpress(res)) {
    return res.status(501).json({
      error: "Use the middleware route in Express for file uploads.",
    });
  }
  try {
    const { files } = await multipart.parse(event);
    if (!files || files.length === 0) {
      return lambdaResponse(400, { error: "No file uploaded" });
    }
    const file = files[0];
    const ext = file.filename.split(".").pop();
    const key = `profiles/${id}-${uuidv4()}.${ext}`;
    const url = await uploadFile({ key, body: file.content, contentType: file.contentType });
    const updatedUser = await User.query().patchAndFetchById(id, { profile: url });
    if (!updatedUser) {
      return lambdaResponse(404, { error: "User not found" });
    }
    return lambdaResponse(200, updatedUser);
  } catch (error) {
    return handleError(error, res);
  }
};

export const getUserProfileFile = async (event, res) => {
  const id = getId(event, res);
  try {
    const user = await User.query().findById(id);
    if (!user || !user.profile) {
      const notFound = { error: "User or profile not found" };
      if (isExpress(res)) return res.status(404).json(notFound);
      return lambdaResponse(404, notFound);
    }
    // Extract S3 key from URL
    const key = user.profile.split(`amazonaws.com/`)[1];
    const signedUrl = await getFileUrl(key);
    if (isExpress(res)) return res.status(200).json({ url: signedUrl });
    return lambdaResponse(200, { url: signedUrl });
  } catch (error) {
    return handleError(error, res);
  }
};

export const deleteUserProfileFile = async (event, res) => {
  const id = getId(event, res);
  try {
    const user = await User.query().findById(id);
    if (!user || !user.profile) {
      const notFound = { error: "User or profile not found" };
      if (isExpress(res)) return res.status(404).json(notFound);
      return lambdaResponse(404, notFound);
    }
    const key = user.profile.split(`amazonaws.com/`)[1];
    await deleteFile(key);
    await User.query().patchAndFetchById(id, { profile: null });
    if (isExpress(res)) return res.status(204).send();
    return { statusCode: 204 };
  } catch (error) {
    return handleError(error, res);
  }
};