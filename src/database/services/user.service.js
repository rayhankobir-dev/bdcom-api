import { InternalError } from "../../core/ApiError.js";
import { RoleModel } from "../models/role.model.js";
import { UserModel } from "../models/user.model.js";
import KeyService from "./key.service.js";
import redis from "../../cache/index.js";

const cacheUser = async (userId, user) => {
  await redis.set(`user:${userId}`, JSON.stringify(user), "EX", 600);
};

const getCachedUser = async (userId) => {
  const cachedUser = await redis.get(`user:${userId}`);
  return cachedUser ? JSON.parse(cachedUser) : null;
};

const invalidateCache = async (userId) => {
  await redis.del(`user:${userId}`);
};

async function exists(id) {
  const user = await UserModel.exists({ _id: id });
  return user !== null && user !== undefined;
}

async function findPrivateProfileById(id) {
  let user = await getCachedUser(id);
  if (!user) {
    user = await UserModel.findOne({ _id: id, status: true })
      .select("+email")
      .populate({
        path: "roles",
        match: { status: true },
        select: { code: 1 },
      })
      .lean()
      .exec();
    if (user) await cacheUser(id, user);
  }
  return user;
}

async function findById(id) {
  let user = await getCachedUser(id);
  if (!user) {
    user = await UserModel.findOne({ _id: id, status: true })
      .select("+email +password +roles")
      .populate({
        path: "roles",
        match: { status: true },
      })
      .lean()
      .exec();
    if (user) await cacheUser(id, user);
  }
  return user;
}

async function findByEmail(email) {
  let user = await getCachedUser(email);
  if (user) return user;

  user = await UserModel.findOne({ email: email })
    .select("+email +password +roles")
    .populate({
      path: "roles",
      match: { status: true },
      select: { code: 1 },
    })
    .lean()
    .exec();
  if (user) await cacheUser(user._id, user); // Cache by user ID

  if (user) await cacheUser(email, user);
  return user;
}

async function create(user, accessTokenKey, refreshTokenKey, roleCode) {
  const role = await RoleModel.findOne({ code: roleCode })
    .select("+code")
    .lean()
    .exec();
  if (!role) throw new InternalError("Role must be defined");

  user.roles = [role];

  const createdUser = await UserModel.create(user);
  const keystore = await KeyService.create(
    createdUser,
    accessTokenKey,
    refreshTokenKey
  );

  // Cache the created user
  await cacheUser(createdUser._id, createdUser);

  return {
    user: { ...createdUser.toObject(), roles: user.roles },
    keys: keystore,
  };
}

async function update(user, accessTokenKey, refreshTokenKey) {
  user.updatedAt = new Date();

  await UserModel.updateOne({ _id: user._id }, { $set: { ...user } })
    .lean()
    .exec();
  const keystore = await KeyService.create(
    user,
    accessTokenKey,
    refreshTokenKey
  );

  // Invalidate cache for the updated user
  await invalidateCache(user._id);

  return { user: user, keystore: keystore };
}

async function updateInfo(user) {
  user.updatedAt = new Date();

  const updatedUser = await UserModel.updateOne(
    { _id: user._id },
    { $set: { ...user } }
  )
    .lean()
    .exec();

  // Invalidate cache for the updated user
  await invalidateCache(user._id);

  return updatedUser;
}

export default {
  exists,
  findPrivateProfileById,
  findById,
  findByEmail,
  create,
  update,
  updateInfo,
};
