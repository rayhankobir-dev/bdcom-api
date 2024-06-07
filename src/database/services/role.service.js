import { RoleModel } from "../models/role.model";

async function findByCode(code) {
  return RoleModel.findOne({ code: code, status: true }).lean().exec();
}

async function findByCodes(codes) {
  return RoleModel.find({ code: { $in: codes }, status: true })
    .lean()
    .exec();
}

export default {
  findByCode,
  findByCodes,
};
