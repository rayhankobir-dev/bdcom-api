import { Router } from "express";
import { SuccessResponse } from "../../core/ApiResponse.js";
import auth from "../../middlewares/auth.middleware.js";
import asyncHandler from "../../helpers/asyncHandler.js";
import { BadRequestError } from "../../core/ApiError.js";
import User from "../../database/services/user.service.js";
import bcrypt from "bcrypt";
import KeyService from "../../database/services/key.service.js";
import _ from "lodash";
import validator, { ValidationSource } from "../../helpers/validator.js";
import schema from "./schema.js";

const router = new Router();

router.use(auth);

router.post(
  "/change-password",
  validator(schema.credential),
  asyncHandler(async (req, res) => {
    const user = await User.findByEmail(req.body.email);
    if (!user) throw new BadRequestError("User do not exists");

    const passwordHash = await bcrypt.hash(req.body.password, 10);

    await User.updateInfo({
      _id: user._id,
      password: passwordHash,
    });

    await KeyService.removeAllForClient(user);

    new SuccessResponse(
      "User password updated",
      _.pick(user, ["_id", "name", "email"])
    ).send(res);
  })
);

export default router;
