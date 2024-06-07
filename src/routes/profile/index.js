import { Router } from "express";
import User from "../../database/services/user.service.js";
import { SuccessResponse } from "../../core/ApiResponse.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { BadRequestError } from "../../core/ApiError.js";
import asyncHandler from "../../helpers/asyncHandler.js";

const router = new Router();

/*-------------------------------------------------------------------------*/
router.use(authMiddleware);
/*-------------------------------------------------------------------------*/

router.get(
  "/my",
  asyncHandler(async (req, res) => {
    const user = await User.findPrivateProfileById(req.user._id);
    if (!user) throw new BadRequestError("User not registered");

    return new SuccessResponse(
      "success",
      _.pick(user, ["name", "email", "roles"])
    ).send(res);
  })
);

export default router;
