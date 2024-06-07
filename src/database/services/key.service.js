import { KeystoreModel } from "../models/keystore.model.js";

async function findforKey(client, key) {
  return KeystoreModel.findOne({
    client: client,
    primaryKey: key,
    status: true,
  })
    .lean()
    .exec();
}

async function remove(id) {
  return KeystoreModel.findByIdAndDelete(id).lean().exec();
}

async function removeAllForClient(client) {
  return KeystoreModel.deleteMany({ client: client }).exec();
}

async function find(client, primaryKey, secondaryKey) {
  return KeystoreModel.findOne({
    client: client,
    primaryKey: primaryKey,
    secondaryKey: secondaryKey,
  })
    .lean()
    .exec();
}

async function create(client, primaryKey, secondaryKey) {
  const keystore = await KeystoreModel.create({
    client: client,
    primaryKey: primaryKey,
    secondaryKey: secondaryKey,
  });
  return keystore.toObject();
}

export default {
  findforKey,
  remove,
  removeAllForClient,
  find,
  create,
};
